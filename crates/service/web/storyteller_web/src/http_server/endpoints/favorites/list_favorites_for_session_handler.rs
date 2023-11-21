// NB: Incrementally getting rid of build warnings...
#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

use std::fmt;
use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Query;
use chrono::{DateTime, Utc};
use log::warn;

use enums::by_table::favorites::favorite_entity_type::FavoriteEntityType;
use mysql_queries::queries::favorites::list_user_favorites::{list_user_favorites, list_user_favorites_by_entity_type};
use tokens::tokens::favorites::FavoriteToken;

use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::server_state::ServerState;

#[derive(Deserialize)]
pub struct ListFavoritesQueryData {
  maybe_scoped_entity_type: Option<FavoriteEntityType>,
}

#[derive(Serialize)]
pub struct ListFavoritesSuccessResponse {
  pub success: bool,
  pub favorites: Vec<Favorite>,
}

#[derive(Serialize)]
pub struct Favorite {
  pub token: FavoriteToken,

  pub details: FavoriteDetails,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct FavoriteDetails {
  // TODO: This needs titles or some other summary metadata.
  pub entity_type: FavoriteEntityType,
  pub entity_token: String,

  // TODO: Populate this for TTS
  pub maybe_summary_text: Option<String>,

  // TODO: Populate this for images, video, etc.
  pub maybe_thumbnail_url: Option<String>,
}

#[derive(Debug)]
pub enum ListFavoritesError {
  ServerError,
  NotAuthorizedError,
}

impl ResponseError for ListFavoritesError {
  fn status_code(&self) -> StatusCode {
    match *self {
      ListFavoritesError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
      ListFavoritesError::NotAuthorizedError => StatusCode::UNAUTHORIZED,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      ListFavoritesError::ServerError => "server error".to_string(),
      ListFavoritesError::NotAuthorizedError => "not authorized".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for ListFavoritesError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

pub async fn list_favorites_for_session_handler(
  http_request: HttpRequest,
  query: Query<ListFavoritesQueryData>,
  server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, ListFavoritesError>
{
  let user_session = server_state.session_checker
      .maybe_get_user_session(&http_request, &server_state.mysql_pool)
      .await
      .map_err(|e| {
        warn!("Session checker error: {:?}", e);
        ListFavoritesError::ServerError
      })?
      .ok_or(ListFavoritesError::NotAuthorizedError)?;

  let query_results = match query.maybe_scoped_entity_type {
    None => list_user_favorites(&user_session.username, &server_state.mysql_pool).await,
    Some(entity_type) =>
      list_user_favorites_by_entity_type(&user_session.username, entity_type, &server_state.mysql_pool)
          .await,
  };

  let favorites = match query_results {
    Ok(results) => results,
    Err(e) => {
      warn!("Query error: {:?}", e);
      return Err(ListFavoritesError::ServerError);
    }
  };

  let response = ListFavoritesSuccessResponse {
    success: true,
    favorites: favorites.into_iter()
        .map(|favorite| Favorite {
          token: favorite.token,
          details: FavoriteDetails {
            entity_type: favorite.entity_type,
            entity_token: favorite.entity_token,
            maybe_summary_text: None,
            maybe_thumbnail_url: None,
          },
          created_at: favorite.created_at,
          updated_at: favorite.updated_at,
        })
        .collect(),
  };

  let body = serde_json::to_string(&response)
      .map_err(|_e| ListFavoritesError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
