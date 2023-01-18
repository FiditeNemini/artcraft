//// NB: Incrementally getting rid of build warnings...
#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

//! This endpoint recursively calculates (and caches) the list of every category a TTS model
//! belongs to. This saves an enormous amount of clientside CPU compute.
//!

use std::collections::{BTreeMap, BTreeSet};
use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use log::{error, info};

use tokens::tokens::model_categories::ModelCategoryToken;
use tokens::tokens::tts_models::TtsModelToken;

use crate::http_server::endpoints::categories::tts::list_fully_computed_assigned_tts_categories::error::ListFullyComputedAssignedTtsCategoriesError;
use crate::http_server::endpoints::categories::tts::list_fully_computed_assigned_tts_categories::query_and_construct_payload::query_and_construct_payload;
use crate::server_state::ServerState;

// =============== Success Response ===============

#[derive(Serialize)]
pub struct ListFullyComputedAssignedTtsCategoriesResponse {
  pub success: bool,

//  /// All category tokens in use by at least one TTS model.
//  /// Unused categories will not be present.
//  pub utilized_tts_category_tokens: UtilizedCategoryTokens,

  /// Maps of category tokens to the TTS model tokens that are assigned to them.
  pub category_token_to_tts_model_tokens: ModelTokensByCategoryToken,
}

//#[derive(Serialize)]
//pub struct UtilizedCategoryTokens {
//  /// Every category token used at least once by a TTS model (recursive).
//  /// This is a recursive membership, so parent categories with no models assigned will still be
//  /// present if at least one model is assigned to any of that category's children.
//  pub recursive: BTreeSet<ModelCategoryToken>,
//
//  /// Every category token used at least once by a TTS model (leaf only).
//  /// The TTS model must have a direct attachment to the category to be considered "assigned",
//  /// so parent categories will not be considered "utilized" in this sense unless they have models
//  /// directly assigned to them.
//  pub leaf_only: BTreeSet<ModelCategoryToken>,
//}

#[derive(Serialize, Clone)]
pub struct ModelTokensByCategoryToken {
  /// For every category, the TTS model tokens assigned. This is built up recursively.
  /// Parent categories *will* include all of the TTS models assigned to children categories.
  pub recursive: BTreeMap<ModelCategoryToken, BTreeSet<TtsModelToken>>,

//  /// For every category, the TTS model tokens *directly* assigned.
//  /// Parent categories *will not* include the TTS models assigned to children categories.
//  pub leaf_only: BTreeMap<ModelCategoryToken, BTreeSet<TtsModelToken>>,
}

// =============== Handler ===============

pub async fn list_fully_computed_assigned_tts_categories_handler(
  _http_request: HttpRequest,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, ListFullyComputedAssignedTtsCategoriesError>
{
  let maybe_category_assignments = server_state.caches.tts_model_category_assignments.copy_without_bump_if_unexpired()
      .map_err(|e| {
        error!("Error consulting cache: {:?}", e);
        ListFullyComputedAssignedTtsCategoriesError::ServerError
      })?;

  let category_assignments = match maybe_category_assignments {
    Some(category_assignments) => {
      info!("Serving TTS category assignments from cache");
      category_assignments
    },
    None => {
      let category_assignments = query_and_construct_payload(
        &server_state.caches.database_tts_category_list,
        &server_state.mysql_pool)
          .await?;

      server_state.caches.tts_model_category_assignments.store_copy(&category_assignments)
          .map_err(|e| {
            error!("Error storing cache: {:?}", e);
            ListFullyComputedAssignedTtsCategoriesError::ServerError
          })?;

      category_assignments
    },
  };

  let response = ListFullyComputedAssignedTtsCategoriesResponse {
    success: true,
    //utilized_tts_category_tokens: UtilizedCategoryTokens {
    //  recursive: recursive_category_tokens(&model_category_map, &categories),
    //  leaf_only: leaf_category_tokens(&model_category_map),
    //},
    category_token_to_tts_model_tokens: category_assignments,
  };

  let body = serde_json::to_string(&response)
      .map_err(|_e| ListFullyComputedAssignedTtsCategoriesError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
