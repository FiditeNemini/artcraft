use actix_http::{StatusCode, header};
use actix_web::{HttpRequest, web, HttpResponse, ResponseError, HttpResponseBuilder};
use crate::ObsGatewayServerState;
use http_server_common::response::response_error_helpers::to_simple_json_error;
use log::info;
use std::fmt;
use std::sync::Arc;
use http_server_common::response::response_success_helpers::simple_json_success;

#[derive(Debug)]
pub enum OauthBeginEnrollError {
  ServerError,
}

impl ResponseError for OauthBeginEnrollError {
  fn status_code(&self) -> StatusCode {
    match *self {
      Self::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      Self::ServerError => "server error".to_string(),
    };

    //to_simple_json_error(&error_reason, self.status_code())

    HttpResponseBuilder::new(self.status_code())
        .set_header(header::CONTENT_TYPE, "application/json")
        .body("TODO")
  }
}

// NB: Not using DeriveMore since Clion doesn't understand it.
impl fmt::Display for OauthBeginEnrollError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

pub async fn oauth_begin_enroll(
  http_request: HttpRequest,
  server_state: web::Data<Arc<ObsGatewayServerState>>
) -> Result<HttpResponse, OauthBeginEnrollError> {


  info!("oauth enrollment begin");
  //Ok(simple_json_success())

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(""))
}
