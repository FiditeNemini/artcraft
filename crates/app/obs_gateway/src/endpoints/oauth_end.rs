use actix_http::StatusCode;
use actix_web::{HttpResponse, HttpRequest, web, ResponseError};
use crate::server_state::ObsGatewayServerState;
use http_server_common::response::response_error_helpers::to_simple_json_error;
use std::fmt;
use std::sync::Arc;

#[derive(Debug)]
pub enum OauthEndEnrollFromRedirectError {
  ServerError,
}

// NB: Not using DeriveMore since Clion doesn't understand it.
impl fmt::Display for OauthEndEnrollFromRedirectError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "OauthEndEnrollFromRedirectError")
  }
}

impl ResponseError for OauthEndEnrollFromRedirectError {
  fn status_code(&self) -> StatusCode {
    match *self {
      Self::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      Self::ServerError => "server error".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

pub async fn oauth_end_enroll_from_redirect(
  http_request: HttpRequest,
  server_state: web::Data<Arc<ObsGatewayServerState>>
) -> Result<HttpResponse, OauthEndEnrollFromRedirectError> {
  Ok(HttpResponse::Ok()
      .body("TODO"))
}
