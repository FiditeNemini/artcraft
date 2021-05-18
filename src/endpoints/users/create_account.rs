use actix_http::Error;
use actix_http::http::header;
use actix_web::dev::HttpResponseBuilder;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest};
use crate::endpoints::users::create_account::CreateAccountError::{BadInput, ServerError, UsernameTaken, EmailTaken};
use crate::server_state::ServerState;
use crate::util::ip_address::get_request_ip;
use crate::util::tokens::random_token;
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

const NEW_USER_ROLE: &'static str = "new-user";

#[derive(Deserialize)]
pub struct CreateAccountRequest {
  pub username: String,
  pub password: String,
  pub password_confirmation: String,
  pub email_address: String,
}

#[derive(Serialize)]
pub struct CreateAccountSuccessResponse {
  pub success: bool,
}

#[derive(Serialize)]
pub struct ErrorResponse {
  pub success: bool,
  pub error_reason: String,
}

#[derive(Debug, Display)]
pub enum CreateAccountError {
  BadInput(String),
  UsernameTaken,
  EmailTaken,
  ServerError,
}

impl ResponseError for CreateAccountError {
  fn status_code(&self) -> StatusCode {
    match *self {
      CreateAccountError::BadInput(_) => StatusCode::BAD_REQUEST,
      CreateAccountError::UsernameTaken => StatusCode::BAD_REQUEST,
      CreateAccountError::EmailTaken => StatusCode::BAD_REQUEST,
      CreateAccountError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      BadInput(reason) => reason.to_string(),
      CreateAccountError::UsernameTaken => "username already taken".to_string(),
      CreateAccountError::EmailTaken => "email already taken".to_string(),
      CreateAccountError::ServerError => "server error".to_string(),
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

pub async fn create_account_handler(
  http_request: HttpRequest,
  request: web::Json<CreateAccountRequest>,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, CreateAccountError>
{
  if let Err(reason) = validate_username(&request.username) {
    return Err(CreateAccountError::BadInput(reason));
  }

  if let Err(reason) = validate_passwords(&request.password, &request.password_confirmation) {
    return Err(CreateAccountError::BadInput(reason));
  }

  if !request.email_address.contains("@") {
    return Err(CreateAccountError::BadInput("invalid email address".to_string()));
  }

  let user_token = random_token(15);

  let password_hash = match bcrypt::hash(&request.password, bcrypt::DEFAULT_COST) {
    Ok(hash) => hash,
    Err(err) => {
      warn!("Bcrypt error: {:?}", err);
      return Err(ServerError);
    }
  };

  let username = request.username.to_lowercase();
  let display_name = request.username.to_string();

  let profile_markdown = "";
  let profile_rendered_html = "";
  let ip_address = get_request_ip(&http_request);

  let query_result = sqlx::query!(
        r#"
INSERT INTO users (
  token,
  username,
  display_name,
  email_address,
  profile_markdown,
  profile_rendered_html,
  user_role_slug,
  password_hash,
  ip_address_creation,
  ip_address_last_login,
  ip_address_last_update
)
VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )
        "#,
        user_token.to_string(),
        username,
        display_name,
        request.email_address.to_string(),
        profile_markdown,
        profile_rendered_html,
        NEW_USER_ROLE,
        password_hash,
        ip_address.to_string(),
        ip_address.to_string(),
        ip_address.to_string(),
    )
    .execute(&server_state.mysql_pool)
    .await;

  let record_id = match query_result {
    Ok(res) => {
      res.last_insert_id()
    },
    Err(err) => {
      warn!("New user creation DB error: {:?}", err);

      // NB: SQLSTATE[23000]: Integrity constraint violation
      // NB: MySQL Error Code 1062: Duplicate key insertion (this is harder to access)
      match err {
        Database(err) => {
          let maybe_code = err.code().map(|c| c.into_owned());
          match maybe_code.as_deref() {
            Some("23000") => {
              if err.message().contains("username") {
                return Err(UsernameTaken);
              } else if err.message().contains("email_address") {
                return Err(EmailTaken);
              }
            }
            _ => {},
          }
        },
        _ => {},
      }
      return Err(ServerError);
    }
  };

  info!("new user id: {}", record_id);

  let session_token = random_token(32);

  let query_result = sqlx::query!(
        r#"
INSERT INTO user_sessions (
  token,
  user_token,
  ip_address_creation,
  expires_at
)
VALUES ( ?, ?, ?, NOW() + interval 1 year )
        "#,
        session_token.to_string(),
        user_token.to_string(),
        ip_address.to_string(),
    )
    .execute(&server_state.mysql_pool)
    .await;

  let record_id = match query_result {
    Ok(res) => {
      res.last_insert_id()
    },
    Err(err) => {
      warn!("New user session creation DB error: {:?}", err);
      return Err(ServerError);
    }
  };

  info!("new user session created");

  let session_cookie = match server_state.cookie_manager.create_cookie(&session_token) {
    Ok(cookie) => cookie,
    Err(_) => return Err(ServerError),
  };

  let response = CreateAccountSuccessResponse {
    success: true,
  };

  let body = serde_json::to_string(&response)
    .map_err(|e| BadInput("".to_string()))?;

  Ok(HttpResponse::Ok()
    .cookie(session_cookie)
    .content_type("application/json")
    .body(body))
}
