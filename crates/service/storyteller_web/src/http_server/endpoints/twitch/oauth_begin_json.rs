use actix_http::{StatusCode, header};
use actix_web::{HttpRequest, web, HttpResponse, ResponseError, HttpResponseBuilder};
use crate::server_state::ServerState;
use http_server_common::response::response_error_helpers::to_simple_json_error;
use http_server_common::response::response_success_helpers::simple_json_success;
use http_server_common::response::to_json_success_response::to_json_success_response;
use log::info;
use log::warn;
use std::fmt;
use std::sync::Arc;
use twitch_api2::twitch_oauth2::ClientId;
use twitch_common::oauth_token_builder::get_oauth_token_builder;
use twitch_oauth2::tokens::UserTokenBuilder;
use twitch_oauth2::{Scope, ClientSecret};

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
  }
}

pub async fn oauth_begin_enroll_json(
  http_request: HttpRequest,
  server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, OauthBeginEnrollError> {

  let redirect_url =
      twitch_oauth2::url::Url::parse(&server_state.twitch_oauth_secrets.redirect_url)
          .map_err(|e| {
            warn!("Error parsing url: {:?}", e);
            OauthBeginEnrollError::ServerError
          })?;

  let mut builder = get_oauth_token_builder(
    &server_state.twitch_oauth_secrets.client_id,
    &server_state.twitch_oauth_secrets.client_secret,
    &redirect_url,
  true);

  let (url, _csrf_token) = builder.generate_url();

  let response = OauthBeginEnrollResult {
    redirect_url: url.to_string(),
  };

  let response = to_json_success_response(&response)
      .map_err(|_| OauthBeginEnrollError::ServerError)?;

  Ok(response)
}
