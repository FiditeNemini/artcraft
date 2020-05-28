use actix_web::http::StatusCode;
use actix_web::web::{Data, Query};
use actix_web::{
  HttpRequest,
  HttpResponse,
  get,
};

use std::sync::Arc;
use crate::AppState;
use arpabet::Arpabet;
use crate::text::text_to_arpabet_encoding;
use crate::old_model::TacoMelModel;
use crate::config::{Speaker, ModelPipeline};

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

pub async fn legacy_get_speak(_request: HttpRequest,
  query: Query<LegacyGetSpeakRequest>,
  app_state: Data<Arc<AppState>>
) -> std::io::Result<HttpResponse> {

  let speaker = match query.v.as_ref() {
    None => {
      return Ok(HttpResponse::build(StatusCode::BAD_REQUEST)
          .content_type("text/plain")
          .body("Speaker parameter missing."));
    },
    Some(v) => v.to_string(),
  };

  let text = match query.s.as_ref() {
    None => {
      return Ok(HttpResponse::build(StatusCode::BAD_REQUEST)
          .content_type("text/plain")
          .body("Text parameter missing."));
    },
    Some(s) => s.to_string(),
  };

  println!("Speaker: {}, Text: {}", speaker, text);

  let mut app_state = app_state.into_inner();

  let speaker = match app_state.model_configs.find_speaker_by_slug(&speaker) {
    Some(speaker) => speaker,
    None => {
      return Ok(HttpResponse::build(StatusCode::NOT_FOUND)
          .content_type("text/plain")
          .body("Speaker not found"));
    },
  };

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

      //println!("Tacotron Model: {}", tacotron_model);
      //println!("Melgan Model: {}", melgan_model);

      let arpabet = Arpabet::load_cmudict();
      let encoded = text_to_arpabet_encoding(arpabet, &text);

      let tacotron = app_state.model_cache.get_or_load_arbabet_tacotron(&tacotron_model).unwrap();
      let melgan = app_state.model_cache.get_or_load_melgan(&melgan_model).unwrap();

      let wav_data = TacoMelModel::new().run_tts_encoded(&tacotron, &melgan, &encoded);

      return Ok(HttpResponse::build(StatusCode::OK)
          .content_type("audio/wav")
          .body(wav_data));
    },
    ModelPipeline::RawTextTacotronMelgan => unimplemented!(),
  }
}
