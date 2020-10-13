use actix_web::http::{StatusCode, header, HeaderName, HeaderValue};
use actix_web::web::{
  Data,
  Json,
};
use actix_web::{
  HttpRequest,
  HttpResponse,
  Result as ActixResult,
};

use arpabet;
use crate::AppState;
use crate::database::model::NewSentence;
use crate::endpoints::helpers::ip_address::get_request_ip;
use crate::endpoints::speak::api::{SpeakRequest, SpeakError};
use crate::model::model_config::ModelPipeline;
use crate::model::old_model::TacoMelModel;
use crate::model::pipelines::{arpabet_glow_tts_melgan_pipeline, arpabet_glow_tts_multi_speaker_melgan_pipeline};
use crate::text::arpabet::text_to_arpabet_encoding;
use crate::text::cleaners::clean_text;
use futures::future::FutureResult;
use futures::{future, Future, Lazy, SelectNext, MapErr};
use limitation::Status;
use std::sync::Arc;
use std::thread;
use std::time::Duration;

pub async fn post_speak(request: HttpRequest,
  query: Json<SpeakRequest>,
  app_state: Data<Arc<AppState>>)
  -> ActixResult<HttpResponse, SpeakError>
{
  let app_state = app_state.into_inner();

  let ip_address = get_request_ip(&request);

  if let Err(_err) = app_state.rate_limiter.maybe_ratelimit_request(&ip_address, &request.headers(), &query) {
    return Err(SpeakError::rate_limited());
  }

  app_state.stats_recorder.record_stats(&query.speaker, &query.text, &ip_address);

  let speaker_slug = query.speaker.to_string();

  let speaker = match app_state.model_configs.find_speaker_by_slug(&speaker_slug) {
    Some(speaker) => speaker,
    None => {
      return Err(SpeakError::unknown_speaker());
    },
  };

  let sample_rate_hz = speaker.sample_rate_hz.unwrap_or(app_state.default_sample_rate_hz);

  let text = query.text.to_string();

  if text.is_empty() {
    return Err(SpeakError::generic_bad_request("Request has empty text."));
  }

  app_state.sentence_recorder.record_sentence(&speaker_slug, &text, &ip_address);

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

      let cmudict = arpabet::load_cmudict();
      let encoded = text_to_arpabet_encoding(cmudict, &cleaned_text);

      let tacotron = app_state.model_cache.get_or_load_arbabet_tacotron(&tacotron_model)
          .expect(&format!("Couldn't load tacotron model: {}", tacotron_model));

      let melgan = app_state.model_cache.get_or_load_melgan(&melgan_model)
          .expect(&format!("Couldn't load melgan model: {}", melgan_model));

      match TacoMelModel::new().run_tts_encoded(&tacotron, &melgan, &encoded, sample_rate_hz) {
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

      if query.reload_model && app_state.allow_model_reload {
        warn!("Forgetting models for reload.");
        app_state.model_cache.forget_arpabet_glow_tts(&glow_tts_model);
        app_state.model_cache.forget_melgan(&melgan_model);
      }

      let glow_tts = app_state.model_cache.get_or_load_arbabet_glow_tts(&glow_tts_model)
          .expect(&format!("Couldn't load glow-tts model: {}", glow_tts_model));

      let melgan = app_state.model_cache.get_or_load_melgan(&melgan_model)
          .expect(&format!("Couldn't load melgan model: {}", melgan_model));

      let wav_data = arpabet_glow_tts_melgan_pipeline(
        &cleaned_text,
        &glow_tts,
        &melgan,
        sample_rate_hz,
        &app_state.arpabet,
        &app_state.g2p_model);

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
        &cleaned_text,
        speaker_id,
        &glow_tts_multi_speaker,
        &melgan,
        sample_rate_hz,
        &app_state.arpabet,
        &app_state.g2p_model);

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
