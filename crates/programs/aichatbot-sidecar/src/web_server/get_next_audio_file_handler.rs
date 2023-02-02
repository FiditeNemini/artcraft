use actix_http::StatusCode;
use actix_web::{HttpRequest, HttpResponse, ResponseError, web};
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;

#[derive(Serialize)]
pub struct GetNextAudioFileResponse {
  pub success: bool,
  pub is_paused: bool,
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
  //_server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, GetNextAudioFileError> {

  let response = GetNextAudioFileResponse {
    success: true,
    is_paused: false,
  };

  let body = serde_json::to_string(&response)
      .map_err(|e| GetNextAudioFileError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
