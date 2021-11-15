use actix_http::{StatusCode, header};
use actix_web::{HttpRequest, web, HttpResponse, ResponseError, HttpResponseBuilder};
use crate::ObsGatewayServerState;
use http_server_common::response::response_error_helpers::to_simple_json_error;
use http_server_common::response::response_success_helpers::simple_json_success;
use log::info;
use std::fmt;
use std::sync::Arc;
use twitch_oauth2::tokens::UserTokenBuilder;
use twitch_oauth2::{Scope, ClientSecret};
use twitch_api2::twitch_oauth2::ClientId;
use http_server_common::response::to_json_success_response::to_json_success_response;

#[derive(Serialize)]
pub struct OauthBeginEnrollResult {
  redirect_url: String,
}

#[derive(Debug)]
pub enum OauthBeginEnrollError {
  ServerError,
}

// NB: Not using DeriveMore since Clion doesn't understand it.
impl fmt::Display for OauthBeginEnrollError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "OauthBeginEnrollError")
  }
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

    to_simple_json_error(&error_reason, self.status_code())

    //HttpResponseBuilder::new(self.status_code())
    //    .set_header(header::CONTENT_TYPE, "application/json")
    //    .body("TODO")
  }
}

pub async fn oauth_begin_enroll(
  http_request: HttpRequest,
  server_state: web::Data<Arc<ObsGatewayServerState>>
) -> Result<HttpResponse, OauthBeginEnrollError> {

  let redirect_url =
      twitch_oauth2::url::Url::parse(&server_state.twitch_oauth_secrets.redirect_url).unwrap();

  let client_id = ClientId::new(&server_state.twitch_oauth_secrets.client_id);
  let client_secret = ClientSecret::new(&server_state.twitch_oauth_secrets.client_secret);

  // TODO: Not all scopes are needed!
  let mut builder = UserTokenBuilder::new(client_id, client_secret, redirect_url)
      .set_scopes(Scope::all())
      .force_verify(true);

  let (url, _csrf_token) = builder.generate_url();

  let response = OauthBeginEnrollResult {
    redirect_url: url.to_string(),
  };

  let response = to_json_success_response(&response)
      .map_err(|_| OauthBeginEnrollError::ServerError)?;

  Ok(response)
}
