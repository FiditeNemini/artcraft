// NB: Incrementally getting rid of build warnings...
#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

use std::collections::HashMap;
use std::fmt;
use std::fmt::Formatter;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use log::{info, warn};
use sqlx::MySqlPool;
use actix_helpers::extractors::get_request_origin_uri::get_request_origin_uri;
use errors::AnyhowResult;

use http_server_common::request::get_request_ip::get_request_ip;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use mysql_queries::mediators::firehose_publisher::FirehosePublisher;
use mysql_queries::queries::users::user::create_account::{create_account, CreateAccountArgs, CreateAccountError};
use mysql_queries::queries::users::user_sessions::create_user_session::create_user_session;
use password::bcrypt_hash_password::bcrypt_hash_password;
use tokens::tokens::user_sessions::UserSessionToken;
use user_input_common::check_for_slurs::contains_slurs;

use crate::session::http::http_user_session_manager::HttpUserSessionManager;
use crate::utils::email_to_gravatar::email_to_gravatar;
use crate::validations::is_reserved_username::is_reserved_username;
use crate::validations::validate_passwords::validate_passwords;
use crate::validations::validate_username::validate_username;

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

  /// A signed session that can be sent as a header, bypassing cookies.
  /// This is useful for API clients that don't support cookies or Google
  /// browsers killing cross-domain cookies.
  pub signed_session: String,
}

#[derive(Serialize, Debug)]
pub struct CreateAccountErrorResponse {
  pub success: bool,
  pub error_type: CreateAccountErrorType,
  pub error_fields: HashMap<String, String>,
}

#[derive(Copy, Clone, Debug, Serialize)]
pub enum CreateAccountErrorType {
  BadRequest, // Other request malformed errors, eg. bad Origin header
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

  fn bad_request() -> Self {
    Self {
      success: false,
      error_type: CreateAccountErrorType::BadRequest,
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
      CreateAccountErrorType::BadRequest => StatusCode::BAD_REQUEST,
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
  mysql_pool: web::Data<MySqlPool>,
  session_cookie_manager: web::Data<HttpUserSessionManager>,
  firehose_publisher: web::Data<FirehosePublisher>,
) -> Result<HttpResponse, CreateAccountErrorResponse>
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

  let password_hash = match bcrypt_hash_password(request.password.clone()) {
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

  let ip_address = get_request_ip(&http_request);

  let maybe_origin = get_request_origin_uri(&http_request);

  let mut maybe_source = None;

  match maybe_origin {
    Ok(Some(uri)) => {
      if let Some(host) = uri.host() {
        if host.contains("storyteller") {
          maybe_source = Some("storyteller");
        } else if host.contains("fakeyou") {
          maybe_source = Some("fakeyou");
        }
      }
    }
    Ok(None) => {} // Fail open for now.
    Err(err) => {
      warn!("Origin header error: {:?}", err);
      return Err(CreateAccountErrorResponse::bad_request());
    }
  }

  let create_account_result = create_account(
    &mysql_pool,
    CreateAccountArgs {
      username: &username,
      display_name: &display_name,
      email_address: &email_address,
      email_gravatar_hash: &email_gravatar_hash,
      password_hash: &password_hash,
      ip_address: &ip_address,
      maybe_source,
      maybe_user_token: None, // NB: This parameter is for internal testing only
    }
  ).await;

  let new_user_data = match create_account_result {
    Ok(success) => success,
    Err(err) => {
      let mut error_fields = HashMap::new();
      let error_type;

      match err {
        CreateAccountError::EmailIsTaken => {
          error_type = CreateAccountErrorType::EmailTaken;
          error_fields.insert("email_address".to_string(), "email is taken".to_string());
        }
        CreateAccountError::UsernameIsTaken => {
          error_type = CreateAccountErrorType::UsernameTaken;
          error_fields.insert("username".to_string(), "username is taken".to_string());
        }
        CreateAccountError::DatabaseError | CreateAccountError::OtherError => {
          error_type = CreateAccountErrorType::ServerError;
        }
      }

      return Err(CreateAccountErrorResponse {
        success: false,
        error_type,
        error_fields
      });
    }
  };

  info!("new user id: {}", new_user_data.user_id);

  let create_session_result = create_user_session(
    new_user_data.user_token.as_str(),
    &ip_address,
    &mysql_pool
  ).await;

  let session_token = match create_session_result {
    Ok(token) => token,
    Err(e) => {
      warn!("create account session creation error : {:?}", e);
      return Err(CreateAccountErrorResponse::server_error());
    }
  };

  info!("new user session created");

  firehose_publisher.publish_user_sign_up(new_user_data.user_token.as_str())
    .await
    .map_err(|e| {
      warn!("error publishing event: {:?}", e);
      CreateAccountErrorResponse::server_error()
    })?;

  let session_token = UserSessionToken::new_from_str(&session_token);

  let session_cookie = match session_cookie_manager.create_cookie(&session_token, &new_user_data.user_token) {
    Ok(cookie) => cookie,
    Err(_) => return Err(CreateAccountErrorResponse::server_error()),
  };

  let signed_session = match session_cookie_manager.encode_session_payload(&session_token, &new_user_data.user_token) {
    Ok(payload) => payload,
    Err(_) => return Err(CreateAccountErrorResponse::server_error()),
  };

  let response = CreateAccountSuccessResponse {
    success: true,
    signed_session,
  };

  let body = serde_json::to_string(&response)
    .map_err(|_e| CreateAccountErrorResponse::server_error())?;

  Ok(HttpResponse::Ok()
    .cookie(session_cookie)
    .content_type("application/json")
    .body(body))
}
