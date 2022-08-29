use actix_http::http::header;
use actix_web::HttpResponseBuilder;
use actix_web::cookie::Cookie;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest, HttpMessage};
use container_common::anyhow_result::AnyhowResult;
use crate::server_state::ServerState;
use http_server_common::response::response_error_helpers::to_simple_json_error;
use log::{info, warn, log};
use regex::Regex;
use sqlx::MySqlPool;
use std::fmt;
use std::sync::Arc;

#[derive(Serialize)]
pub struct LogoutSuccessResponse {
  pub success: bool,
}

#[derive(Debug)]
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

    to_simple_json_error(&error_reason, self.status_code())
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for LogoutError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
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
WHERE
    token = ?
    AND deleted_at IS NULL
        "#,
        session_token.to_string(),
    )
    .execute(mysql_pool)
    .await;

  Ok(())
}