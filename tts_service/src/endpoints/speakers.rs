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
  speakers: Vec<Speaker>,
}

#[get("/speakers")]
pub async fn get_speakers(
  _request: HttpRequest,
  app_state: Data<Arc<AppState>>
) -> std::io::Result<Json<SpeakersResult>> {
  println!("GET /models");
  let app_state = app_state.into_inner();

  Ok(Json(SpeakersResult {
    speakers: app_state.model_configs.speakers.clone(),
  }))
}
