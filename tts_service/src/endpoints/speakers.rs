use actix_web::web::{
  Data,
  Json,
};
use actix_web::{
  HttpRequest,
  get,
};

use std::sync::Arc;
use crate::AppState;
use crate::model::model_config::Speaker;

#[derive(Serialize, Debug, Clone)]
pub struct SpeakersResult {
  pub speakers: Vec<Speaker>,
}

#[get("/speakers")]
pub async fn get_speakers(
  _request: HttpRequest,
  app_state: Data<Arc<AppState>>
) -> std::io::Result<Json<SpeakersResult>> {
  println!("GET /speakers");
  let app_state = app_state.into_inner();

  Ok(Json(SpeakersResult {
    speakers: app_state.model_configs.speakers.clone(),
  }))
}

#[get("/voices")]
pub async fn get_early_access_speakers(
  _request: HttpRequest,
  app_state: Data<Arc<AppState>>
) -> std::io::Result<Json<SpeakersResult>> {
  println!("GET /early_access_speakers");
  let app_state = app_state.into_inner();

  let early_access_voices =
      app_state.model_configs.early_access_voices
          .as_ref()
          .map_or(Vec::new(), |list| list.clone());

  let mut early_access_speakers : Vec<Speaker> = Vec::new();

  for speaker in app_state.model_configs.speakers.iter() {
    if early_access_voices.contains(&speaker.slug) {
      early_access_speakers.push(speaker.clone());
    }
  }

  Ok(Json(SpeakersResult {
    speakers: early_access_speakers,
  }))
}
