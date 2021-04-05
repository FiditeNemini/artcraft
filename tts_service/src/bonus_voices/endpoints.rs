use actix_web::web::{
  Data,
  Json,
  Path,
};
use actix_web::{
  HttpRequest,
  get,
};

use crate::AppState;
use crate::endpoints::speakers::SpeakersResult;
use crate::model::model_config::Speaker;
use std::sync::Arc;

#[get("/access/{key}")]
pub async fn get_dynamic_early_access_speakers(
  _request: HttpRequest,
  path_data: Path<(String,)>,
  app_state: Data<Arc<AppState>>
) -> std::io::Result<Json<SpeakersResult>> {

  let url_key = path_data.into_inner().0;
  let app_state = app_state.into_inner();
  let mappings = &app_state.bonus_endpoint_mappings;

  let early_access_voices =
      mappings.url_slug_to_voices.get(&url_key)
          .as_ref()
          .map_or(Vec::new(), |list| list.to_vec());

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
