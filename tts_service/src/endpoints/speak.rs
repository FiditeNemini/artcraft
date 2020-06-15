use actix_web::http::{StatusCode, header};
use actix_web::web::{
  Data,
  Json,
};
use actix_web::{
  HttpRequest,
  HttpResponse,
};

use std::sync::Arc;
use crate::AppState;
use arpabet::Arpabet;
use crate::text::arpabet::text_to_arpabet_encoding;
use crate::model::model_config::ModelPipeline;
use crate::model::old_model::TacoMelModel;
use crate::text::cleaners::clean_text;
use crate::model::pipelines::{arpabet_glow_tts_melgan_pipeline, arpabet_glow_tts_multi_speaker_melgan_pipeline};
use crate::database::model::NewSentence;

#[derive(Deserialize)]
pub struct SpeakRequest {
  /// Slug for the speaker
  speaker: String,
  /// Raw text to be spoken
  text: String,
}

pub async fn post_speak(request: HttpRequest,
  query: Json<SpeakRequest>,
  app_state: Data<Arc<AppState>>
) -> std::io::Result<HttpResponse> {
  let app_state = app_state.into_inner();

  let speaker_slug = query.speaker.to_string();

  let speaker = match app_state.model_configs.find_speaker_by_slug(&speaker_slug) {
    Some(speaker) => speaker,
    None => {
      return Ok(HttpResponse::build(StatusCode::NOT_FOUND)
          .content_type("text/plain")
          .body("Speaker not found"));
    },
  };

  let text = query.text.to_string();

  if text.is_empty() {
    return Ok(HttpResponse::build(StatusCode::BAD_REQUEST)
        .content_type("text/plain")
        .body("Request has empty text."));
  }

  // NB: Actually, we want the X-Forwarded-For IP address, since otherwise
  // we get the load balancer.
  let ip_address = request.connection_info()
      .remote()
      .unwrap_or("")
      .to_string();

  let sentence_record = NewSentence {
    sentence: text.clone(),
    speaker: speaker_slug.clone(),
    ip_address: ip_address,
  };

  match sentence_record.insert(&app_state.database_connector) {
    Err(_) => error!("Could not insert sentence record for: {:?}", sentence_record),
    Ok(_) => {},
  }

  let cleaned_text = clean_text(&text);

  match speaker.model_pipeline {
    ModelPipeline::ArpabetTacotronMelgan => {
      let tacotron_model = speaker.tacotron
          .as_ref()
          .map(|s| s.clone())
          .expect("TODO ERROR HANDLING");

      let melgan_model = speaker.melgan
          .as_ref()
          .map(|s| s.clone())
          .expect("TODO ERROR HANDLING");

      info!("Tacotron Model: {}", tacotron_model);
      info!("Melgan Model: {}", melgan_model);
      info!("Text: {}", text);

      let arpabet = Arpabet::load_cmudict();
      let encoded = text_to_arpabet_encoding(arpabet, &cleaned_text);

      let tacotron = app_state.model_cache.get_or_load_arbabet_tacotron(&tacotron_model)
          .expect(&format!("Couldn't load tacotron model: {}", tacotron_model));

      let melgan = app_state.model_cache.get_or_load_melgan(&melgan_model)
          .expect(&format!("Couldn't load melgan model: {}", melgan_model));

      match TacoMelModel::new().run_tts_encoded(&tacotron, &melgan, &encoded) {
        None => {
          Ok(HttpResponse::build(StatusCode::TOO_MANY_REQUESTS)
              .content_type("text/plain")
              .body("The service is receiving too many requests. Although there are many worker \
                     containers, model access is serialized on a per-container basis until the \
                     segfaults are fixed."))
        },
        Some(wav_data) => {
          // To make iOS Safari work, you need a Content-Range and Content-Length header:
          // https://stackoverflow.com/a/17835399
          let content_range_value = format!("bytes 0-{}/{}", wav_data.len(), wav_data.len());
          Ok(HttpResponse::build(StatusCode::OK)
              .content_type("audio/wav")
              .set_header(header::CONTENT_DISPOSITION, "attachment; filename = \"generated.wav\"")
              .set_header(header::CONTENT_RANGE, content_range_value)
              .body(wav_data))
        },
      }
    },
    ModelPipeline::ArpabetGlowTtsMelgan => {
      let glow_tts_model = speaker.glow_tts
          .as_ref()
          .map(|s| s.clone())
          .expect("TODO ERROR HANDLING");

      let melgan_model = speaker.melgan
          .as_ref()
          .map(|s| s.clone())
          .expect("TODO ERROR HANDLING");

      info!("Glow-TTS Model: {}", glow_tts_model);
      info!("Melgan Model: {}", melgan_model);
      info!("Text: {}", text);

      let glow_tts = app_state.model_cache.get_or_load_arbabet_glow_tts(&glow_tts_model)
          .expect(&format!("Couldn't load glow-tts model: {}", glow_tts_model));

      let melgan = app_state.model_cache.get_or_load_melgan(&melgan_model)
          .expect(&format!("Couldn't load melgan model: {}", melgan_model));

      let wav_data = arpabet_glow_tts_melgan_pipeline(&cleaned_text, &glow_tts, &melgan);

      // To make iOS Safari work, you need a Content-Range and Content-Length header:
      // https://stackoverflow.com/a/17835399
      let content_range_value = format!("bytes 0-{}/{}", wav_data.len(), wav_data.len());
      Ok(HttpResponse::build(StatusCode::OK)
          .content_type("audio/wav")
          .set_header(header::CONTENT_DISPOSITION, "attachment; filename = \"generated.wav\"")
          .set_header(header::CONTENT_RANGE, content_range_value)
          .body(wav_data))
    },
    ModelPipeline::ArpabetGlowTtsMultiSpeakerMelgan=> {
      let glow_tts_multi_speaker_model = speaker.glow_tts_multi_speaker
          .as_ref()
          .map(|s| s.clone())
          .expect("TODO ERROR HANDLING");

      let melgan_model = speaker.melgan
          .as_ref()
          .map(|s| s.clone())
          .expect("TODO ERROR HANDLING");

      info!("Glow-TTS Multi-Speaker Model: {}", glow_tts_multi_speaker_model);
      info!("Melgan Model: {}", melgan_model);
      info!("Text: {}", text);

      let speaker_id = speaker.speaker_id.expect("Should have speaker_id");

      let glow_tts_multi_speaker = app_state
          .model_cache
          .get_or_load_arbabet_glow_tts_multi_speaker(&glow_tts_multi_speaker_model)
          .expect(&format!("Couldn't load glow-tts multi-speaker model: {}", glow_tts_multi_speaker_model));

      let melgan = app_state
          .model_cache
          .get_or_load_melgan(&melgan_model)
          .expect(&format!("Couldn't load melgan model: {}", melgan_model));

      let wav_data = arpabet_glow_tts_multi_speaker_melgan_pipeline(
        &cleaned_text, speaker_id, &glow_tts_multi_speaker, &melgan);

      // To make iOS Safari work, you need a Content-Range and Content-Length header:
      // https://stackoverflow.com/a/17835399
      let content_range_value = format!("bytes 0-{}/{}", wav_data.len(), wav_data.len());
      Ok(HttpResponse::build(StatusCode::OK)
          .content_type("audio/wav")
          .set_header(header::CONTENT_DISPOSITION, "attachment; filename = \"generated.wav\"")
          .set_header(header::CONTENT_RANGE, content_range_value)
          .body(wav_data))
    },
    ModelPipeline::RawTextTacotronMelgan => unimplemented!(),
  }
}
