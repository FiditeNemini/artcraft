use actix_http::StatusCode;
use actix_web::{HttpResponse, HttpRequest, web, ResponseError};
use crate::server_state::ObsGatewayServerState;
use crate::twitch::oauth_token_builder::get_oauth_token_builder;
use http_server_common::response::response_error_helpers::to_simple_json_error;
use log::error;
use log::info;
use log::warn;
use std::fmt;
use std::sync::Arc;
use twitch_oauth2::tokens::BearerTokenType::UserToken;
use twitch_oauth2::CsrfToken;

#[derive(Deserialize)]
pub struct QueryParams {
  /// OAuth authorization code
  pub code: Option<String>,
  /// Opaque value used to avoid CSRF attacks.
  pub state: Option<String>,
  /// List of permission scopes
  pub scope: Option<String>,

  /// Only set in the event of an error
  pub error: Option<String>,
  /// Only set in the event of an error
  pub error_description: Option<String>,
}

#[derive(Debug)]
pub enum OauthEndEnrollFromRedirectError {
  ServerError,
  TwitchOauthError { reason: String },
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
      OauthEndEnrollFromRedirectError::TwitchOauthError { .. } => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      Self::ServerError => "server error".to_string(),
      OauthEndEnrollFromRedirectError::TwitchOauthError { .. } => "twitch error".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

pub async fn oauth_end_enroll_from_redirect(
  http_request: HttpRequest,
  query: web::Query<QueryParams>,
  server_state: web::Data<Arc<ObsGatewayServerState>>
) -> Result<HttpResponse, OauthEndEnrollFromRedirectError> {

  if let Some(error) = query.error.as_deref() {
    return Err(OauthEndEnrollFromRedirectError::TwitchOauthError { reason: error.to_string() })
  }
  if let Some(error) = query.error_description.as_deref() {
    return Err(OauthEndEnrollFromRedirectError::TwitchOauthError { reason: error.to_string() })
  }

  let (code, state) = match (query.code.as_deref(), query.state.as_deref()) {
    (Some(code), Some(state)) => (code.to_string(), state.to_string()),
    _ => {
      return Err(OauthEndEnrollFromRedirectError::TwitchOauthError {
        reason: "params not set".to_string()
      });
    }
  };

  // TODO/FIXME: This is a major security issue (part 1).
  //  These need to be persisted in the database and associated with the user.
  let csrf_token = CsrfToken::new(&state);

  let redirect_url =
      twitch_oauth2::url::Url::parse(&server_state.twitch_oauth_secrets.redirect_url)
          .map_err(|e| {
            warn!("Error parsing url: {:?}", e);
            OauthEndEnrollFromRedirectError::ServerError
          })?;

  let mut builder = get_oauth_token_builder(
    &server_state.twitch_oauth_secrets.client_id,
    &server_state.twitch_oauth_secrets.client_secret,
    &redirect_url,
    true);

  // TODO/FIXME: This is a major security issue (part 2).
  builder.set_csrf(csrf_token);

  let http_client = &reqwest::Client::builder()
      .redirect(reqwest::redirect::Policy::none())
      .build()
      .map_err(|e| {
        error!("Problem creating HTTP client: {:?}", e);
        OauthEndEnrollFromRedirectError::ServerError
      })?;

  let user_token = builder
      .get_user_token(
        http_client,
        &state,
        &code,
      )
      .await
      .map_err(|e| {
        warn!("Error fetching user token: {:?}", e);
        OauthEndEnrollFromRedirectError::TwitchOauthError {
          reason: "error fetching user token".to_string()
        }
      })?;

  let auth_token = user_token.access_token.as_str();

  info!("Auth token: {:?}", auth_token);

  Ok(HttpResponse::Ok()
      .body("TODO"))
}
