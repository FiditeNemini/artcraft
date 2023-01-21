use std::sync::Arc;
use actix_web::http::StatusCode;
use actix_web::{HttpRequest, HttpResponse, ResponseError, web};
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use crate::server_state::ServerState;

#[derive(Serialize)]
pub struct PublicInfoResponse {
  pub success: bool,
  pub server_build_sha: String,
  pub server_hostname: String,
}

#[derive(Debug, Serialize)]
pub enum PublicInfoError {
  ServerError,
}

impl ResponseError for PublicInfoError {
  fn status_code(&self) -> StatusCode {
    match *self {
      PublicInfoError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    serialize_as_json_error(self)
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl std::fmt::Display for PublicInfoError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{:?}", self)
  }
}

pub async fn get_public_info_handler(
  _http_request: HttpRequest,
  server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, PublicInfoError> {

  let response = PublicInfoResponse {
    success: true,
    server_build_sha: server_state.server_info.build_sha.clone(),
    server_hostname: server_state.hostname.clone(),
  };

  let body = serde_json::to_string(&response)
      .map_err(|e| PublicInfoError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
