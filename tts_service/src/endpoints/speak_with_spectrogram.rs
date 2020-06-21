use actix_web::http::{StatusCode, header};
use actix_web::web::{
  Data,
  Json,
};
use actix_web::{
  Either,
  HttpRequest,
  HttpResponse,
};

use arpabet::Arpabet;
use crate::AppState;
use crate::database::model::NewSentence;
use crate::inference::inference::InferencePipelineStart;
use crate::inference::pipelines::glowtts_melgan::GlowTtsMelganPipeline;
use crate::inference::pipelines::glowtts_multispeaker_melgan::{GlowTtsMultiSpeakerMelganPipeline, GlowTtsMultiSpeakerMelganPipelineMelDone};
use crate::inference::spectrogram::Base64MelSpectrogram;
use crate::model::model_config::ModelPipeline;
use crate::model::old_model::TacoMelModel;
use crate::model::pipelines::{arpabet_glow_tts_melgan_pipeline, arpabet_glow_tts_multi_speaker_melgan_pipeline, arpabet_glow_tts_melgan_pipeline_with_spectrogram, arpabet_glow_tts_multi_speaker_melgan_pipeline_with_spectrogram};
use crate::text::arpabet::text_to_arpabet_encoding;
use crate::text::cleaners::clean_text;
use std::sync::Arc;

#[derive(Deserialize)]
pub struct SpeakRequest {
  /// Slug for the speaker
  speaker: String,
  /// Raw text to be spoken
  text: String,
}

#[derive(Serialize, Default)]
pub struct Spectrogram {
  pub bytes_base64: String,
  pub width: i64,
  pub height: i64,
}

#[derive(Serialize)]
pub struct SpeakSpectrogramResponse {
  pub audio_base64: String,
  pub spectrogram: Base64MelSpectrogram,
}

pub async fn post_speak_with_spectrogram(request: HttpRequest,
  query: Json<SpeakRequest>,
  app_state: Data<Arc<AppState>>)
  -> Either<Json<SpeakSpectrogramResponse>, std::io::Result<HttpResponse>>
{
  let app_state = app_state.into_inner();

  let speaker_slug = query.speaker.to_string();

  let speaker = match app_state.model_configs.find_speaker_by_slug(&speaker_slug) {
    Some(speaker) => speaker,
    None => {
      return Either::B(Ok(HttpResponse::build(StatusCode::NOT_FOUND)
          .content_type("text/plain")
          .body("Speaker not found")));
    },
  };

  let text = query.text.to_string();

  if text.is_empty() {
    return Either::B(Ok(HttpResponse::build(StatusCode::BAD_REQUEST)
        .content_type("text/plain")
        .body("Request has empty text.")));
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

  let (base64_image, base64_audio) = match speaker.model_pipeline {
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

      let pipeline = GlowTtsMelganPipeline::new(&glow_tts, &melgan)
          .infer_mel(&cleaned_text, 0)
          .unwrap()
          .infer_audio()
          .unwrap();

      let base64_image = pipeline.get_base64_mel_spectrogram().unwrap();
      let base64_audio = pipeline.get_base64_audio().unwrap();

      (base64_image, base64_audio)
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


      let pipeline = GlowTtsMultiSpeakerMelganPipeline::new(&glow_tts_multi_speaker, &melgan)
          .infer_mel(&cleaned_text, speaker_id)
          .unwrap()
          .infer_audio()
          .unwrap();

      let base64_image = pipeline.get_base64_mel_spectrogram().unwrap();
      let base64_audio = pipeline.get_base64_audio().unwrap();

      (base64_image, base64_audio)
    },
    ModelPipeline::RawTextTacotronMelgan => unimplemented!(),
    ModelPipeline::ArpabetTacotronMelgan => unimplemented!(),
  };

  Either::A(Json(SpeakSpectrogramResponse {
    audio_base64: base64_audio.bytes_base64,
    spectrogram: base64_image,
  }))
}
