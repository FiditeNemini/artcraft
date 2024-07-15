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
use enums::by_table::model_weights::weights_category::WeightsCategory;
use enums::common::view_as::ViewAs;
use enums_public::by_table::model_weights::public_weights_types::PublicWeightsType;
use mysql_queries::queries::media_files::list::list_media_files::{list_media_files, ListMediaFilesArgs};
use mysql_queries::queries::model_weights::list::list_featured_weights::{list_featured_weights, ListFeaturedWeightsArgs};
use mysql_queries::queries::model_weights::list::list_weights_by_tokens::list_weights_by_tokens;
use tokens::tokens::model_weights::ModelWeightToken;

use crate::http_server::common_responses::simple_entity_stats::SimpleEntityStats;
use crate::http_server::common_responses::user_details_lite::UserDetailsLight;
use crate::http_server::common_responses::weights_cover_image_details::WeightsCoverImageDetails;
use crate::http_server::endpoints::media_files::list::list_featured_media_files_handler::ListFeaturedMediaFilesError;
use crate::http_server::endpoints::media_files::list::list_media_files_handler::{ListMediaFilesError, ListMediaFilesQueryParams};
use crate::state::server_state::ServerState;

#[derive(Deserialize, ToSchema, IntoParams)]
pub struct ListFeaturedWeightsQueryParams {
  pub sort_ascending: Option<bool>,
  pub page_size: Option<usize>,
  pub cursor: Option<String>,
  pub cursor_is_reversed: Option<bool>,

  // TODO(bt,2024-05-05): This isn't used or relevant. Switch to correct filters.
  /// NB: This can be one (or more comma-separated values) from `MediaFileClass`,
  /// which are the broad category of media files: image, video, etc.
  ///
  /// Usage:
  ///   - `?filter_media_classes=audio`
  ///   - `?filter_media_classes=image,video`
  ///   - etc.
  pub filter_media_classes: Option<String>,

  // TODO(bt,2024-05-05): This isn't used or relevant. Switch to correct filters.
  /// NB: This can be one (or more comma-separated values) from `MediaFileType`,
  /// which are mimetype-like / format-like categories of media files: glb, gltf,
  /// scene_json, etc.
  ///
  /// Usage:
  ///   - `?filter_media_type=scene_json`
  ///   - `?filter_media_type=glb,gltf`
  ///   - etc.
  pub filter_media_type: Option<String>,

  // TODO(bt,2024-05-05): This isn't used or relevant. Switch to correct filters.
  /// NB: This can be one (or more comma-separated values) from `MediaFileEngineCategory`.
  ///
  /// Usage:
  ///   - `?filter_engine_categories=scene`
  ///   - `?filter_engine_categories=animation,character,object`
  ///   - etc.
  pub filter_engine_categories: Option<String>,
}

#[derive(Serialize, ToSchema)]
pub struct ListFeaturedWeightsSuccessResponse {
  pub success: bool,
  pub results: Vec<FeaturedModelWeightForList>,
}

#[derive(Serialize, ToSchema)]
pub struct FeaturedModelWeightForList {
  pub weight_token: ModelWeightToken,

  pub weight_type: PublicWeightsType,
  pub weight_category: WeightsCategory,

  pub title: String,

  pub creator: Option<UserDetailsLight>,

  /// Information about the cover image.
  pub cover_image: WeightsCoverImageDetails,

  /// Cover images are small descriptive images that can be set for any model.
  /// If a cover image is set, this is the path to the asset.
  #[deprecated(note="switch to CoverImageDetails")]
  pub maybe_cover_image_public_bucket_path: Option<String>,

  /// Statistics about the weights
  pub stats: SimpleEntityStats,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

/// The key we store featured weights tokens under
const REDIS_KEY : &str = "featured_weights_list";

#[derive(Debug, ToSchema)]
pub enum ListFeaturedWeightsError {
  NotAuthorized,
  ServerError,
}

impl std::fmt::Display for ListFeaturedWeightsError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{:?}", self)
  }
}

impl ResponseError for ListFeaturedWeightsError {
  fn status_code(&self) -> StatusCode {
    match *self {
      ListFeaturedWeightsError::NotAuthorized => StatusCode::UNAUTHORIZED,
      ListFeaturedWeightsError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }
}

/// List model weights that the staff has selected as "the best" models on the site.
#[utoipa::path(
  get,
  tag = "Model Weights",
  path = "/v1/weights/list_featured",
  params(ListFeaturedWeightsQueryParams),
  responses(
    (status = 200, description = "List Weights", body = ListFeaturedWeightsSuccessResponse),
    (status = 401, description = "Not authorized", body = ListFeaturedWeightsError),
    (status = 500, description = "Server error", body = ListFeaturedWeightsError),
  ),
)]
pub async fn list_featured_weights_handler(
  http_request: HttpRequest,
  query: Query<ListFeaturedWeightsQueryParams>,
  server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, impl ResponseError> {

  let maybe_user_session = server_state
      .session_checker
      .maybe_get_user_session(&http_request, &server_state.mysql_pool)
      .await
      .map_err(|e| {
        warn!("Session checker error: {:?}", e);
        ListFeaturedWeightsError::ServerError
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
          ListFeaturedWeightsError::ServerError
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

  let query_results = list_featured_weights(ListFeaturedWeightsArgs {
    limit,
    maybe_offset: cursor,
    sort_ascending,
    cursor_is_reversed,
    view_as,
    //maybe_filter_media_types: maybe_filter_media_types.as_ref(),
    //maybe_filter_media_classes: maybe_filter_media_classes.as_ref(),
    //maybe_filter_engine_categories: maybe_filter_engine_categories.as_ref(),
    maybe_scoped_weight_type: None,
    maybe_scoped_weight_category: None,
    mysql_pool: &server_state.mysql_pool,
  }).await;

  let results_page = match query_results {
    Ok(results) => results,
    Err(e) => {
      warn!("Query error: {:?}", e);
      return Err(ListFeaturedWeightsError::ServerError);
    }
  };

  let cursor_next = if let Some(id) = results_page.last_id {
    let cursor = server_state.sort_key_crypto.encrypt_id(id as u64)
        .map_err(|e| {
          warn!("crypto error: {:?}", e);
          ListFeaturedWeightsError::ServerError
        })?;
    Some(cursor)
  } else {
    None
  };

  let cursor_previous = if let Some(id) = results_page.first_id {
    let cursor = server_state.sort_key_crypto.encrypt_id(id as u64)
        .map_err(|e| {
          warn!("crypto error: {:?}", e);
          ListFeaturedWeightsError::ServerError
        })?;
    Some(cursor)
  } else {
    None
  };

  let response = ListFeaturedWeightsSuccessResponse {
    success: true,
    results: results_page.records.into_iter()
        .map(|w| {
          let cover_image_details = WeightsCoverImageDetails::from_optional_db_fields(
            &w.token,
            w.maybe_cover_image_public_bucket_hash.as_deref(),
            w.maybe_cover_image_public_bucket_prefix.as_deref(),
            w.maybe_cover_image_public_bucket_extension.as_deref(),
          );

          let maybe_cover_image = w.maybe_cover_image_public_bucket_hash
              .as_deref()
              .map(|hash| {
                MediaFileBucketPath::from_object_hash(
                  hash,
                  w.maybe_cover_image_public_bucket_prefix.as_deref(),
                  w.maybe_cover_image_public_bucket_extension.as_deref())
                    .get_full_object_path_str()
                    .to_string()
              });

          FeaturedModelWeightForList {
            weight_token: w.token,
            title: w.title,
            weight_type: PublicWeightsType::from_enum(w.weights_type),
            weight_category: w.weights_category,
            cover_image: cover_image_details,
            maybe_cover_image_public_bucket_path: maybe_cover_image,
            creator: UserDetailsLight::from_optional_db_fields(
              w.maybe_creator_user_token.as_ref(),
              w.maybe_creator_username.as_deref(),
              w.maybe_creator_display_name.as_deref(),
              w.maybe_creator_email_gravatar_hash.as_deref(),
            ),
            stats: SimpleEntityStats {
              positive_rating_count: w.maybe_ratings_positive_count.unwrap_or(0),
              bookmark_count: w.maybe_bookmark_count.unwrap_or(0),
            },
            created_at: w.created_at,
            updated_at: w.updated_at,
          }
        }).collect::<Vec<_>>(),
  };

  let body = serde_json::to_string(&response)
      .map_err(|e| ListFeaturedWeightsError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
