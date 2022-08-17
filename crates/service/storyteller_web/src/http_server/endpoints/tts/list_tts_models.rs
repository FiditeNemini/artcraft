// NB: Incrementally getting rid of build warnings...
#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::{web, HttpResponse, HttpRequest};
use chrono::{DateTime, Utc};
use container_common::anyhow_result::AnyhowResult;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::server_state::ServerState;
use database_queries::queries::tts::tts_category_assignments::fetch_and_build_tts_model_category_map::fetch_and_build_tts_model_category_map_with_connection;
use database_queries::queries::tts::tts_models::list_tts_models::list_tts_models_with_connection;
use lexical_sort::natural_lexical_cmp;
use log::{info, warn, error};
use sqlx::MySql;
use sqlx::pool::PoolConnection;
use std::collections::HashSet;
use std::fmt;
use std::sync::Arc;

#[derive(Serialize, Clone)]
pub struct TtsModelRecordForResponse {
  pub model_token: String,
  pub tts_model_type: String,
  pub creator_user_token: String,
  pub creator_username: String,
  pub creator_display_name: String,
  pub creator_gravatar_hash: String,
  pub title: String,
  pub ietf_language_tag: String,
  pub ietf_primary_language_subtag: String,
  pub is_front_page_featured: bool,
  pub is_twitch_featured: bool,
  pub maybe_suggested_unique_bot_command: Option<String>,

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
  _http_request: HttpRequest,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, ListTtsModelsError>
{
  let maybe_models = server_state.caches.voice_list.copy_without_bump_if_unexpired()
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

      let mut mysql_connection = server_state.mysql_pool.acquire()
          .await
          .map_err(|e| {
            warn!("Could not acquire DB pool: {:?}", e);
            ListTtsModelsError::ServerError
          })?;

      let models = get_all_models(&mut mysql_connection)
          .await
          .map_err(|e| {
            error!("Error querying database: {:?}", e);
            ListTtsModelsError::ServerError
          })?;

      server_state.caches.voice_list.store_copy(&models)
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
    .map_err(|_e| ListTtsModelsError::ServerError)?;

  Ok(HttpResponse::Ok()
    .content_type("application/json")
    .body(body))
}

async fn get_all_models(mysql_connection: &mut PoolConnection<MySql>) -> AnyhowResult<Vec<TtsModelRecordForResponse>> {
  let mut models = list_tts_models_with_connection(
    mysql_connection,
    None,
    false
  ).await?;

  let model_categories_map
      = fetch_and_build_tts_model_category_map_with_connection(mysql_connection).await?;

  // Make the list nice for human readers.
  models.sort_by(|a, b|
      natural_lexical_cmp(&a.title, &b.title));

  let models_for_response = models.into_iter()
      .map(|model| {
        let model_token = model.model_token.clone();
        TtsModelRecordForResponse {
          model_token: model.model_token,
          tts_model_type: model.tts_model_type,
          creator_user_token: model.creator_user_token,
          creator_username: model.creator_username,
          creator_display_name: model.creator_display_name,
          creator_gravatar_hash: model.creator_gravatar_hash,
          title: model.title,
          ietf_language_tag: model.ietf_language_tag,
          ietf_primary_language_subtag: model.ietf_primary_language_subtag,
          is_front_page_featured: model.is_front_page_featured,
          is_twitch_featured: model.is_twitch_featured,
          maybe_suggested_unique_bot_command: model.maybe_suggested_unique_bot_command,
          category_tokens: model_categories_map.model_to_category_tokens.get(&model_token)
              .map(|hash| hash.clone())
              .unwrap_or(HashSet::new()),
          created_at: model.created_at,
          updated_at: model.updated_at,
        }
      })
      .collect::<Vec<TtsModelRecordForResponse>>();

  Ok(models_for_response)
}
