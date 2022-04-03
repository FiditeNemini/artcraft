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
use crate::model::model_config::ModelConfigs;

#[get("/models")]
pub async fn get_models(
  _request: HttpRequest,
  app_state: Data<Arc<AppState>>
) -> std::io::Result<Json<ModelConfigs>> {
  println!("GET /models");
  let app_state = app_state.into_inner();
  Ok(Json(app_state.model_configs.clone()))
}
