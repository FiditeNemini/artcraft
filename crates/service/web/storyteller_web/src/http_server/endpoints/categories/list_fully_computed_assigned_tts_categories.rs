// NB: Incrementally getting rid of build warnings...
#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

//! This endpoint recursively calculates (and caches) the list of every category a TTS model
//! belongs to. This saves an enormous amount of clientside CPU compute.
//!

use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::{web, HttpResponse, HttpRequest};
use container_common::anyhow_result::AnyhowResult;
use crate::server_state::ServerState;
use database_queries::queries::model_categories::list_categories_query_builder::ListCategoriesQueryBuilder;
use database_queries::queries::tts::tts_category_assignments::fetch_and_build_tts_model_category_map::fetch_and_build_tts_model_category_map_with_connection;
use database_queries::queries::tts::tts_models::list_tts_models::list_tts_models_with_connection;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use lexical_sort::natural_lexical_cmp;
use log::{info, error};
use sqlx::{MySql, MySqlPool};
use sqlx::pool::PoolConnection;
use std::collections::{BTreeMap, BTreeSet, HashMap, HashSet};
use std::fmt;
use std::sync::Arc;
use tokens::tokens::model_categories::ModelCategoryToken;
use tokens::tokens::tts_models::TtsModelToken;

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

#[derive(Serialize)]
pub struct UtilizedCategoryTokens {
  /// Every category token used at least once by a TTS model (recursive).
  /// This is a recursive membership, so parent categories with no models assigned will still be
  /// present if at least one model is assigned to any of that category's children.
  pub recursive: BTreeSet<ModelCategoryToken>,

  /// Every category token used at least once by a TTS model (leaf only).
  /// The TTS model must have a direct attachment to the category to be considered "assigned",
  /// so parent categories will not be considered "utilized" in this sense unless they have models
  /// directly assigned to them.
  pub leaf_only: BTreeSet<ModelCategoryToken>,
}

#[derive(Serialize, Clone)]
pub struct ModelTokensByCategoryToken {
  /// For every category, the TTS model tokens assigned. This is built up recursively.
  /// Parent categories *will* include all of the TTS models assigned to children categories.
  pub recursive: BTreeMap<ModelCategoryToken, BTreeSet<TtsModelToken>>,

  /// For every category, the TTS model tokens *directly* assigned.
  /// Parent categories *will not* include the TTS models assigned to children categories.
  pub leaf_only: BTreeMap<ModelCategoryToken, BTreeSet<TtsModelToken>>,
}

// =============== Error Response ===============

#[derive(Debug, Serialize)]
pub enum ListFullyComputedAssignedTtsCategoriesError {
  ServerError,
}

impl ResponseError for ListFullyComputedAssignedTtsCategoriesError {
  fn status_code(&self) -> StatusCode {
    match *self {
      ListFullyComputedAssignedTtsCategoriesError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    serialize_as_json_error(self)
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for ListFullyComputedAssignedTtsCategoriesError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
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
      let category_assignments = query_and_construct_payload(&server_state.mysql_pool)
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

#[derive(Clone)]
struct CategoryInfoLite {
  category_token: ModelCategoryToken,
  maybe_parent_category_token: Option<ModelCategoryToken>,
  category_name_for_sorting: String,
}

#[derive(Clone)]
struct TtsModelInfoLite {
  model_token: TtsModelToken,
  title_for_sorting: String,
}

#[derive(Clone)]
struct TtsModelTokenToCategoryTokenLight {
  map: HashMap<TtsModelToken, HashSet<ModelCategoryToken>> // NB: Stronger types than the library we consume
}

type CategoryTokenToCategoryMap = HashMap<ModelCategoryToken, CategoryInfoLite>;

type ModelTokenToCategoryTokensMap = HashMap<TtsModelToken, HashSet<ModelCategoryToken>>;

// NB: We use BTree to maintain insertion order for our return type.
type CategoryTokenToModelTokensMap = BTreeMap<ModelCategoryToken, BTreeSet<TtsModelToken>>;

async fn query_and_construct_payload(mysql_pool: &MySqlPool) -> Result<ModelTokensByCategoryToken, ListFullyComputedAssignedTtsCategoriesError> {
  let (categories, model_category_map) = {
    let mut mysql_connection = mysql_pool.acquire()
        .await
        .map_err(|e| {
          error!("Could not acquire DB pool: {:?}", e);
          ListFullyComputedAssignedTtsCategoriesError::ServerError
        })?;

    //let models = list_tts_models(&mut mysql_connection)
    //    .await
    //    .map_err(|e| {
    //      error!("Error querying models: {:?}", e);
    //      ListFullyComputedAssignedTtsCategoriesError::ServerError
    //    })?;

    let categories = list_tts_categories(&mut mysql_connection)
        .await
        .map_err(|e| {
          error!("Error querying categories: {:?}", e);
          ListFullyComputedAssignedTtsCategoriesError::ServerError
        })?;

    let model_category_map = build_model_categories_map(&mut mysql_connection)
        .await
        .map_err(|e| {
          error!("Error querying and building model category map: {:?}", e);
          ListFullyComputedAssignedTtsCategoriesError::ServerError
        })?;

    (categories, model_category_map)
  };

  Ok(ModelTokensByCategoryToken {
    recursive: recursive_category_to_model_map(&model_category_map, &categories),
    leaf_only: leaf_category_to_model_map(&model_category_map),
  })
}

// ========== Queries / model transformations ==========

async fn list_tts_categories(mysql_connection: &mut PoolConnection<MySql>) -> AnyhowResult<Vec<CategoryInfoLite>> {
  let query_builder = ListCategoriesQueryBuilder::new()
      .show_deleted(false)
      .show_unapproved(false)
      .scope_model_type(Some("tts"));

  let categories = query_builder
      .perform_query_using_connection(mysql_connection)
      .await?
      .categories;

  let mut categories = categories.into_iter()
      .map(|c| CategoryInfoLite {
        category_token: ModelCategoryToken::new(c.category_token),
        maybe_parent_category_token: c.maybe_super_category_token.map(|t| ModelCategoryToken::new(t)),
        // NB: This might produce weird sorting resorts relative to the "name" field,
        // but the typical way this should be consumed is via dropdowns.
        category_name_for_sorting: c.maybe_dropdown_name.unwrap_or(c.name),
      })
      .collect::<Vec<CategoryInfoLite>>();

  // NB: This might produce weird sorting resorts relative to the "name" field,
  // but the typical way this should be consumed is via dropdowns.
  categories.sort_by(|c1, c2|
      natural_lexical_cmp(&c1.category_name_for_sorting, &c2.category_name_for_sorting));

  Ok(categories)
}

async fn list_tts_models(mysql_connection: &mut PoolConnection<MySql>) -> AnyhowResult<Vec<TtsModelInfoLite>> {
  let models = list_tts_models_with_connection(
    mysql_connection,
    None,
    false
  ).await?;

  let mut models = models.into_iter()
      .map(|m| TtsModelInfoLite {
        model_token: TtsModelToken::new_from_str(&m.model_token),
        title_for_sorting: m.title,
      })
      .collect::<Vec<TtsModelInfoLite>>();

  // Make the list nice for human readers.
  models.sort_by(|a, b|
      natural_lexical_cmp(&a.title_for_sorting, &b.title_for_sorting));

  Ok(models)
}

async fn build_model_categories_map(mysql_connection: &mut PoolConnection<MySql>) -> AnyhowResult<ModelTokenToCategoryTokensMap> {
  // NB: It looks like the underlying code filters out TTS models if they're deleted or locked,
  // but it does no filtering (or joining!) to categories, which may result in spurious categories
  // being returned in the map.
  let untyped_map  = fetch_and_build_tts_model_category_map_with_connection(mysql_connection).await?;

  // NB: Stronger types
  let map = untyped_map.model_to_category_tokens.into_iter()
      .map(|(model_token, category_tokens)| {
        let model_token = TtsModelToken::new(model_token);
        let category_tokens = category_tokens.into_iter()
            .map(|category_token| ModelCategoryToken::new(category_token))
            .collect::<HashSet<ModelCategoryToken>>();
        (model_token, category_tokens)
      })
      .collect::<HashMap<TtsModelToken, HashSet<ModelCategoryToken>>>();

  Ok(map)
}

// ========== Calculations ==========

fn leaf_category_tokens(model_category_map: &ModelTokenToCategoryTokensMap) -> BTreeSet<ModelCategoryToken> {
  model_category_map
      .values()
      .flatten()
      .map(|category_token| category_token.clone())
      .collect::<BTreeSet<ModelCategoryToken>>()
}

fn recursive_category_tokens(model_category_map: &ModelTokenToCategoryTokensMap, all_categories: &Vec<CategoryInfoLite>) -> BTreeSet<ModelCategoryToken> {
  let mut category_tokens = leaf_category_tokens(model_category_map);

  let all_categories_by_token = all_categories.iter()
      .map(|cat| (cat.category_token.clone(), cat.clone()))
      .collect::<HashMap<ModelCategoryToken, CategoryInfoLite>>();

  let mut last_size = 0;

  // NB: Not really "recursive" :P
  while last_size != category_tokens.len() {
    last_size = category_tokens.len();

    let mut new_category_tokens = HashSet::new();

    for category_token in category_tokens.iter() {
      let maybe_parent_category_token= all_categories_by_token.get(category_token)
          .and_then(|category| category.maybe_parent_category_token.as_ref());

      let parent_category_token = match maybe_parent_category_token {
        Some(parent_category_token) => parent_category_token,
        None => continue,
      };

      if !category_tokens.contains(parent_category_token) {
        new_category_tokens.insert(parent_category_token.clone());
      }
    }

    if !new_category_tokens.is_empty() {
      category_tokens.extend(new_category_tokens);
    }
  }

  category_tokens
}

fn leaf_category_to_model_map(model_category_map: &ModelTokenToCategoryTokensMap) -> CategoryTokenToModelTokensMap {
  let mut category_token_to_model_tokens : CategoryTokenToModelTokensMap = BTreeMap::new();

  for (model_token, category_tokens) in model_category_map.iter() {
    for category_token in category_tokens {
      // FIXME(bt, 2023-01-13): Cleanup overly verbose implementation
      if !category_token_to_model_tokens.contains_key(category_token) {
        category_token_to_model_tokens.insert(category_token.clone(), BTreeSet::new());
      }
      if let Some(inner_map) = category_token_to_model_tokens.get_mut(category_token) {
        inner_map.insert(model_token.clone());
      }
    }
  }

  category_token_to_model_tokens
}

fn recursive_category_to_model_map(model_category_map: &ModelTokenToCategoryTokensMap, all_categories: &Vec<CategoryInfoLite>) -> CategoryTokenToModelTokensMap {
  let category_token_to_category_map = all_categories.iter()
      .map(|category| {
        (category.category_token.clone(), category.clone())
      })
      .collect::<HashMap<ModelCategoryToken, CategoryInfoLite>>();

//  // Build a map of category => all ancestor categories.
//  let category_token_to_all_category_parent_tokens_map = all_categories.iter()
//      .map(|category| {
//        let category_token = category.category_token.clone();
//        let parent_category_tokens = find_category_ancestors(&category_token, &category_token_to_category_map);
//        (category_token, parent_category_tokens)
//      })
//      .collect::<HashMap<ModelCategoryToken, HashSet<ModelCategoryToken>>>();

  let mut category_token_to_model_tokens = BTreeMap::new();

  for (model_token, model_category_tokens) in model_category_map.iter() {

    for direct_category_token in model_category_tokens {
      // FIXME(bt, 2023-01-13): Cleanup overly verbose implementation

      let mut all_ancestor_categories = find_category_ancestors(direct_category_token, &category_token_to_category_map);
      all_ancestor_categories.insert(direct_category_token.clone());

      for category_token in all_ancestor_categories.iter() {

        if !category_token_to_model_tokens.contains_key(category_token) {
          category_token_to_model_tokens.insert(category_token.clone(), BTreeSet::new());
        }
        if let Some(inner_map) = category_token_to_model_tokens.get_mut(category_token) {
          inner_map.insert(model_token.clone());
        }
      }
    }
  }

  category_token_to_model_tokens
}

fn find_category_ancestors(category_token: &ModelCategoryToken, token_to_category_map: &CategoryTokenToCategoryMap) -> HashSet<ModelCategoryToken> {
  return recursively_find_category_ancestors(category_token, token_to_category_map);
}

fn recursively_find_category_ancestors(
  category_token: &ModelCategoryToken,
  token_to_category_map: &CategoryTokenToCategoryMap,
) -> HashSet<ModelCategoryToken> {
  match token_to_category_map.get(category_token) {
    None => HashSet::new(),
    Some(category) => {
      match category.maybe_parent_category_token {
        None => HashSet::from([category.category_token.clone()]),
        Some(ref parent_category_token) => {
          let mut tokens = recursively_find_category_ancestors(parent_category_token, token_to_category_map);
          tokens.insert(category.category_token.clone());
          tokens
        }
      }
    }
  }
}

#[cfg(test)]
mod tests {
  // TODO: This really needs tests!
}
