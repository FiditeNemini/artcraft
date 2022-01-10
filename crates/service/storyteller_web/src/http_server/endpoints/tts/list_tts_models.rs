use actix_http::http::header;
use actix_web::HttpResponseBuilder;
use actix_web::cookie::Cookie;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest, HttpMessage};
use chrono::{DateTime, Utc};
use crate::database::queries::categories::list_tts_model_category_assignments::fetch_tts_model_category_map;
use crate::database::queries::list_tts_models::list_tts_models;
use crate::http_server::web_utils::ip_address::get_request_ip;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::server_state::ServerState;
use crate::util::anyhow_result::AnyhowResult;
use log::{info, warn, log, error};
use regex::Regex;
use sqlx::MySqlPool;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::collections::HashSet;
use std::fmt;
use std::sync::Arc;
use lexical_sort::natural_lexical_cmp;

#[derive(Serialize, Clone)]
pub struct TtsModelRecordForResponse {
  pub model_token: String,
  pub tts_model_type: String,
  pub creator_user_token: String,
  pub creator_username: String,
  pub creator_display_name: String,
  pub creator_gravatar_hash: String,
  pub title: String,

  /// Category assignments
  /// From non-deleted, mod-approved categories only
  pub category_tokens: HashSet<String>,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct ListTtsModelsSuccessResponse {
  pub success: bool,
  pub models: Vec<TtsModelRecordForResponse>,
}

#[derive(Debug)]
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
  pub creator_gravatar_hash: String,
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

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for ListTtsModelsError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

pub async fn list_tts_models_handler(
  http_request: HttpRequest,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, ListTtsModelsError>
{
  let maybe_models = server_state.voice_list_cache.copy_without_bump_if_unexpired()
      .map_err(|e| {
        error!("Error consulting cache: {:?}", e);
        ListTtsModelsError::ServerError
      })?;

  let models = match maybe_models {
    Some(models) => {
      info!("Serving TTS models from cache");
      models
    },
    None => {
      info!("Populating TTS models from database");
      let models = get_all_models(&server_state.mysql_pool)
          .await
          .map_err(|e| {
            error!("Error querying database: {:?}", e);
            ListTtsModelsError::ServerError
          })?;

      server_state.voice_list_cache.store_copy(&models)
          .map_err(|e| {
            error!("Error storing cache: {:?}", e);
            ListTtsModelsError::ServerError
          })?;
      models
    },
  };

  let response = ListTtsModelsSuccessResponse {
    success: true,
    models,
  };

  let body = serde_json::to_string(&response)
    .map_err(|e| ListTtsModelsError::ServerError)?;

  Ok(HttpResponse::Ok()
    .content_type("application/json")
    .body(body))
}

async fn get_all_models(mysql_pool: &MySqlPool) -> AnyhowResult<Vec<TtsModelRecordForResponse>> {
  let mut models = list_tts_models(
    mysql_pool,
    None,
    false
  ).await?;

  let model_categories_map
      = fetch_tts_model_category_map(mysql_pool).await?;

  // Make the list nice for human readers.
  models.sort_by(|a, b|
      natural_lexical_cmp(&a.title, &b.title));

  let models_for_response = models.into_iter()
      .map(|model| {
        TtsModelRecordForResponse {
          model_token: model.model_token.clone(),
          tts_model_type: model.tts_model_type.clone(),
          creator_user_token: model.creator_user_token.clone(),
          creator_username: model.creator_username.clone(),
          creator_display_name: model.creator_display_name.clone(),
          creator_gravatar_hash: model.creator_gravatar_hash.clone(),
          title: model.title.clone(),
          category_tokens: model_categories_map.model_to_category_tokens.get(&model.model_token)
              .map(|hash| hash.clone())
              .unwrap_or(HashSet::new()),
          created_at: model.created_at.clone(),
          updated_at: model.updated_at.clone(),
        }
      })
      .collect::<Vec<TtsModelRecordForResponse>>();

  Ok(models_for_response)
}
