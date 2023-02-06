use std::sync::Arc;
use actix_http::StatusCode;
use actix_web::{HttpRequest, HttpResponse, ResponseError, web};
use actix_web::web::Query;
use log::{error, info};
use files::file_exists::file_exists;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use crate::shared_state::app_control_state::AppControlState;
use crate::web_server::server_state::ServerState;

#[derive(Deserialize)]
pub struct GetNextAudioQuery {
  pub cursor: u64,
}

#[derive(Serialize)]
pub struct GetNextAudioFileResponse {
  pub success: bool,
  pub is_paused: bool,
  pub audio_filename_platform: Option<String>,
  /// The audio filename, in a Unix style (forward slashes).
  /// Note, this might have a windows drive letter.
  pub audio_filename_unixy: Option<String>,
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
  server_state: web::Data<Arc<ServerState>>,
  request: Query<GetNextAudioQuery>,
) -> Result<HttpResponse, GetNextAudioFileError> {

  info!("Requested cursor: {}", request.cursor);

  let is_paused = control_state.is_paused()
      .map_err(|err| {
        error!("Error: {:?}", err);
        GetNextAudioFileError::ServerError
      })?;


  let audio_file_dir = server_state.save_directory.get_audio_files_dir_v1();

  let maybe_audio_filename = format!("{}.wav", request.cursor);
  let maybe_audio_filename = audio_file_dir.join(maybe_audio_filename);

  info!("Hypothetical audio file: {:?}", maybe_audio_filename);

  let mut next_cursor;
  let mut audio_filename : Option<String> = None;
  let mut audio_filename_unixy : Option<String> = None;

  if file_exists(&maybe_audio_filename) {
    next_cursor = request.cursor + 1;
    audio_filename = maybe_audio_filename.to_str()
        .map(|s| s.to_string());
    audio_filename_unixy = audio_filename.as_deref()
        .map(|s| s.to_string())
        .map(|s| s.replace("\\", "/"));
  } else {
    next_cursor = 0;
    audio_filename = None;
  };

  let maybe_next_audio_filename = format!("{}.wav", next_cursor);
  let maybe_next_audio_filename = audio_file_dir.join(maybe_next_audio_filename);

  if !file_exists(&maybe_next_audio_filename) {
    next_cursor = 0;
  }

  let response = GetNextAudioFileResponse {
    success: true,
    is_paused,
    next_cursor,
    audio_filename_platform: audio_filename,
    audio_filename_unixy,
  };

  let body = serde_json::to_string(&response)
      .map_err(|e| GetNextAudioFileError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
