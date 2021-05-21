use actix_http::Error;
use actix_http::http::header;
use actix_web::dev::HttpResponseBuilder;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest, HttpMessage};
use crate::endpoints::users::create_account::CreateAccountError::{BadInput, ServerError, UsernameTaken, EmailTaken};
use crate::server_state::ServerState;
use crate::util::ip_address::get_request_ip;
use crate::util::random_token::random_token;
use derive_more::{Display, Error};
use log::{info, warn, log};
use regex::Regex;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::sync::Arc;
use crate::validations::username::validate_username;
use crate::validations::passwords::validate_passwords;
use actix_web::cookie::Cookie;
use sqlx::MySqlPool;
use crate::AnyhowResult;
use crate::common_queries::sessions::create_session_for_user;
use crate::endpoints::users::login::LoginSuccessResponse;
use crate::util::session_checker::SessionRecord;

#[derive(Serialize)]
pub struct UserInfo {
  pub user_token: String,
  pub username: String,
  pub display_name: String,
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
        display_name: session_data.display_name.to_string()
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
