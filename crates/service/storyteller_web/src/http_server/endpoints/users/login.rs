use actix_http::Error;
use actix_http::http::header;
use actix_web::HttpResponseBuilder;
use actix_web::cookie::Cookie;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest};
use crate::AnyhowResult;
use crate::http_server::web_utils::ip_address::get_request_ip;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::http_server::web_utils::serialize_as_json_error::serialize_as_json_error;
use crate::server_state::ServerState;
use database_queries::helpers::boolean_converters::i8_to_bool;
use database_queries::users::user_sessions::create_session::create_session_for_user;
use log::{info, warn, log};
use regex::Regex;
use sqlx::MySqlPool;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::fmt::Formatter;
use std::fmt;
use std::sync::Arc;

#[derive(Deserialize)]
pub struct LoginRequest {
  pub username_or_email: String,
  pub password: String,
}

#[derive(Serialize)]
pub struct LoginSuccessResponse {
  pub success: bool,
}

#[derive(Serialize, Debug)]
pub struct LoginErrorResponse {
  pub success: bool,
  pub error_type: LoginErrorType,
  pub error_message: String,
}

#[derive(Copy, Clone, Debug, Serialize)]
pub enum LoginErrorType {
  InvalidCredentials,
  ServerError,
}

impl LoginErrorResponse {
  fn invalid_credentials() -> Self {
    Self {
      success: false,
      error_type: LoginErrorType::InvalidCredentials,
      error_message: "invalid credentials".to_string()
    }
  }
  fn server_error() -> Self {
    Self {
      success: false,
      error_type: LoginErrorType::ServerError,
      error_message: "server error".to_string()
    }
  }
}

// NB: Not using DeriveMore since Clion doesn't understand it.
impl fmt::Display for LoginErrorResponse {
  fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self.error_type)
  }
}

impl ResponseError for LoginErrorResponse {
  fn status_code(&self) -> StatusCode {
    match self.error_type {
      LoginErrorType::InvalidCredentials => StatusCode::UNAUTHORIZED,
      LoginErrorType::ServerError=> StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    serialize_as_json_error(self)
  }
}

pub async fn login_handler(
  http_request: HttpRequest,
  request: web::Json<LoginRequest>,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, LoginErrorResponse>
{
  let check_username_or_email = request.username_or_email.to_lowercase();

  let maybe_user = if check_username_or_email.contains("@") {
    lookup_by_email(&check_username_or_email, &server_state.mysql_pool).await
  } else {
    lookup_by_username(&check_username_or_email, &server_state.mysql_pool).await
  };

  let user = match maybe_user {
    Ok(user) => user,
    Err(e) =>  {
      // TODO: This isn't necessarily user error. I need to fix the above code to not lose error
      //  semantics. I also need to prevent user lookup attacks.
      warn!("Login lookup error: {:?}", e);
      return Err(LoginErrorResponse::invalid_credentials());
    }
  };

  let is_banned = i8_to_bool(user.is_banned);
  if is_banned {
    // We don't allow banned users back in.
    return Err(LoginErrorResponse::invalid_credentials());
  }

  info!("login user found");

  let actual_hash = match String::from_utf8(user.password_hash.clone()) {
    Ok(hash) => hash,
    Err(e) => {
      warn!("Login hash hydration error: {:?}", e);
      return Err(LoginErrorResponse::server_error());
    }
  };

  match bcrypt::verify(&request.password, &actual_hash) {
    Err(e) => {
      warn!("Login hash comparison error: {:?}", e);
      return Err(LoginErrorResponse::server_error());
    }
    Ok(is_valid) => {
      if !is_valid {
        info!("invalid credentials");
        return Err(LoginErrorResponse::invalid_credentials());
      }
      // Good to go...!
    },
  };

  let ip_address = get_request_ip(&http_request);

  let create_session_result =
    create_session_for_user(&user.token, &ip_address, &server_state.mysql_pool).await;

  let session_token = match create_session_result {
    Ok(token) => token,
    Err(e) => {
      warn!("login create session error : {:?}", e);
      return Err(LoginErrorResponse::server_error());
    }
  };

  info!("login session created");

  let session_cookie = match server_state.cookie_manager.create_cookie(&session_token) {
    Ok(cookie) => cookie,
    Err(_) => return Err(LoginErrorResponse::server_error()),
  };

  let response = LoginSuccessResponse {
    success: true,
  };

  let body = serde_json::to_string(&response)
    .map_err(|e| LoginErrorResponse::server_error())?;

  Ok(HttpResponse::Ok()
    .cookie(session_cookie)
    .content_type("application/json")
    .body(body))
}

#[derive(Debug)]
pub struct UserRecordForLogin {
  token: String,
  username: String,
  email_address: String,
  password_hash: Vec<u8>,
  is_banned: i8,
}

async fn lookup_by_username(username: &str, pool: &MySqlPool) -> AnyhowResult<UserRecordForLogin>
{
  // NB: Lookup failure is Err(RowNotFound).
  let record = sqlx::query_as!(
    UserRecordForLogin,
        r#"
SELECT token, username, email_address, password_hash, is_banned
FROM users
WHERE username = ?
LIMIT 1
        "#,
        username.to_string(),
    )
    .fetch_one(pool)
    .await?;

  Ok(record)
}

async fn lookup_by_email(email: &str, pool: &MySqlPool) -> AnyhowResult<UserRecordForLogin> {
  // NB: Lookup failure is Err(RowNotFound).
  let record = sqlx::query_as!(
    UserRecordForLogin,
        r#"
SELECT token, username, email_address, password_hash, is_banned
FROM users
WHERE email_address = ?
LIMIT 1
        "#,
        email.to_string(),
    )
    .fetch_one(pool)
    .await?;

  Ok(record)
}
