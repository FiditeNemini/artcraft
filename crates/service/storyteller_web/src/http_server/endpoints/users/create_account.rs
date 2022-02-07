use actix_http::Error;
use actix_http::http::header;
use actix_web::HttpResponseBuilder;
use actix_web::cookie::Cookie;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest};
use crate::database::queries::create_session::create_session_for_user;
use crate::http_server::endpoints::users::create_account::CreateAccountErrorType::{BadInput, ServerError, UsernameTaken, EmailTaken};
use crate::http_server::web_utils::ip_address::get_request_ip;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::http_server::web_utils::serialize_as_json_error::serialize_as_json_error;
use crate::server_state::ServerState;
use crate::util::email_to_gravatar::email_to_gravatar;
use crate::validations::passwords::validate_passwords;
use crate::validations::username::validate_username;
use crate::validations::username_reservations::is_reserved_username;
use database_queries::tokens::Tokens;
use derive_more::{Display, Error};
use log::{info, warn, log};
use regex::Regex;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::collections::HashMap;
use std::fmt::Formatter;
use std::fmt;
use std::sync::Arc;
use user_input_common::check_for_slurs::contains_slurs;

const NEW_USER_ROLE: &'static str = "user";

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

#[derive(Serialize, Debug)]
pub struct CreateAccountErrorResponse {
  pub success: bool,
  pub error_type: CreateAccountErrorType,
  pub error_fields: HashMap<String, String>,
}

#[derive(Copy, Clone, Debug, Serialize)]
pub enum CreateAccountErrorType {
  BadInput,
  EmailTaken,
  ServerError,
  UsernameReserved,
  UsernameTaken,
}

impl CreateAccountErrorResponse {
  fn server_error() -> Self {
    Self {
      success: false,
      error_type: CreateAccountErrorType::ServerError,
      error_fields: HashMap::new(),
    }
  }
}

// NB: Not using DeriveMore since Clion doesn't understand it.
impl fmt::Display for CreateAccountErrorResponse {
  fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self.error_type)
  }
}

impl ResponseError for CreateAccountErrorResponse {
  fn status_code(&self) -> StatusCode {
    match self.error_type {
      CreateAccountErrorType::BadInput => StatusCode::BAD_REQUEST,
      CreateAccountErrorType::EmailTaken => StatusCode::BAD_REQUEST,
      CreateAccountErrorType::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
      CreateAccountErrorType::UsernameReserved => StatusCode::BAD_REQUEST,
      CreateAccountErrorType::UsernameTaken => StatusCode::BAD_REQUEST,
    }
  }

  fn error_response(&self) -> HttpResponse {
    serialize_as_json_error(self)
  }
}

pub async fn create_account_handler(
  http_request: HttpRequest,
  request: web::Json<CreateAccountRequest>,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, CreateAccountErrorResponse>
{
  let mut error_fields = HashMap::new();

  if let Err(reason) = validate_username(&request.username) {
    error_fields.insert("username".to_string(), reason);
  }

  if let Err(reason) = validate_passwords(&request.password, &request.password_confirmation) {
    error_fields.insert("password".to_string(), reason);
  }

  if contains_slurs(&request.username) {
    error_fields.insert("username".to_string(), "username contains slurs".to_string());
  }

  if !request.email_address.contains("@") {
    error_fields.insert("email_address".to_string(), "invalid email address".to_string());
  }

  if is_reserved_username(&request.username) {
    error_fields.insert("username".to_string(), "username is reserved".to_string());

    return Err(CreateAccountErrorResponse {
      success: false,
      error_type: CreateAccountErrorType::UsernameReserved,
      error_fields
    });
  }

  if !error_fields.is_empty() {
    return Err(CreateAccountErrorResponse {
      success: false,
      error_type: CreateAccountErrorType::BadInput,
      error_fields
    });
  }

  let user_token = Tokens::new_user()
    .map_err(|e| {
      warn!("Bad crockford token: {:?}", e);
      CreateAccountErrorResponse::server_error()
    })?;

  let password_hash = match bcrypt::hash(&request.password, bcrypt::DEFAULT_COST) {
    Ok(hash) => hash,
    Err(err) => {
      warn!("Bcrypt error: {:?}", err);
      return Err(CreateAccountErrorResponse::server_error());
    }
  };

  let username = request.username.trim().to_lowercase();
  let display_name = request.username.trim().to_string();

  let email_address = request.email_address.trim().to_lowercase();

  let email_gravatar_hash = email_to_gravatar(&email_address);

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
  email_gravatar_hash,
  profile_markdown,
  profile_rendered_html,
  user_role_slug,
  password_hash,
  ip_address_creation,
  ip_address_last_login,
  ip_address_last_update
)
VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )
        "#,
        user_token.to_string(),
        username,
        display_name,
        email_address,
        email_gravatar_hash,
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
          let mut error_fields = HashMap::new();
          let mut maybe_error_type = None;

          match maybe_code.as_deref() {
            Some("23000") => {
              if err.message().contains("username") {
                maybe_error_type = Some(CreateAccountErrorType::UsernameTaken);
                error_fields.insert("username".to_string(), "username is taken".to_string());
              } else if err.message().contains("email_address") {
                maybe_error_type = Some(CreateAccountErrorType::EmailTaken);
                error_fields.insert("email_address".to_string(), "email is taken".to_string());
              }
            }
            _ => {},
          }

          if let Some(error_type) = maybe_error_type {
            return Err(CreateAccountErrorResponse {
              success: false,
              error_type,
              error_fields
            })
          }
        },
        _ => {},
      }
      return Err(CreateAccountErrorResponse::server_error());
    }
  };

  info!("new user id: {}", record_id);

  // TODO: Remove me in the future. Too lazy to check the date, plus this will
  //  vary with adoption rate.
  server_state.badge_granter.grant_early_user_badge(&user_token)
      .await
      .map_err(|e| {
        warn!("error creating badge: {:?}", e);
        CreateAccountErrorResponse::server_error()
      })?;

  let create_session_result =
    create_session_for_user(&user_token, &ip_address, &server_state.mysql_pool).await;

  let session_token = match create_session_result {
    Ok(token) => token,
    Err(e) => {
      warn!("create account session creation error : {:?}", e);
      return Err(CreateAccountErrorResponse::server_error());
    }
  };

  info!("new user session created");

  server_state.firehose_publisher.publish_user_sign_up(&user_token)
    .await
    .map_err(|e| {
      warn!("error publishing event: {:?}", e);
      CreateAccountErrorResponse::server_error()
    })?;

  let session_cookie = match server_state.cookie_manager.create_cookie(&session_token) {
    Ok(cookie) => cookie,
    Err(_) => return Err(CreateAccountErrorResponse::server_error()),
  };

  let response = CreateAccountSuccessResponse {
    success: true,
  };

  let body = serde_json::to_string(&response)
    .map_err(|e| CreateAccountErrorResponse::server_error())?;

  Ok(HttpResponse::Ok()
    .cookie(session_cookie)
    .content_type("application/json")
    .body(body))
}
