use actix_http::Error;
use actix_http::http::header;
use actix_web::cookie::Cookie;
use actix_web::dev::HttpResponseBuilder;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Path;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest, HttpMessage};
use chrono::{DateTime, Utc};
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

/// For the URL PathInfo
#[derive(Deserialize)]
pub struct GetTtsModelPathInfo {
  slug: String,
}

#[derive(Serialize)]
pub struct TtsModelRecordForResponse {
  pub model_token: String,
  pub tts_model_type: String,

  pub creator_user_token: String,
  pub creator_username: String,
  pub creator_display_name: String,

  pub updatable_slug: String,
  pub title: String,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct GetTtsModelSuccessResponse {
  pub success: bool,
  pub model: TtsModelRecordForResponse,
}

#[derive(Serialize)]
pub struct ErrorResponse {
  pub success: bool,
  pub error_reason: String,
}

#[derive(Debug, Display)]
pub enum GetTtsModelError {
  ServerError,
}

#[derive(Serialize)]
pub struct TtsModelRecord {
  pub model_token: String,
  pub tts_model_type: String,

  pub creator_user_token: String,
  pub creator_username: String,
  pub creator_display_name: String,

  pub updatable_slug: String,
  pub title: String,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

impl ResponseError for GetTtsModelError {
  fn status_code(&self) -> StatusCode {
    match *self {
      GetTtsModelError::ServerError=> StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      GetTtsModelError::ServerError => "server error".to_string(),
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

pub async fn get_tts_model_handler(
  http_request: HttpRequest,
  path: Path<GetTtsModelPathInfo>,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, GetTtsModelError>
{
  // NB: Lookup failure is Err(RowNotFound).
  // NB: Since this is publicly exposed, we don't query sensitive data.
  let maybe_models = sqlx::query_as!(
      TtsModelRecord,
        r#"
SELECT
    tts.token as model_token,
    tts.tts_model_type,

    tts.creator_user_token,
    users.username as creator_username,
    users.display_name as creator_display_name,

    tts.updatable_slug,
    tts.title,

    tts.created_at,
    tts.updated_at
FROM tts_models as tts
JOIN users
ON users.token = tts.creator_user_token
WHERE tts.updatable_slug = ?
AND tts.deleted_at IS NULL
        "#,
      &path.slug
    )
    .fetch_one(&server_state.mysql_pool)
    .await; // TODO: This will return error if it doesn't exist

  let template : TtsModelRecord = match maybe_models {
    Ok(models) => models,
    Err(err) => {
      match err {
        RowNotFound => {
          return Err(GetTtsModelError::ServerError);
        },
        _ => {
          warn!("tts template query error: {:?}", err);
          return Err(GetTtsModelError::ServerError);
        }
      }
    }
  };

  let model_for_response = TtsModelRecordForResponse {
    model_token: template.model_token.clone(),
    tts_model_type: template.tts_model_type.clone(),
    creator_user_token: template.creator_user_token.clone(),
    creator_username: template.creator_username.clone(),
    creator_display_name: template.creator_display_name.clone(),
    updatable_slug: template.updatable_slug.clone(),
    title: template.title.clone(),
    created_at: template.created_at.clone(),
    updated_at: template.updated_at.clone(),
  };

  let response = GetTtsModelSuccessResponse {
    success: true,
    model: model_for_response,
  };

  let body = serde_json::to_string(&response)
    .map_err(|e| GetTtsModelError::ServerError)?;

  Ok(HttpResponse::Ok()
    .content_type("application/json")
    .body(body))
}
