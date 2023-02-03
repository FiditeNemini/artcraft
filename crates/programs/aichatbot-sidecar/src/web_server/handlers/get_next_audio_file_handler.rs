use std::sync::Arc;
use actix_http::StatusCode;
use actix_web::{HttpRequest, HttpResponse, ResponseError, web};
use actix_web::web::Query;
use log::{error, info};
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use crate::shared_state::app_control_state::AppControlState;

#[derive(Deserialize)]
pub struct GetNextAudioQuery {
  pub cursor: u64,
}

#[derive(Serialize)]
pub struct GetNextAudioFileResponse {
  pub success: bool,
  pub is_paused: bool,
  pub next_cursor: u64,
}

#[derive(Debug, Serialize)]
pub enum GetNextAudioFileError {
  ServerError,
}

impl ResponseError for GetNextAudioFileError {
  fn status_code(&self) -> StatusCode {
    match *self {
      GetNextAudioFileError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    serialize_as_json_error(self)
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl std::fmt::Display for GetNextAudioFileError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{:?}", self)
  }
}

pub async fn get_next_audio_file_handler(
  _http_request: HttpRequest,
  control_state: web::Data<Arc<AppControlState>>,
  request: Query<GetNextAudioQuery>,
) -> Result<HttpResponse, GetNextAudioFileError> {

  info!("Requested cursor: {}", request.cursor);

  let is_paused = control_state.is_paused()
      .map_err(|err| {
        error!("Error: {:?}", err);
        GetNextAudioFileError::ServerError
      })?;

  let next_cursor = request.cursor + 1;

  let response = GetNextAudioFileResponse {
    success: true,
    is_paused,
    next_cursor,
  };

  let body = serde_json::to_string(&response)
      .map_err(|e| GetNextAudioFileError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
