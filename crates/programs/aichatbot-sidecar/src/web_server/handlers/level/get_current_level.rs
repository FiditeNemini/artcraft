use actix_http::StatusCode;
use actix_web::{HttpRequest, HttpResponse, ResponseError, web};
use crate::shared_state::app_control_state::AppControlState;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use log::error;
use std::sync::Arc;

#[derive(Serialize)]
pub struct GetCurrentLevelResponse {
  pub success: bool,
  pub current_level: String,
}

#[derive(Debug, Serialize)]
pub enum GetCurrentLevelError {
  ServerError,
}

impl ResponseError for GetCurrentLevelError {
  fn status_code(&self) -> StatusCode {
    match *self {
      GetCurrentLevelError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    serialize_as_json_error(self)
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl std::fmt::Display for GetCurrentLevelError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{:?}", self)
  }
}

pub async fn get_current_level_handler(
  _http_request: HttpRequest,
  control_state: web::Data<Arc<AppControlState>>
) -> Result<HttpResponse, GetCurrentLevelError> {

  let current_level = control_state.get_level()
      .map_err(|err| {
        error!("Error: {:?}", err);
        GetCurrentLevelError::ServerError
      })?;

  let response = GetCurrentLevelResponse {
    success: true,
    current_level: current_level.tts_model_token_str().to_string(),
  };

  let body = serde_json::to_string(&response)
      .map_err(|e| GetCurrentLevelError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
