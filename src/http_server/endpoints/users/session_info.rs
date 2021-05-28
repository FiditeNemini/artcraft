use actix_http::Error;
use actix_http::http::header;
use actix_web::cookie::Cookie;
use actix_web::dev::HttpResponseBuilder;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest, HttpMessage};
use crate::AnyhowResult;
use crate::common_queries::sessions::create_session_for_user;
use crate::http_server::endpoints::users::create_account::CreateAccountError::{BadInput, ServerError, UsernameTaken, EmailTaken};
use crate::http_server::endpoints::users::login::LoginSuccessResponse;
use crate::http_server::web_utils::ip_address::get_request_ip;
use crate::http_server::web_utils::session_checker::SessionRecord;
use crate::server_state::ServerState;
use crate::util::random_crockford_token::random_crockford_token;
use crate::validations::passwords::validate_passwords;
use crate::validations::username::validate_username;
use derive_more::{Display, Error};
use log::{info, warn, log};
use regex::Regex;
use sqlx::MySqlPool;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::sync::Arc;

#[derive(Serialize)]
pub struct UserInfo {
  pub user_token: String,
  pub username: String,
  pub display_name: String,
  pub email_gravatar_hash: String,
}

#[derive(Serialize)]
pub struct SessionInfoSuccessResponse {
  pub success: bool,
  pub logged_in: bool,
  pub user: Option<UserInfo>,
}

#[derive(Serialize)]
pub struct ErrorResponse {
  pub success: bool,
  pub error_reason: String,
}

#[derive(Debug, Display)]
pub enum SessionInfoError {
  ServerError,
}

impl ResponseError for SessionInfoError {
  fn status_code(&self) -> StatusCode {
    match *self {
      SessionInfoError::ServerError=> StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      SessionInfoError::ServerError => "server error".to_string(),
    };

    let response = ErrorResponse {
      success: false,
      error_reason,
    };

    let body = match serde_json::to_string(&response) {
      Ok(json) => json,
      Err(_) => "{}".to_string(),
    };

    HttpResponseBuilder::new(self.status_code())
      .set_header(header::CONTENT_TYPE, "application/json")
      .body(body)
  }
}

pub async fn session_info_handler(
  http_request: HttpRequest,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, SessionInfoError>
{
  let maybe_user_session = server_state
    .session_checker
    .maybe_get_user_session(&http_request, &server_state.mysql_pool)
    .await
    .map_err(|e| {
      warn!("Session checker error: {:?}", e);
      SessionInfoError::ServerError
    })?;

  let mut logged_in = false;
  let mut user_info = None;

  match maybe_user_session {
    None => {}
    Some(session_data) => {
      logged_in = true;
      user_info = Some(UserInfo {
        user_token: session_data.user_token.clone(),
        username: session_data.username.to_string(),
        display_name: session_data.display_name.to_string(),
        email_gravatar_hash: session_data.email_gravatar_hash.to_string(),
      });
    }
  }

  let response = SessionInfoSuccessResponse {
    success: true,
    logged_in,
    user: user_info,
  };

  let body = serde_json::to_string(&response)
    .map_err(|e| SessionInfoError::ServerError)?;

  Ok(HttpResponse::Ok()
    .content_type("application/json")
    .body(body))
}
