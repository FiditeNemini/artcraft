use actix_web::http::StatusCode;
use actix_web::web::{Data, Query};
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
use crate::database::model::NewSentence;
use crate::text::cleaners::clean_text;
use crate::model::pipelines::{arpabet_tacotron_melgan_pipeline, arpabet_glow_tts_melgan_pipeline};

/// Example request: v=trump&vol=3&s=this is funny isn't it
#[derive(Deserialize)]
pub struct LegacyGetSpeakRequest {
  /// Voice slug
  v: Option<String>,
  /// Sentence
  s: Option<String>,
  /// Volume. Not used.
  vol: Option<i32>,
}

pub async fn legacy_get_speak(request: HttpRequest,
  query: Query<LegacyGetSpeakRequest>,
  app_state: Data<Arc<AppState>>
) -> std::io::Result<HttpResponse> {

  let speaker = match query.v.as_ref() {
    None => {
      return Ok(HttpResponse::build(StatusCode::BAD_REQUEST)
          .content_type("text/plain")
          .body("Speaker parameter missing."));
    },
    Some(v) => v.trim().to_string(),
  };

  let text = match query.s.as_ref() {
    None => {
      return Ok(HttpResponse::build(StatusCode::BAD_REQUEST)
          .content_type("text/plain")
          .body("Text parameter missing."));
    },
    Some(s) => s.trim().to_string(),
  };

  if speaker.is_empty() || text.is_empty() {
    return Ok(HttpResponse::build(StatusCode::BAD_REQUEST)
        .content_type("text/plain")
        .body("Request has an empty speaker or text"));
  }

  info!("Speaker: {}, Text: {}", speaker, text);

  let app_state = app_state.into_inner();

  // NB: There is also `request.connection_info().remote()`, which contains
  // proxy info via X-Forwarded-For, etc.
  /*let ip_address = request.peer_addr()
      .map(|socket| socket.to_string())
      .unwrap_or("".to_string());*/

  // NB: Actually, we want the X-Forwarded-For IP address, since otherwise
  // we get the load balancer.
  let ip_address = request.connection_info()
      .remote()
      .unwrap_or("")
      .to_string();

  let sentence_record = NewSentence {
    sentence: text.clone(),
    speaker: speaker.clone(),
    ip_address: ip_address,
  };

  match sentence_record.insert(&app_state.database_connector) {
    Err(_) => error!("Could not insert sentence record for: {:?}", sentence_record),
    Ok(_) => {},
  }

  let speaker = match app_state.model_configs.find_speaker_by_slug(&speaker) {
    Some(speaker) => speaker,
    None => {
      return Ok(HttpResponse::build(StatusCode::NOT_FOUND)
          .content_type("text/plain")
          .body("Speaker not found"));
    },
  };

  let cleaned_text = clean_text(&text);

  if let Some(err) = app_state.text_checker.check_text(&cleaned_text) {
    return Ok(HttpResponse::build(StatusCode::BAD_REQUEST)
        .content_type("text/plain")
        .body(format!("Bad input: {}", err.description())));
  }

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

      debug!("Tacotron Model: {}", tacotron_model);
      debug!("Melgan Model: {}", melgan_model);

      let tacotron = match app_state.model_cache.get_or_load_arbabet_tacotron(&tacotron_model) {
        Some(model) => model,
        None => {
          warn!("Couldn't load tacotron model: {}", tacotron_model);
          return Ok(HttpResponse::build(StatusCode::INTERNAL_SERVER_ERROR)
              .content_type("text/plain")
              .body("Couldn't load model."));
        },
      };

      let melgan = match app_state.model_cache.get_or_load_melgan(&melgan_model) {
        Some(model) => model,
        None => {
          warn!("Couldn't load melgan model: {}", melgan_model);
          return Ok(HttpResponse::build(StatusCode::INTERNAL_SERVER_ERROR)
              .content_type("text/plain")
              .body("Could not load model."));
        },
      };

      let result = arpabet_tacotron_melgan_pipeline(&cleaned_text, &tacotron, &melgan);

      match result {
        None => {
          Ok(HttpResponse::build(StatusCode::TOO_MANY_REQUESTS)
              .content_type("text/plain")
              .body("The service is receiving too many requests. Although there are many worker \
                    containers, model access is serialized on a per-container basis until the \
                    segfaults are fixed."))
        },
        Some(wav_data) => {
          Ok(HttpResponse::build(StatusCode::OK)
              .content_type("audio/wav")
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

      debug!("Glow-TTS Model: {}", glow_tts_model);
      debug!("Melgan Model: {}", melgan_model);

      let glow_tts = match app_state.model_cache.get_or_load_arbabet_glow_tts(&glow_tts_model) {
        Some(model) => model,
        None => {
          warn!("Couldn't load glow-tts model: {}", glow_tts_model);
          return Ok(HttpResponse::build(StatusCode::INTERNAL_SERVER_ERROR)
              .content_type("text/plain")
              .body("Couldn't load model."));
        },
      };

      let melgan = match app_state.model_cache.get_or_load_melgan(&melgan_model) {
        Some(model) => model,
        None => {
          warn!("Couldn't load melgan model: {}", melgan_model);
          return Ok(HttpResponse::build(StatusCode::INTERNAL_SERVER_ERROR)
              .content_type("text/plain")
              .body("Could not load model."));
        },
      };

      let wav_data = arpabet_glow_tts_melgan_pipeline(&cleaned_text, &glow_tts, &melgan);

      Ok(HttpResponse::build(StatusCode::OK)
          .content_type("audio/wav")
          .body(wav_data))
    },
    ModelPipeline::RawTextTacotronMelgan => unimplemented!(),
  }
}
