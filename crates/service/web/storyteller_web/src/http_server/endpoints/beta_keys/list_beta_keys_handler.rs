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
use enums::by_table::media_files::media_file_animation_type::MediaFileAnimationType;
use enums::by_table::media_files::media_file_class::MediaFileClass;
use enums::by_table::media_files::media_file_engine_category::MediaFileEngineCategory;
use enums::by_table::media_files::media_file_origin_category::MediaFileOriginCategory;
use enums::by_table::media_files::media_file_origin_model_type::MediaFileOriginModelType;
use enums::by_table::media_files::media_file_origin_product_category::MediaFileOriginProductCategory;
use enums::by_table::media_files::media_file_type::MediaFileType;
use enums::common::view_as::ViewAs;
use enums::no_table::style_transfer::style_transfer_name::StyleTransferName;
use tokens::tokens::media_files::MediaFileToken;
use users_component::common_responses::user_details_lite::UserDetailsLight;

use crate::http_server::common_responses::media_file_cover_image_details::{MediaFileCoverImageDetails, MediaFileDefaultCover};
use crate::http_server::common_responses::media_file_origin_details::MediaFileOriginDetails;
use crate::http_server::common_responses::pagination_cursors::PaginationCursors;
use crate::http_server::common_responses::simple_entity_stats::SimpleEntityStats;
use crate::http_server::endpoints::media_files::list::helpers::get_scoped_engine_categories::get_scoped_engine_categories;
use crate::http_server::endpoints::media_files::list::helpers::get_scoped_media_classes::get_scoped_media_classes;
use crate::http_server::endpoints::media_files::list::helpers::get_scoped_media_types::get_scoped_media_types;
use crate::server_state::ServerState;
use crate::util::allowed_explore_media_access::allowed_explore_media_access;

#[derive(Deserialize, ToSchema, IntoParams)]
pub struct ListBetaKeysQueryParams {
  pub sort_ascending: Option<bool>,
  pub page_size: Option<usize>,
  pub cursor: Option<String>,
  pub cursor_is_reversed: Option<bool>,
}

#[derive(Serialize, ToSchema)]
pub struct ListBetaKeysSuccessResponse {
  pub success: bool,
  pub beta_keys: Vec<String>,
  pub pagination: PaginationCursors,
}

#[derive(Debug, ToSchema)]
pub enum ListBetaKeysError {
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

  let maybe_user_session = server_state
      .session_checker
      .maybe_get_user_session(&http_request, &server_state.mysql_pool)
      .await
      .map_err(|e| {
        warn!("Session checker error: {:?}", e);
        ListBetaKeysError::ServerError
      })?;

  let mut is_mod = false;

  match maybe_user_session {
    None => {},
    Some(session) => {
      is_mod = session.can_ban_users;
    },
  };

  // TODO(bt,2023-12-04): Enforce real maximums and defaults
  let limit = query.page_size.unwrap_or(25);

  let sort_ascending = query.sort_ascending.unwrap_or(false);
  let cursor_is_reversed = query.cursor_is_reversed.unwrap_or(false);

  let cursor = if let Some(cursor) = query.cursor.as_deref() {
    let cursor = server_state.sort_key_crypto.decrypt_id(cursor)
        .map_err(|e| {
          warn!("crypto error: {:?}", e);
          ListBetaKeysError::ServerError
        })?;
    Some(cursor as usize)
  } else {
    None
  };

  let view_as = if is_mod {
    ViewAs::Moderator
  } else {
    ViewAs::AnotherUser
  };

  //let mut maybe_filter_media_types = get_scoped_media_types(query.filter_media_type.as_deref());
  //let mut maybe_filter_media_classes  = get_scoped_media_classes(query.filter_media_classes.as_deref());
  //let mut maybe_filter_engine_categories = get_scoped_engine_categories(query.filter_engine_categories.as_deref());

  //let query_results =
  //    list_featured_media_files(ListBetaKeysArgs {
  //      limit,
  //      maybe_offset: cursor,
  //      cursor_is_reversed,
  //      sort_ascending,
  //      view_as,
  //      maybe_filter_media_types: maybe_filter_media_types.as_ref(),
  //      maybe_filter_media_classes: maybe_filter_media_classes.as_ref(),
  //      maybe_filter_engine_categories: maybe_filter_engine_categories.as_ref(),
  //      mysql_pool: &server_state.mysql_pool,
  //    }).await;

  //let results_page = match query_results {
  //  Ok(results) => results,
  //  Err(e) => {
  //    warn!("Query error: {:?}", e);
  //    return Err(ListBetaKeysError::ServerError);
  //  }
  //};

  //let cursor_next = if let Some(id) = results_page.last_id {
  //  let cursor = server_state.sort_key_crypto.encrypt_id(id as u64)
  //      .map_err(|e| {
  //        warn!("crypto error: {:?}", e);
  //        ListBetaKeysError::ServerError
  //      })?;
  //  Some(cursor)
  //} else {
  //  None
  //};

  //let cursor_previous = if let Some(id) = results_page.first_id {
  //  let cursor = server_state.sort_key_crypto.encrypt_id(id as u64)
  //      .map_err(|e| {
  //        warn!("crypto error: {:?}", e);
  //        ListBetaKeysError::ServerError
  //      })?;
  //  Some(cursor)
  //} else {
  //  None
  //};

  //let results = results_page.records.into_iter()
  //    .map(|m| {
  //      let public_bucket_path = MediaFileBucketPath::from_object_hash(
  //        &m.public_bucket_directory_hash,
  //        m.maybe_public_bucket_prefix.as_deref(),
  //        m.maybe_public_bucket_extension.as_deref())
  //          .get_full_object_path_str()
  //          .to_string();

  //      FeaturedMediaFile {
  //        token: m.token.clone(),
  //        media_class: m.media_class,
  //        media_type: m.media_type,
  //        maybe_engine_category: m.maybe_engine_category,
  //        maybe_animation_type: m.maybe_animation_type,
  //        public_bucket_path,
  //        cover_image: MediaFileCoverImageDetails::from_optional_db_fields(
  //          &m.token,
  //          m.maybe_file_cover_image_public_bucket_hash.as_deref(),
  //          m.maybe_file_cover_image_public_bucket_prefix.as_deref(),
  //          m.maybe_file_cover_image_public_bucket_extension.as_deref(),
  //        ),
  //        origin: MediaFileOriginDetails::from_db_fields_str(
  //          m.origin_category,
  //          m.origin_product_category,
  //          m.maybe_origin_model_type,
  //          m.maybe_origin_model_token.as_deref(),
  //          m.maybe_origin_model_title.as_deref()),
  //        origin_category: m.origin_category,
  //        origin_product_category: m.origin_product_category,
  //        maybe_origin_model_type: m.maybe_origin_model_type,
  //        maybe_origin_model_token: m.maybe_origin_model_token,
  //        maybe_creator: UserDetailsLight::from_optional_db_fields_owned(
  //          m.maybe_creator_user_token,
  //          m.maybe_creator_username,
  //          m.maybe_creator_display_name,
  //          m.maybe_creator_gravatar_hash
  //        ),
  //        maybe_title: m.maybe_title,
  //        maybe_text_transcript: m.maybe_text_transcript,
  //        maybe_style_name: m.maybe_prompt_args
  //            .as_ref()
  //            .and_then(|args| args.style_name.as_ref())
  //            .and_then(|style| style.to_style_name()),
  //        maybe_duration_millis: m.maybe_duration_millis,
  //        stats: SimpleEntityStats {
  //          positive_rating_count: m.maybe_ratings_positive_count.unwrap_or(0),
  //          bookmark_count: m.maybe_bookmark_count.unwrap_or(0),
  //        },
  //        created_at: m.created_at,
  //        updated_at: m.updated_at,
  //      }
  //    }).collect::<Vec<_>>();

  let response = ListBetaKeysSuccessResponse {
    success: true,
    beta_keys: Vec::new(),
    pagination: PaginationCursors {
      maybe_next: None,
      maybe_previous: None,
      cursor_is_reversed,
    }
  };

  let body = serde_json::to_string(&response)
      .map_err(|e| ListBetaKeysError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
