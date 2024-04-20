use std::fmt;
use std::sync::Arc;

use actix_http::StatusCode;
use actix_web::{HttpRequest, HttpResponse, ResponseError, web};
use log::warn;

use http_server_common::response::response_error_helpers::to_simple_json_error;
use mysql_queries::queries::twitch::twitch_oauth::find::TwitchOauthTokenFinder;

use crate::server_state::ServerState;

#[derive(Serialize)]
pub struct CheckOauthResponse {
  pub success: bool,

  /// This is false if the user isn't logged in, doesn't have oauth, or oauth is invalid
  pub oauth_token_found: bool,

  /// Shouldn't be harmful to send this back since user must be logged in.
  pub maybe_twitch_username: Option<String>,
  pub maybe_twitch_username_lowercase: Option<String>,
}

#[derive(Debug)]
pub enum CheckOauthStatusError {
  ServerError,
}

impl ResponseError for CheckOauthStatusError {
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

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for CheckOauthStatusError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

pub async fn check_oauth_status_handler(
  http_request: HttpRequest,
  server_state: web::Data<Arc<ServerState>>
)
  -> Result<HttpResponse, CheckOauthStatusError>
{
  let maybe_user_session = server_state
      .session_checker
      .maybe_get_user_session(&http_request, &server_state.mysql_pool)
      .await
      .map_err(|e| {
        warn!("Session checker error: {:?}", e);
        CheckOauthStatusError::ServerError
      })?;

  let mut oauth_token_found = false;
  let mut maybe_twitch_username = None;
  let mut maybe_twitch_username_lowercase = None;

  match maybe_user_session {
    None => {}, // Not logged in - not found
    Some(session) => {
      let finder = TwitchOauthTokenFinder::new()
          .allow_expired_tokens(true)
          .scope_user_token(Some(session.user_token_typed.as_str()));

      let maybe_record = finder.perform_query(&server_state.mysql_pool)
          .await
          .map_err(|e| {
            warn!("lookup error: {:?}", e);
            CheckOauthStatusError::ServerError
          })?;

      // Existence is sufficient.
      if let Some(record) = maybe_record {
        oauth_token_found = true;
        maybe_twitch_username = Some(record.twitch_username.to_string());
        maybe_twitch_username_lowercase = Some(record.twitch_username_lowercase.to_string());
      }
    },
  }

  let response = CheckOauthResponse {
    success: true,
    oauth_token_found,
    maybe_twitch_username,
    maybe_twitch_username_lowercase,
  };

  let body = serde_json::to_string(&response)
      .map_err(|e| CheckOauthStatusError::ServerError)?;

  return Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body));
}
