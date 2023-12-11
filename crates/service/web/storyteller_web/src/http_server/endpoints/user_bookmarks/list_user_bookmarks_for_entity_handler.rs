// NB: Incrementally getting rid of build warnings...
#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

use std::fmt;
use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Path;
use chrono::{DateTime, Utc};
use log::warn;

use enums::by_table::user_bookmarks::user_bookmark_entity_type::UserBookmarkEntityType;
use mysql_queries::queries::user_bookmarks::user_bookmark_entity_token::UserBookmarkEntityToken;
use mysql_queries::queries::user_bookmarks::list_user_bookmarks_for_entity::list_user_bookmarks_for_entity;
use tokens::tokens::user_bookmarks::UserBookmarkToken;

use crate::http_server::common_responses::user_details_lite::{DefaultAvatarInfo, UserDetailsLight};
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::server_state::ServerState;

/// For the URL PathInfo
#[derive(Deserialize)]
pub struct ListUserBookmarkPathInfo {
  entity_type: UserBookmarkEntityType,
  entity_token: String,
}

#[derive(Serialize)]
pub struct ListUserBookmarksSuccessResponse {
  pub success: bool,
  pub user_bookmarks: Vec<UserBookmark>,
}

#[derive(Serialize)]
pub struct UserBookmark {
  pub token: UserBookmarkToken,

  pub user: UserDetailsLight,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

#[derive(Debug)]
pub enum ListUserBookmarksError {
  ServerError,
}

impl ResponseError for ListUserBookmarksError {
  fn status_code(&self) -> StatusCode {
    match *self {
      ListUserBookmarksError::ServerError=> StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      ListUserBookmarksError::ServerError => "server error".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for ListUserBookmarksError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

pub async fn list_user_bookmarks_for_entity_handler(
  _http_request: HttpRequest,
  path: Path<ListUserBookmarkPathInfo>,
  server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, ListUserBookmarksError>
{
  let entity_token = UserBookmarkEntityToken::from_entity_type_and_token(
    path.entity_type, &path.entity_token);
  
  let query_results = list_user_bookmarks_for_entity(
    entity_token,
    &server_state.mysql_pool,
  ).await;

  let user_bookmarks = match query_results {
    Ok(results) => results,
    Err(e) => {
      warn!("Query error: {:?}", e);
      return Err(ListUserBookmarksError::ServerError);
    }
  };

  let response = ListUserBookmarksSuccessResponse {
    success: true,
    user_bookmarks: user_bookmarks.into_iter()
        .map(|user_bookmark| UserBookmark {
          token: user_bookmark.token,
          user: UserDetailsLight {
            user_token: user_bookmark.user_token.clone(),
            username: user_bookmark.username.to_string(), // NB: Cloned because of ref use for avatar below
            display_name: user_bookmark.user_display_name.clone(),
            gravatar_hash: user_bookmark.user_gravatar_hash.clone(),
            default_avatar: DefaultAvatarInfo::from_username(&user_bookmark.username),
          },
          created_at: user_bookmark.created_at,
          updated_at: user_bookmark.updated_at,
        })
        .collect(),
  };

  let body = serde_json::to_string(&response)
      .map_err(|_e| ListUserBookmarksError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
