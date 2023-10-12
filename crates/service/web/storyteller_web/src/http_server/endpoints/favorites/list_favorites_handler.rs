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

use enums::by_table::favorites::favorite_entity_type::FavoriteEntityType;
use mysql_queries::queries::favorites::favorite_entity_token::FavoriteEntityToken;
use mysql_queries::queries::favorites::list_favorites_for_entity::list_favorites_for_entity;
use tokens::tokens::favorites::FavoriteToken;
use tokens::tokens::users::UserToken;

use crate::http_server::common_responses::user_details_lite::{DefaultAvatarInfo, UserDetailsLight};
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::server_state::ServerState;
use crate::user_avatars::default_avatar_color_from_username::default_avatar_color_from_username;
use crate::user_avatars::default_avatar_from_username::default_avatar_from_username;

/// For the URL PathInfo
#[derive(Deserialize)]
pub struct ListFavoritesPathInfo {
  entity_type: FavoriteEntityType,
  entity_token: String,
}

#[derive(Serialize)]
pub struct ListFavoritesSuccessResponse {
  pub success: bool,
  pub favorites: Vec<Favorite>,
}

#[derive(Serialize)]
pub struct Favorite {
  pub token: FavoriteToken,

  pub user: UserDetailsLight,

  //pub mod_fields: FavoriteForListModFields,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,

  #[deprecated(note="switch to UserDetailsLight")]
  pub user_token: UserToken,

  #[deprecated(note="switch to UserDetailsLight")]
  pub username: String,

  #[deprecated(note="switch to UserDetailsLight")]
  pub user_display_name: String,

  #[deprecated(note="switch to UserDetailsLight")]
  pub user_gravatar_hash: String,

  #[deprecated(note="switch to UserDetailsLight")]
  pub default_avatar_index: u8,

  #[deprecated(note="switch to UserDetailsLight")]
  pub default_avatar_color_index: u8,
}

// TODO
//pub struct FavoriteForListModFields {
//  pub creator_ip_address: String,
//  pub editor_ip_address: String,
//  pub maybe_user_deleted_at: Option<DateTime<Utc>>,
//  pub maybe_mod_deleted_at: Option<DateTime<Utc>>,
//  pub maybe_object_owner_deleted_at: Option<DateTime<Utc>>,
//}

#[derive(Debug)]
pub enum ListFavoritesError {
  ServerError,
}

impl ResponseError for ListFavoritesError {
  fn status_code(&self) -> StatusCode {
    match *self {
      ListFavoritesError::ServerError=> StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      ListFavoritesError::ServerError => "server error".to_string(),
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

pub async fn list_favorites_handler(
  _http_request: HttpRequest,
  path: Path<ListFavoritesPathInfo>,
  server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, ListFavoritesError>
{
  let entity_token = FavoriteEntityToken::from_entity_type_and_token(
    path.entity_type, &path.entity_token);
  
  let query_results = list_favorites_for_entity(
    entity_token,
    &server_state.mysql_pool,
  ).await;

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
          user: UserDetailsLight {
            user_token: favorite.user_token.clone(),
            username: favorite.username.to_string(), // NB: Cloned because of ref use for avatar below
            display_name: favorite.user_display_name.clone(),
            gravatar_hash: favorite.user_gravatar_hash.clone(),
            default_avatar: DefaultAvatarInfo::from_username(&favorite.username),
          },
          user_token: favorite.user_token,
          username: favorite.username.to_string(), // NB: Cloned because of ref use for avatar below
          user_display_name: favorite.user_display_name,
          user_gravatar_hash: favorite.user_gravatar_hash,
          default_avatar_index: default_avatar_from_username(&favorite.username),
          default_avatar_color_index: default_avatar_color_from_username(&favorite.username),
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
