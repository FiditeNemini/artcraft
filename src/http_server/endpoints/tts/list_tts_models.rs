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
use chrono::{DateTime, Utc};
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;

#[derive(Serialize)]
pub struct TtsModelRecordForResponse {
  pub model_token: String,
  pub tts_model_type: String,
  pub creator_user_token: String,
  pub creator_username: String,
  pub creator_display_name: String,
  pub title: String,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct ListTtsModelsSuccessResponse {
  pub success: bool,
  pub models: Vec<TtsModelRecordForResponse>,
}

#[derive(Debug, Display)]
pub enum ListTtsModelsError {
  ServerError,
}

#[derive(Serialize)]
pub struct TtsModelRecord {
  pub model_token: String,
  pub tts_model_type: String,
  pub creator_user_token: String,
  pub creator_username: String,
  pub creator_display_name: String,
  pub title: String,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

impl ResponseError for ListTtsModelsError {
  fn status_code(&self) -> StatusCode {
    match *self {
      ListTtsModelsError::ServerError=> StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      ListTtsModelsError::ServerError => "server error".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

pub async fn list_tts_models_handler(
  http_request: HttpRequest,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, ListTtsModelsError>
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
    tts.title,
    tts.created_at,
    tts.updated_at
FROM tts_models as tts
JOIN users
    ON users.token = tts.creator_user_token
WHERE
    tts.user_deleted_at IS NULL
    AND tts.mod_deleted_at IS NULL
        "#,
    )
    .fetch_all(&server_state.mysql_pool)
    .await; // TODO: This will return error if it doesn't exist

  let mut models : Vec<TtsModelRecord> = match maybe_models {
    Ok(models) => models,
    Err(err) => {
      match err {
        RowNotFound => {
          return Err(ListTtsModelsError::ServerError);
        },
        _ => {
          warn!("tts models list query error: {:?}", err);
          return Err(ListTtsModelsError::ServerError);
        }
      }
    }
  };

  models.sort_by(|a, b| (&a.title).cmp(&b.title));

  let models_for_response = models.into_iter()
    .map(|model| {
      TtsModelRecordForResponse {
        model_token: model.model_token.clone(),
        tts_model_type: model.tts_model_type.clone(),
        creator_user_token: model.creator_user_token.clone(),
        creator_username: model.creator_username.clone(),
        creator_display_name: model.creator_display_name.clone(),
        title: model.title.clone(),
        created_at: model.created_at.clone(),
        updated_at: model.updated_at.clone(),
      }
    })
    .collect::<Vec<TtsModelRecordForResponse>>();

  let response = ListTtsModelsSuccessResponse {
    success: true,
    models: models_for_response,
  };

  let body = serde_json::to_string(&response)
    .map_err(|e| ListTtsModelsError::ServerError)?;

  Ok(HttpResponse::Ok()
    .content_type("application/json")
    .body(body))
}
