use actix_http::Error;
use actix_http::http::header;
use actix_web::HttpResponseBuilder;
use actix_web::cookie::Cookie;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::{Path, Json};
use actix_web::{Responder, web, HttpResponse, error, HttpRequest};
use chrono::{DateTime, Utc};
use crate::database::enums::record_visibility::RecordVisibility;
use crate::database::queries::query_w2l_template::select_w2l_template_by_token;
use crate::database::query_builders::list_categories_query_builder::ListCategoriesQueryBuilder;
use crate::http_server::web_utils::ip_address::get_request_ip;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::http_server::web_utils::response_success_helpers::simple_json_success;
use crate::server_state::ServerState;
use crate::util::email_to_gravatar::email_to_gravatar;
use crate::util::markdown_to_html::markdown_to_html;
use crate::util::random_crockford_token::random_crockford_token;
use crate::util::random_prefix_crockford_token::random_prefix_crockford_token;
use crate::validations::check_for_slurs::contains_slurs;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use log::{info, warn, log};
use regex::Regex;
use sqlx::MySqlPool;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::fmt;
use std::sync::Arc;

// =============== Success Response ===============

#[derive(Serialize)]
pub struct ListTtsCategoriesResponse {
  pub success: bool,
  pub categories: Vec<DisplayCategory>,
}

/// Public-facing and optimized (non-irrelevant fields) category list
/// Used for the main TTS dropdown as well as the TTS edit/tagging UI
#[derive(Serialize)]
pub struct DisplayCategory {
  pub category_token: String,

  pub model_type: String, // TODO: ENUM

  pub maybe_super_category_token: Option<String>,

  pub can_directly_have_models: bool,
  pub can_have_subcategories: bool,
  pub can_only_mods_apply: bool,

  pub name: String,
  pub maybe_dropdown_name: Option<String>,

  // Moderator fields
  // It's okay to leak this since we do for assigned categories and for mods to see
  // which assigned categories might be invalid.
  pub is_mod_approved: Option<bool>,

  //pub creator_user_token: Option<String>,
  //pub creator_username: Option<String>,
  //pub creator_display_name: Option<String>,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
  pub deleted_at: Option<DateTime<Utc>>,
}

// =============== Error Response ===============

#[derive(Debug, Serialize)]
pub enum ListTtsCategoriesError {
  NotAuthorized,
  ServerError,
}

impl ResponseError for ListTtsCategoriesError {
  fn status_code(&self) -> StatusCode {
    match *self {
      ListTtsCategoriesError::NotAuthorized => StatusCode::UNAUTHORIZED,
      ListTtsCategoriesError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    serialize_as_json_error(self)
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for ListTtsCategoriesError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

// =============== Handler ===============

pub async fn list_tts_categories_handler(
  http_request: HttpRequest,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, ListTtsCategoriesError>
{
  let query_builder = ListCategoriesQueryBuilder::new()
      .show_deleted(false)
      .show_unapproved(false)
      .scope_model_type(Some("tts"));
  
  let query_result =
      query_builder.perform_query(&server_state.mysql_pool).await;

  let results = match query_result {
    Ok(results) => results,
    Err(err) => {
      warn!("DB error: {:?}", err);
      return Err(ListTtsCategoriesError::ServerError);
    }
  };

  warn!("Number of categories: {:?}", results.categories.len());

  let mut categories = results.categories.iter()
      .map(|c| {
        DisplayCategory {
          category_token: c.category_token.clone(),
          model_type: c.model_type.clone(),
          maybe_super_category_token: c.maybe_super_category_token.clone(),
          can_directly_have_models: c.can_directly_have_models,
          can_have_subcategories: c.can_have_subcategories,
          can_only_mods_apply: c.can_only_mods_apply,
          is_mod_approved: c.is_mod_approved,
          name: c.name.clone(),
          maybe_dropdown_name: c.maybe_dropdown_name.clone(),
          created_at: c.created_at.clone(),
          updated_at: c.updated_at.clone(),
          deleted_at: c.deleted_at.clone(),
        }
      })
      .collect::<Vec<DisplayCategory>>();

  // TODO: Sort by dropdown name too.
  categories.sort_by(|c1, c2| c1.name.cmp(&c2.name));

  // TODO: Cache results in Redis w/ TTL.
  let response = ListTtsCategoriesResponse {
    success: true,
    categories,
  };

  let body = serde_json::to_string(&response)
      .map_err(|e| ListTtsCategoriesError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
