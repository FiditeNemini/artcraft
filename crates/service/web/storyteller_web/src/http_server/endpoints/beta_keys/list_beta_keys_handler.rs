use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Query;
use chrono::{DateTime, Utc};
use log::{debug, error, warn};
use r2d2_redis::redis::Commands;
use utoipa::{IntoParams, ToSchema};

use buckets::public::media_files::bucket_file_path::MediaFileBucketPath;
use enums::by_table::beta_keys::beta_key_product::BetaKeyProduct;
use enums::by_table::media_files::media_file_animation_type::MediaFileAnimationType;
use enums::by_table::media_files::media_file_class::MediaFileClass;
use enums::by_table::media_files::media_file_engine_category::MediaFileEngineCategory;
use enums::by_table::media_files::media_file_origin_category::MediaFileOriginCategory;
use enums::by_table::media_files::media_file_origin_model_type::MediaFileOriginModelType;
use enums::by_table::media_files::media_file_origin_product_category::MediaFileOriginProductCategory;
use enums::by_table::media_files::media_file_type::MediaFileType;
use enums::common::view_as::ViewAs;
use enums::no_table::style_transfer::style_transfer_name::StyleTransferName;
use mysql_queries::queries::beta_keys::list_beta_keys::{list_beta_keys, ListBetaKeysArgs};
use mysql_queries::queries::users::user_profiles::get_user_profile_by_username::get_user_profile_by_username;
use tokens::tokens::beta_keys::BetaKeyToken;
use tokens::tokens::media_files::MediaFileToken;
use users_component::common_responses::user_details_lite::UserDetailsLight;

use crate::http_server::common_responses::media_file_cover_image_details::{MediaFileCoverImageDetails, MediaFileDefaultCover};
use crate::http_server::common_responses::media_file_origin_details::MediaFileOriginDetails;
use crate::http_server::common_responses::pagination_cursors::PaginationCursors;
use crate::http_server::common_responses::pagination_page::PaginationPage;
use crate::http_server::common_responses::simple_entity_stats::SimpleEntityStats;
use crate::http_server::endpoints::beta_keys::create_beta_keys_handler::CreateBetaKeysError;
use crate::http_server::endpoints::events::list_events::ListEventsError;
use crate::http_server::endpoints::media_files::list::helpers::get_scoped_engine_categories::get_scoped_engine_categories;
use crate::http_server::endpoints::media_files::list::helpers::get_scoped_media_classes::get_scoped_media_classes;
use crate::http_server::endpoints::media_files::list::helpers::get_scoped_media_types::get_scoped_media_types;
use crate::http_server::web_utils::require_moderator::{require_moderator, RequireModeratorError};
use crate::http_server::web_utils::require_user_session::{require_user_session, RequireUserSessionError};
use crate::server_state::ServerState;
use crate::util::allowed_explore_media_access::allowed_explore_media_access;

#[derive(Deserialize, ToSchema, IntoParams)]
pub struct ListBetaKeysQueryParams {
  pub sort_ascending: Option<bool>,
  pub page_size: Option<usize>,
  pub page_index: Option<usize>,

  /// Scope the beta keys to a referrer user.
  pub maybe_referrer_username: Option<String>,

  /// Only return un-redeemed, un-expired keys.
  pub only_list_remaining: Option<bool>,
}

#[derive(Serialize, ToSchema)]
pub struct ListBetaKeysSuccessResponse {
  pub success: bool,
  pub beta_keys: Vec<BetaKeyItem>,
  pub pagination: PaginationPage,
}

#[derive(Serialize, ToSchema)]
pub struct BetaKeyItem {
  pub token: BetaKeyToken,
  pub product: BetaKeyProduct,
  pub key_value: String,
  pub creator: UserDetailsLight,
  pub maybe_referrer: Option<UserDetailsLight>,
  pub maybe_redeemer: Option<UserDetailsLight>,
  pub is_distributed: bool,
  pub maybe_note: Option<String>,
  pub created_at: DateTime<Utc>,
  pub maybe_redeemed_at: Option<DateTime<Utc>>,
}

#[derive(Debug, ToSchema)]
pub enum ListBetaKeysError {
  BadRequest(String),
  NotAuthorized,
  ServerError,
}

impl std::fmt::Display for ListBetaKeysError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{:?}", self)
  }
}

impl ResponseError for ListBetaKeysError {
  fn status_code(&self) -> StatusCode {
    match *self {
      ListBetaKeysError::BadRequest(_)=> StatusCode::BAD_REQUEST,
      ListBetaKeysError::NotAuthorized => StatusCode::UNAUTHORIZED,
      ListBetaKeysError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }
}

/// List beta keys.
#[utoipa::path(
  get,
  tag = "Beta Keys",
  path = "/v1/beta_keys/list",
  params(
    ListBetaKeysQueryParams,
  ),
  responses(
    (status = 200, description = "List Featured Media Files", body = ListBetaKeysSuccessResponse),
    (status = 401, description = "Not authorized", body = ListBetaKeysError),
    (status = 500, description = "Server error", body = ListBetaKeysError),
  ),
)]
pub async fn list_beta_keys_handler(
  http_request: HttpRequest,
  query: Query<ListBetaKeysQueryParams>,
  server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, ListBetaKeysError> {
  let user_session = require_user_session(&http_request, &server_state)
      .await
      .map_err(|err| match err {
        RequireUserSessionError::ServerError => ListBetaKeysError::ServerError,
        RequireUserSessionError::NotAuthorized => ListBetaKeysError::NotAuthorized,
      })?;

  let mut is_mod = user_session.can_ban_users;

  let mut maybe_scope_user_token = None;

  if !is_mod {
    // Non-mods are always scoped to themselves.
    maybe_scope_user_token = Some(user_session.user_token.clone());
  } else if let Some(referrer_username) = query.maybe_referrer_username.as_deref() {
    // Mods can optionally scope to a different user by username.
    let referrer_username = referrer_username.to_lowercase();
    let maybe_referrer_user = get_user_profile_by_username(&referrer_username, &server_state.mysql_pool)
        .await
        .map_err(|e| {
          warn!("get user profile error: {:?}", e);
          ListBetaKeysError::ServerError
        })?;

    match maybe_referrer_user {
      None => return Err(ListBetaKeysError::BadRequest("referrer user not found".to_string())),
      Some(user) => {
        maybe_scope_user_token = Some(user.user_token.clone());
      },
    }
  }

  // TODO(bt,2023-12-04): Enforce real maximums and defaults
  let sort_ascending = query.sort_ascending.unwrap_or(false);
  let page_size = query.page_size.unwrap_or_else(|| 500);
  let page_index = query.page_index.unwrap_or_else(|| 0);

  let query_results = list_beta_keys(ListBetaKeysArgs {
    filter_to_referrer_user_token: maybe_scope_user_token.as_ref(),
    filter_to_remaining_keys: query.only_list_remaining.unwrap_or(false),
    page_size,
    page_index,
    sort_ascending,
    mysql_pool: &server_state.mysql_pool,
  }).await;

  let results_page = match query_results {
    Ok(results) => results,
    Err(err) => {
      warn!("Query error: {:?}", err);
      return Err(ListBetaKeysError::ServerError);
    }
  };

  let results = results_page.records.into_iter()
      .map(|beta_key| {
        BetaKeyItem {
          token: beta_key.token.clone(),
          product: beta_key.product,
          key_value: beta_key.key_value,
          creator: UserDetailsLight::from_db_fields(
            &beta_key.creator_user_token,
            &beta_key.creator_username,
            &beta_key.creator_display_name,
            &beta_key.creator_gravatar_hash),
          maybe_referrer: UserDetailsLight::from_optional_db_fields_owned(
            beta_key.maybe_referrer_user_token,
            beta_key.maybe_referrer_username,
            beta_key.maybe_referrer_display_name,
            beta_key.maybe_referrer_gravatar_hash
          ),
          maybe_redeemer: UserDetailsLight::from_optional_db_fields_owned(
            beta_key.maybe_redeemer_user_token,
            beta_key.maybe_redeemer_username,
            beta_key.maybe_redeemer_display_name,
            beta_key.maybe_redeemer_gravatar_hash
          ),
          is_distributed: beta_key.is_distributed,
          maybe_note: beta_key.maybe_notes,
          created_at: beta_key.created_at,
          maybe_redeemed_at: beta_key.maybe_redeemed_at,
        }
      }).collect::<Vec<_>>();

  let response = ListBetaKeysSuccessResponse {
    success: true,
    beta_keys: results,
    pagination: PaginationPage{
      current: results_page.current_page,
      total_page_count: results_page.total_page_count,
    }
  };

  let body = serde_json::to_string(&response)
      .map_err(|e| ListBetaKeysError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
