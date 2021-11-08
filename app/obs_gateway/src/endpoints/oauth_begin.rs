use actix_http::StatusCode;
use actix_web::{HttpRequest, web, HttpResponse, ResponseError};
use crate::ObsGatewayServerState;
use log::info;
use std::fmt;
use std::sync::Arc;

#[derive(Debug, Display)]
pub enum OauthBeginEnrollError {
  ServerError,
}

impl ResponseError for OauthBeginEnrollError{
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

// NB: Not using DeriveMore since Clion doesn't understand it.
impl fmt::Display for OauthBeginEnrollError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self.error_type)
  }
}

pub async fn oauth_begin_enroll(
  http_request: HttpRequest,
  server_state: web::Data<Arc<ObsGatewayServerState>>
) -> Result<HttpResponse, OauthBeginEnrollError> {


  info!("oauth enrollment begin");
  Ok(())
}
