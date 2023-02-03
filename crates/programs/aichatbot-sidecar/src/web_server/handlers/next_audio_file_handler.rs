use std::sync::Arc;
use actix_http::StatusCode;
use actix_web::{HttpRequest, HttpResponse, ResponseError, web};
use log::error;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use crate::shared_state::app_control_state::AppControlState;

#[derive(Serialize)]
pub struct NextAudioFileResponse {
  pub success: bool,
  pub is_paused: bool,
}

#[derive(Debug, Serialize)]
pub enum NextAudioFileError {
  ServerError,
}

impl ResponseError for NextAudioFileError {
  fn status_code(&self) -> StatusCode {
    match *self {
      NextAudioFileError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    serialize_as_json_error(self)
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl std::fmt::Display for NextAudioFileError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{:?}", self)
  }
}

pub async fn next_audio_file_handler(
  _http_request: HttpRequest,
  control_state: web::Data<Arc<AppControlState>>
) -> Result<HttpResponse, NextAudioFileError> {

  let is_paused = control_state.is_paused()
      .map_err(|err| {
        error!("Error: {:?}", err);
        NextAudioFileError::ServerError
      })?;

  let response = NextAudioFileResponse {
    success: true,
    is_paused,
  };

  let body = serde_json::to_string(&response)
      .map_err(|e| NextAudioFileError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
