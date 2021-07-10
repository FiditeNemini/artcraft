use actix_http::Error;
use actix_http::http::header;
use actix_web::cookie::Cookie;
use actix_web::dev::HttpResponseBuilder;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Path;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest};
use crate::database::queries::delete_tts_model::delete_tts_model_as_mod;
use crate::database::queries::delete_tts_model::delete_tts_model_as_user;
use crate::database::queries::delete_tts_model::undelete_tts_model_as_mod;
use crate::database::queries::delete_tts_model::undelete_tts_model_as_user;
use crate::database::queries::query_tts_model::select_tts_model_by_token;
use crate::database::queries::query_tts_result::select_tts_result_by_token;
use crate::http_server::web_utils::ip_address::get_request_ip;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::http_server::web_utils::response_success_helpers::simple_json_success;
use crate::server_state::ServerState;
use derive_more::{Display, Error};
use log::{info, warn, log};
use regex::Regex;
use sqlx::MySqlPool;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::sync::Arc;

/// For the URL PathInfo
#[derive(Deserialize)]
pub struct DeleteTtsModelPathInfo {
  token: String,
}

#[derive(Deserialize)]
pub struct DeleteTtsModelRequest {
  set_delete: bool,
  /// NB: this is only to disambiguate when a user is both a mod and an author.
  as_mod: Option<bool>,
}

#[derive(Debug, Display)]
pub enum DeleteTtsModelError {
  BadInput(String),
  NotAuthorized,
  NotFound,
  ServerError,
}

impl ResponseError for DeleteTtsModelError {
  fn status_code(&self) -> StatusCode {
    match *self {
      DeleteTtsModelError::BadInput(_) => StatusCode::BAD_REQUEST,
      DeleteTtsModelError::NotAuthorized => StatusCode::UNAUTHORIZED,
      DeleteTtsModelError::NotFound => StatusCode::NOT_FOUND,
      DeleteTtsModelError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      DeleteTtsModelError::BadInput(reason) => reason.to_string(),
      DeleteTtsModelError::NotAuthorized => "unauthorized".to_string(),
      DeleteTtsModelError::NotFound => "not found".to_string(),
      DeleteTtsModelError::ServerError => "server error".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

pub async fn delete_tts_model_handler(
  http_request: HttpRequest,
  path: Path<DeleteTtsModelPathInfo>,
  request: web::Json<DeleteTtsModelRequest>,
  server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, DeleteTtsModelError> {
  let maybe_user_session = server_state
      .session_checker
      .maybe_get_user_session(&http_request, &server_state.mysql_pool)
      .await
      .map_err(|e| {
        warn!("Session checker error: {:?}", e);
        DeleteTtsModelError::ServerError
      })?;

  let user_session = match maybe_user_session {
    Some(session) => session,
    None => {
      warn!("not logged in");
      return Err(DeleteTtsModelError::NotAuthorized);
    }
  };

  // NB: First permission check.
  // Only mods should see deleted models (both user_* and mod_* deleted).
  let is_mod = user_session.can_delete_other_users_tts_models;

  let model_query_result = select_tts_model_by_token(
    &path.token,
    is_mod,
    &server_state.mysql_pool,
  ).await;

  let tts_model = match model_query_result {
    Err(e) => {
      warn!("query error: {:?}", e);
      return Err(DeleteTtsModelError::ServerError);
    }
    Ok(None) => return Err(DeleteTtsModelError::NotFound),
    Ok(Some(model)) => model,
  };

  // NB: Second set of permission checks
  let is_author = &tts_model.creator_user_token == &user_session.user_token;

  if !is_author && !is_mod {
    warn!("user is not allowed to delete model: {}", user_session.user_token);
    return Err(DeleteTtsModelError::NotAuthorized);
  }

  // NB: I can't imagine we need to store this.
  // let ip_address = get_request_ip(&http_request);

  let as_mod = delete_as_mod(is_mod, is_author, request.as_mod);

  let query_result = if request.set_delete {
    if as_mod {
      delete_tts_model_as_mod(
        &path.token,
        &user_session.user_token,
        &server_state.mysql_pool
      ).await
    } else {
      delete_tts_model_as_user(
        &path.token,
        &server_state.mysql_pool
      ).await
    }
  } else {
    if as_mod {
      undelete_tts_model_as_mod(
        &path.token,
        &user_session.user_token,
        &server_state.mysql_pool
      ).await
    } else {
      // NB: Technically only mods can see their own inference_results here
      undelete_tts_model_as_user(
        &path.token,
        &server_state.mysql_pool
      ).await
    }
  };

  match query_result {
    Ok(_) => {},
    Err(err) => {
      warn!("Delete tts model DB error: {:?}", err);
      return Err(DeleteTtsModelError::ServerError);
    }
  };

  Ok(simple_json_success())
}

fn delete_as_mod(user_is_mod: bool, user_is_author: bool, as_mod_flag: Option<bool>) -> bool {
  // NB: Explored this with a truth table.
  let as_mod_flag_value = as_mod_flag.unwrap_or(false);
  user_is_mod && !(user_is_author && as_mod_flag.is_some() && !as_mod_flag_value)
}

#[cfg(test)]
mod tests {
  use crate::http_server::endpoints::tts::delete_tts_model::delete_as_mod;

  #[test]
  fn test_delete_as_mod() {
    // Deleted as a user
    assert!(!delete_as_mod(false, false, None));
    assert!(!delete_as_mod(false, true, None));
    assert!(!delete_as_mod(false, true, Some(false)));
    assert!(!delete_as_mod(false, true, Some(true)));

    // Deleted as a mod
    assert!(delete_as_mod(true, false, None));
    assert!(delete_as_mod(true, false, Some(false)));
    assert!(delete_as_mod(true, false, Some(true)));

    // Moderator + Author, deleting as a user
    assert!(!delete_as_mod(true, true, Some(false)));

    // Moderator + Author, deleting as a mod
    assert!(delete_as_mod(true, true, None));
    assert!(delete_as_mod(true, true, Some(true)));
  }
}
