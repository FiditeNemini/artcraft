use std::sync::Arc;

use crate::http_server::endpoints::app_state::components::get_server_info::get_server_info;
use crate::state::server_state::ServerState;
use actix_web::http::StatusCode;
use actix_web::web::Json;
use actix_web::{web, HttpRequest, HttpResponse, ResponseError};
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;

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
) -> Result<Json<PublicInfoResponse>, PublicInfoError> {
  let server_info = get_server_info(&server_state);
  Ok(Json(PublicInfoResponse {
    success: true,
    server_build_sha: server_info.build_sha,
    server_hostname: server_info.hostname,
  }))
}
