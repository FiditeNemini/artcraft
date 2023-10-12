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
use log::{error, warn};

use mysql_queries::queries::favorites::delete_favorite::{delete_favorite, DeleteFavoriteAs};
use mysql_queries::queries::favorites::get_favorite::get_favorite;
use tokens::tokens::favorites::FavoriteToken;

use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::http_server::web_utils::response_success_helpers::simple_json_success;
use crate::server_state::ServerState;

/// For the URL PathInfo
#[derive(Deserialize)]
pub struct DeleteFavoritePathInfo {
  favorite_token: FavoriteToken,
}

#[derive(Deserialize)]
pub struct DeleteFavoriteRequest {
  /// NB: this is only to disambiguate when a user is both a mod and an author.
  as_mod: Option<bool>,
}

#[derive(Debug)]
pub enum DeleteFavoriteError {
  BadInput(String),
  NotAuthorized,
  NotFound,
  ServerError,
}

impl ResponseError for DeleteFavoriteError {
  fn status_code(&self) -> StatusCode {
    match *self {
      DeleteFavoriteError::BadInput(_) => StatusCode::BAD_REQUEST,
      DeleteFavoriteError::NotAuthorized => StatusCode::UNAUTHORIZED,
      DeleteFavoriteError::NotFound => StatusCode::NOT_FOUND,
      DeleteFavoriteError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      DeleteFavoriteError::BadInput(reason) => reason.to_string(),
      DeleteFavoriteError::NotAuthorized => "unauthorized".to_string(),
      DeleteFavoriteError::NotFound => "not found".to_string(),
      DeleteFavoriteError::ServerError => "server error".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for DeleteFavoriteError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

pub async fn delete_favorite_handler(
  http_request: HttpRequest,
  path: Path<DeleteFavoritePathInfo>,
  request: web::Json<DeleteFavoriteRequest>,
  server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, DeleteFavoriteError> {
  let mut mysql_connection = server_state.mysql_pool
      .acquire()
      .await
      .map_err(|err| {
        warn!("MySql pool error: {:?}", err);
        DeleteFavoriteError::ServerError
      })?;

  let maybe_user_session = server_state
      .session_checker
      .maybe_get_user_session_from_connection(&http_request, &mut mysql_connection)
      .await
      .map_err(|e| {
        warn!("Session checker error: {:?}", e);
        DeleteFavoriteError::ServerError
      })?;

  let user_session = match maybe_user_session {
    Some(session) => session,
    None => {
      return Err(DeleteFavoriteError::NotAuthorized);
    }
  };

  let mut maybe_delete_as = None;

  if request.as_mod.unwrap_or(false) && user_session.can_ban_users {
    // 1) Delete as moderator
    maybe_delete_as = Some(DeleteFavoriteAs::Moderator);
  } else {
    let favorite = get_favorite(&path.favorite_token, &mut mysql_connection)
        .await
        .map_err(|err| {
          error!("error with query: {:?}", err);
          DeleteFavoriteError::ServerError
        })?
        .ok_or(DeleteFavoriteError::NotFound)?;

    // 2) Delete as author
    if favorite.user_token == user_session.user_token_typed {
      maybe_delete_as = Some(DeleteFavoriteAs::Author);
    }

    // 3) Delete as object owner
    if maybe_delete_as.is_none() {
      // TODO: Search for owner of the entity.
    }

    // 4) Last ditch - try to see if they're a moderator again.
    if maybe_delete_as.is_none() && user_session.can_ban_users {
      maybe_delete_as = Some(DeleteFavoriteAs::Moderator);
    }
  }

  let delete_as = match maybe_delete_as {
    Some(delete_as) => delete_as,
    None => return Err(DeleteFavoriteError::NotAuthorized),
  };

  let query_result = delete_favorite(
    &path.favorite_token,
    delete_as,
    &mut mysql_connection
  ).await;

  match query_result {
    Ok(_) => {},
    Err(err) => {
      warn!("Update tts mod approval status DB error: {:?}", err);
      return Err(DeleteFavoriteError::ServerError);
    }
  };

  Ok(simple_json_success())
}
