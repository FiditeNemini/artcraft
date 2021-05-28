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
pub struct LogoutSuccessResponse {
  pub success: bool,
}

#[derive(Serialize)]
pub struct ErrorResponse {
  pub success: bool,
  pub error_reason: String,
}

#[derive(Debug, Display)]
pub enum LogoutError {
  ServerError,
}

impl ResponseError for LogoutError {
  fn status_code(&self) -> StatusCode {
    match *self {
      LogoutError::ServerError=> StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      LogoutError::ServerError => "server error".to_string(),
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

pub async fn logout_handler(
  http_request: HttpRequest,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, LogoutError>
{
  let delete_cookie = match http_request.cookie("session") {
    Some(cookie) => {
      match server_state.cookie_manager.decode_session_token(&cookie) {
        Err(e) => {
          warn!("Session cookie decode error: {:?}", e);
        },
        Ok(session_token) => {
          let _r = delete_session(&session_token, &server_state.mysql_pool).await;
        }
      }

      cookie // delete this cookie
    },
    None => {
      server_state.cookie_manager.delete_cookie()
    }
  };

  let response = LogoutSuccessResponse {
    success: true,
  };

  let body = serde_json::to_string(&response)
    .map_err(|e| LogoutError::ServerError)?;

  Ok(HttpResponse::Ok()
    .del_cookie(&delete_cookie)
    .content_type("application/json")
    .body(body))
}

async fn delete_session(session_token: &str, mysql_pool: &MySqlPool) -> AnyhowResult<()> {
  let query_result = sqlx::query!(
        r#"
UPDATE user_sessions
SET deleted_at = CURRENT_TIMESTAMP()
WHERE token = ?
AND deleted_at IS NULL
        "#,
        session_token.to_string(),
    )
    .execute(mysql_pool)
    .await;

  Ok(())
}