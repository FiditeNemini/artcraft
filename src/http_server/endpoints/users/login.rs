use actix_http::Error;
use actix_http::http::header;
use actix_web::cookie::Cookie;
use actix_web::dev::HttpResponseBuilder;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest};
use crate::AnyhowResult;
use crate::common_queries::sessions::create_session_for_user;
use crate::http_server::endpoints::users::create_account::CreateAccountError::{BadInput, ServerError, UsernameTaken, EmailTaken};
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

#[derive(Deserialize)]
pub struct LoginRequest {
  pub username_or_email: String,
  pub password: String,
}

#[derive(Serialize)]
pub struct LoginSuccessResponse {
  pub success: bool,
}

#[derive(Serialize)]
pub struct ErrorResponse {
  pub success: bool,
  pub error_reason: String,
}

#[derive(Debug, Display)]
pub enum LoginError {
  WrongCredentials,
  ServerError,
}

impl ResponseError for LoginError {
  fn status_code(&self) -> StatusCode {
    match *self {
      LoginError::WrongCredentials => StatusCode::BAD_REQUEST,
      LoginError::ServerError=> StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      LoginError::WrongCredentials => "wrong credentials".to_string(),
      LoginError::ServerError => "server error".to_string(),
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

pub async fn login_handler(
  http_request: HttpRequest,
  request: web::Json<LoginRequest>,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, LoginError>
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
      warn!("Login lookup error: {:?}", e);
      return Err(LoginError::WrongCredentials); // TODO: This isn't necessarily user error.
    }
  };

  info!("login user found");

  let actual_hash = match String::from_utf8(user.password_hash.clone()) {
    Ok(hash) => hash,
    Err(e) => {
      warn!("Login hash hydration error: {:?}", e);
      return Err(LoginError::ServerError);
    }
  };

  let is_valid = match bcrypt::verify(&request.password, &actual_hash) {
    Ok(is_valid) => {
      if !is_valid {
        info!("invalid credentials");
        return Err(LoginError::WrongCredentials);
      }
    },
    Err(e) => {
      warn!("Login hash comparison error: {:?}", e);
      return Err(LoginError::ServerError);
    }
  };

  let ip_address = get_request_ip(&http_request);

  let create_session_result =
    create_session_for_user(&user.token, &ip_address, &server_state.mysql_pool).await;

  let session_token = match create_session_result {
    Ok(token) => token,
    Err(e) => {
      warn!("login create session error : {:?}", e);
      return Err(LoginError::ServerError);
    }
  };

  info!("login session created");

  let session_cookie = match server_state.cookie_manager.create_cookie(&session_token) {
    Ok(cookie) => cookie,
    Err(_) => return Err(LoginError::ServerError),
  };

  let response = LoginSuccessResponse {
    success: true,
  };

  let body = serde_json::to_string(&response)
    .map_err(|e| LoginError::ServerError)?;

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
}

async fn lookup_by_username(username: &str, pool: &MySqlPool) -> AnyhowResult<UserRecordForLogin>
{
  // NB: Lookup failure is Err(RowNotFound).
  let record = sqlx::query_as!(
    UserRecordForLogin,
        r#"
SELECT token, username, email_address, password_hash
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
SELECT token, username, email_address, password_hash
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
