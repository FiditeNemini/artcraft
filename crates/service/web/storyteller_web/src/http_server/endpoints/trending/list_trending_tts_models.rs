// NB: Incrementally getting rid of build warnings...
//#![forbid(unused_imports)]
//#![forbid(unused_mut)]
//#![forbid(unused_variables)]

//! This endpoint recursively calculates (and caches) the list of every category a TTS model
//! belongs to. This saves an enormous amount of clientside CPU compute.
//!

use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::{web, HttpResponse, HttpRequest};
use chrono::{DateTime, Utc};
use container_common::anyhow_result::AnyhowResult;
use crate::model::cached_queries::list_cached_tts_categories_for_public_dropdown::list_cached_tts_categories_for_public_dropdown;
use crate::model::categories::synthetic_category_list::SYNTHETIC_CATEGORY_LATEST_TTS_MODELS;
use crate::server_state::ServerState;
use database_queries::queries::model_categories::list_categories_query_builder::CategoryList;
use database_queries::queries::trending_model_analytics::list_trending_tts_models::{list_trending_tts_models, list_trending_tts_models_with_pool};
use database_queries::queries::tts::tts_category_assignments::fetch_and_build_tts_model_category_map::fetch_and_build_tts_model_category_map_with_connection;
use database_queries::queries::tts::tts_models::list_tts_models::list_tts_models_with_connection;
use enums::by_table::trending_model_analytics::window_name::WindowName;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use log::{info, error};
use memory_caching::single_item_ttl_cache::SingleItemTtlCache;
use sqlx::pool::PoolConnection;
use sqlx::{MySql, MySqlPool};
use std::collections::{BTreeMap, BTreeSet, HashMap, HashSet};
use std::fmt;
use std::sync::Arc;
use tokens::tokens::model_categories::ModelCategoryToken;
use tokens::tokens::tts_models::TtsModelToken;

// TODO TODO TODO: This endpoint is not done!
// TODO TODO TODO: This endpoint is not done!
// TODO TODO TODO: This endpoint is not done!
// TODO TODO TODO: This endpoint is not done!
// TODO TODO TODO: This endpoint is not done!
// TODO TODO TODO: This endpoint is not done!

// =============== Success Response ===============

#[derive(Serialize)]
pub struct ListTrendingTtsModelsResponse {
  pub success: bool,
  
  pub top_trending: WindowTrends,

  pub top_trending_by_language_code: HashMap<String, WindowTrends>,
}

pub type WindowTrends = HashMap<WindowName, Vec<TtsModelToken>>;


// =============== Error Response ===============

#[derive(Debug, Serialize)]
pub enum ListTrendingTtsModelsError {
  ServerError,
}

impl ResponseError for ListTrendingTtsModelsError {
  fn status_code(&self) -> StatusCode {
    match *self {
      ListTrendingTtsModelsError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    serialize_as_json_error(self)
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for ListTrendingTtsModelsError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

// =============== Handler ===============

pub async fn list_trending_tts_models_handler(
  _http_request: HttpRequest,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, ListTrendingTtsModelsError>
{

// TODO: Cache the outputs!

//  let maybe_category_assignments = server_state.caches.tts_model_category_assignments.copy_without_bump_if_unexpired()
//      .map_err(|e| {
//        error!("Error consulting cache: {:?}", e);
//        ListTrendingTtsModelsError::ServerError
//      })?;
//
//  let category_assignments = match maybe_category_assignments {
//    Some(category_assignments) => {
//      info!("Serving TTS category assignments from cache");
//      category_assignments
//    },
//    None => {
//      let category_assignments = query_and_construct_payload(
//        &server_state.caches.database_tts_category_list,
//        &server_state.mysql_pool)
//          .await?;
//
//      server_state.caches.tts_model_category_assignments.store_copy(&category_assignments)
//          .map_err(|e| {
//            error!("Error storing cache: {:?}", e);
//            ListTrendingTtsModelsError::ServerError
//          })?;
//
//      category_assignments
//    },
//  };

  let trending_models= list_trending_tts_models_with_pool(&server_state.mysql_pool).await
      .map_err(|e| {
        error!("Query error: {:?}", e);
        ListTrendingTtsModelsError::ServerError
      })?;

// TODO: Actually generate the response body sensibly.

  let mut top_trending = HashMap::new();
  let mut top_trending_by_language_code = HashMap::new();

  for trending_model in trending_models.models.iter() {
    if !top_trending_by_language_code.contains_key(&trending_model.ietf_primary_language_subtag) {
      top_trending_by_language_code.insert(trending_model.ietf_primary_language_subtag.clone(), HashMap::new());
    }

    if let Some(window_map) = top_trending_by_language_code.get_mut(&trending_model.ietf_primary_language_subtag) {
      if !window_map.contains_key(&trending_model.window_name) {
        window_map.insert(trending_model.window_name, Vec::new());
      }
    }
  }

  let response = ListTrendingTtsModelsResponse {
    success: true,
    top_trending,
    top_trending_by_language_code,
  };

  let body = serde_json::to_string(&response)
      .map_err(|_e| ListTrendingTtsModelsError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
