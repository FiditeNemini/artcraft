use actix_http::http::header;
use actix_web::HttpResponseBuilder;
use actix_web::cookie::Cookie;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Path;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest, HttpMessage};
use anyhow::Error;
use chrono::{DateTime, Utc};
use crate::AnyhowResult;
use crate::database::queries::query_tts_model::TtsModelRecordForResponse;
use crate::database::queries::query_tts_model::select_tts_model_by_token;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::server_state::ServerState;
use log::{info, warn, log};
use regex::Regex;
use sqlx::MySqlPool;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::fmt;
use std::sync::Arc;

// =============== Request ===============

/// For the URL PathInfo
#[derive(Deserialize)]
pub struct GetTtsModelPathInfo {
  token: String,
}

// =============== Success Response ===============

#[derive(Serialize)]
pub struct GetTtsModelSuccessResponse {
  pub success: bool,
  pub model: TtsModelRecordForResponse,
}

// =============== Error Response ===============

#[derive(Debug)]
pub enum GetTtsModelError {
  ServerError,
  NotFound,
}

impl ResponseError for GetTtsModelError {
  fn status_code(&self) -> StatusCode {
    match *self {
      GetTtsModelError::ServerError=> StatusCode::INTERNAL_SERVER_ERROR,
      GetTtsModelError::NotFound => StatusCode::NOT_FOUND,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      GetTtsModelError::ServerError => "server error".to_string(),
      GetTtsModelError::NotFound => "not found".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for GetTtsModelError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

// =============== Handler ===============

pub async fn get_tts_model_handler(
  http_request: HttpRequest,
  path: Path<GetTtsModelPathInfo>,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, GetTtsModelError>
{
  let maybe_user_session = server_state
      .session_checker
      .maybe_get_user_session(&http_request, &server_state.mysql_pool)
      .await
      .map_err(|e| {
        warn!("Session checker error: {:?}", e);
        GetTtsModelError::ServerError
      })?;

  let mut show_deleted_models = false;
  let mut is_moderator = false;

  if let Some(user_session) = maybe_user_session {
    // NB: Moderators can see deleted models
    // Original creators cannot see them (unless they're moderators!)
    show_deleted_models = user_session.can_delete_other_users_tts_models;
    // Moderators get to see all the fields.
    is_moderator = user_session.can_delete_other_users_tts_results
        || user_session.can_edit_other_users_tts_models;
  }

  let model_query_result = select_tts_model_by_token(
    &path.token,
    show_deleted_models,
    &server_state.mysql_pool
  ).await;

  let mut model = match model_query_result {
    Err(e) => {
      warn!("query error: {:?}", e);
      return Err(GetTtsModelError::ServerError);
    }
    Ok(None) => return Err(GetTtsModelError::NotFound),
    Ok(Some(model)) => model,
  };

  if let Some(moderator_fields) = model.maybe_moderator_fields.as_ref() {
    // NB: The moderator fields will always be present before removal
    // We don't want non-mods seeing stuff made by banned users.
    if moderator_fields.creator_is_banned && !is_moderator {
      return Err(GetTtsModelError::NotFound);
    }
  }

  if !is_moderator {
    model.maybe_moderator_fields = None;
  }

  let response = GetTtsModelSuccessResponse {
    success: true,
    model,
  };

  let body = serde_json::to_string(&response)
      .map_err(|e| GetTtsModelError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
