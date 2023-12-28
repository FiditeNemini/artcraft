// NB: Incrementally getting rid of build warnings...
#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

use std::fmt;
use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::{Path, Query};
use chrono::{DateTime, Utc};
use log::warn;
use utoipa::{IntoParams, ToSchema};
use enums::by_table::media_files::media_file_type::MediaFileType;
use enums::by_table::model_weights::weights_category::WeightsCategory;
use enums::by_table::model_weights::weights_types::WeightsType;

use enums::by_table::user_bookmarks::user_bookmark_entity_type::UserBookmarkEntityType;
use mysql_queries::queries::user_bookmarks::list_user_bookmarks::{list_user_bookmarks_by_maybe_entity_type, ListUserBookmarksForUserArgs};
use tokens::tokens::user_bookmarks::UserBookmarkToken;
use crate::http_server::common_responses::pagination_page::PaginationPage;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::server_state::ServerState;

#[derive(Deserialize, ToSchema)]
pub struct ListUserBookmarksPathInfo {
  username: String,
}

#[derive(Deserialize, ToSchema, IntoParams)]
pub struct ListUserBookmarksQueryData {
  sort_ascending: Option<bool>,
  page_size: Option<usize>,
  page_index: Option<usize>,

  // TODO(bt,2023-12-28): Should these scope clauses be in an enum / one_of so that callers can only apply one type of
  //  scope at a time? They're kind of meaningless when used in conjunction.

  /// Scope to a particular type of entity (there are lots). Note that some types are deprecated
  /// and will no longer be valid soon: TtsModel, TtsResult, W2lTemplate, W2lResult,
  /// VoiceConversionModel. See `maybe_scoped_weight_type`, `maybe_scoped_weight_category`,
  /// and `maybe_scoped_media_file_type` instead.
  maybe_scoped_entity_type: Option<UserBookmarkEntityType>,

  /// If set, we implicitly scope bookmarks to model weights (UserBookmarkEntityType::ModelWeight)
  maybe_scoped_weight_type: Option<WeightsType>,

  /// If set, we implicitly scope bookmarks to model weights (UserBookmarkEntityType::ModelWeight)
  maybe_scoped_weight_category: Option<WeightsCategory>,

  /// If set, we implicitly scope bookmarks to media files (UserBookmarkEntityType::MediaFile)
  maybe_scoped_media_file_type: Option<MediaFileType>,
}

#[derive(Serialize, ToSchema)]
pub struct ListUserBookmarksForUserSuccessResponse {
  pub success: bool,
  pub results: Vec<UserBookmarkListItem>,
  pub pagination: PaginationPage,
}

#[derive(Serialize, ToSchema)]
pub struct UserBookmarkListItem {
  pub token: UserBookmarkToken,

  pub details: UserBookmarkDetailsForUserList,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

#[derive(Serialize, ToSchema)]
pub struct UserBookmarkDetailsForUserList {
  // TODO: This needs titles or some other summary metadata.
  pub entity_type: UserBookmarkEntityType,
  pub entity_token: String,

  // TODO: Populate this for TTS
  pub maybe_summary_text: Option<String>,

  // TODO: Populate this for images, video, etc.
  pub maybe_thumbnail_url: Option<String>,

  /// This is only populated if the item is a model weight.
  pub maybe_weights_data: Option<WeightsData>,
}

#[derive(Serialize, ToSchema)]
pub struct WeightsData {
  pub title: String,
  pub weights_type: WeightsType,
  pub weights_category: WeightsCategory,
}

#[derive(Debug, ToSchema)]
pub enum ListUserBookmarksForUserError {
  ServerError,
}

impl ResponseError for ListUserBookmarksForUserError {
  fn status_code(&self) -> StatusCode {
    match *self {
      ListUserBookmarksForUserError::ServerError=> StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      ListUserBookmarksForUserError::ServerError => "server error".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for ListUserBookmarksForUserError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

#[utoipa::path(
  get,
  path = "/v1/user_bookmarks/list/user/{username}",
  params(
  ("username", description = "The username of the user whose bookmarks to list."),
    ListUserBookmarksQueryData
  ),
responses(
  (status = 200, description = "List User Bookmarks", body = ListUserBookmarksForUserSuccessResponse),
  (status = 500, description = "Server error", body = ListUserBookmarksForUserError),
),
)]
pub async fn list_user_bookmarks_for_user_handler(
  _http_request: HttpRequest,
  path: Path<ListUserBookmarksPathInfo>,
  query: Query<ListUserBookmarksQueryData>,
  server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, ListUserBookmarksForUserError>
{
  let sort_ascending = query.sort_ascending.unwrap_or(false);
  let page_size = query.page_size.unwrap_or_else(|| 25);
  let page_index = query.page_index.unwrap_or_else(|| 0);

  let query_results =
      list_user_bookmarks_by_maybe_entity_type(ListUserBookmarksForUserArgs{
        username: path.username.as_ref(),
        maybe_filter_entity_type: query.maybe_scoped_entity_type,
        maybe_filter_weight_type: query.maybe_scoped_weight_type,
        maybe_filter_weight_category: query.maybe_scoped_weight_category,
        maybe_filter_media_file_type: query.maybe_scoped_media_file_type,
        sort_ascending,
        page_size,
        page_index,
        mysql_pool: &server_state.mysql_pool,
      }).await;

  let results_page = match query_results {
    Ok(results) => results,
    Err(e) => {
      warn!("Query error: {:?}", e);
      return Err(ListUserBookmarksForUserError::ServerError);
    }
  };

  let response = ListUserBookmarksForUserSuccessResponse {
    success: true,
    results: results_page.results.into_iter()
        .map(|user_bookmark| UserBookmarkListItem {
          token: user_bookmark.token,
          details: UserBookmarkDetailsForUserList {
            entity_type: user_bookmark.entity_type,
            entity_token: user_bookmark.entity_token,
            maybe_weights_data: match user_bookmark.entity_type {
              UserBookmarkEntityType::ModelWeight => Some(WeightsData {
                // TODO(bt,2023-12-28): Proper default, optional, or "unknown" values would be better.
                title: user_bookmark.maybe_entity_descriptive_text.clone().unwrap_or("weight".to_string()),
                weights_type: user_bookmark.maybe_model_weight_type.unwrap_or(WeightsType::Tacotron2),
                weights_category: user_bookmark.maybe_model_weight_category.unwrap_or(WeightsCategory::TextToSpeech),
              }),
              _ => None,
            },
            maybe_summary_text: user_bookmark.maybe_entity_descriptive_text,
            // TODO(bt,2023-11-21): Thumbnails need proper support. We should build them as a
            //  first-class system before handling the backfill here.
            maybe_thumbnail_url: None,
          },
          created_at: user_bookmark.created_at,
          updated_at: user_bookmark.updated_at,
        })
        .collect(),
    pagination: PaginationPage{
      current: results_page.current_page,
      total_page_count: results_page.total_page_count,
    }
  };

  let body = serde_json::to_string(&response)
      .map_err(|_e| ListUserBookmarksForUserError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}