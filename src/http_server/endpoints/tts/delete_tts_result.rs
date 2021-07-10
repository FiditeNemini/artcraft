use actix_http::Error;
use actix_http::http::header;
use actix_web::cookie::Cookie;
use actix_web::dev::HttpResponseBuilder;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Path;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest};
use crate::database::queries::query_tts_result::select_tts_result_by_token;
use crate::http_server::web_utils::ip_address::get_request_ip;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::http_server::web_utils::response_success_helpers::simple_json_success;
use crate::server_state::ServerState;
use crate::util::random_crockford_token::random_crockford_token;
use crate::validations::model_uploads::validate_model_title;
use crate::validations::passwords::validate_passwords;
use crate::validations::username::validate_username;
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
pub struct DeleteTtsInferenceResultPathInfo {
  token: String,
}

#[derive(Deserialize)]
pub struct DeleteTtsInferenceResultRequest {
  set_delete: bool,
}

#[derive(Debug, Display)]
pub enum DeleteTtsInferenceResultError {
  BadInput(String),
  NotAuthorized,
  NotFound,
  ServerError,
}

impl ResponseError for DeleteTtsInferenceResultError {
  fn status_code(&self) -> StatusCode {
    match *self {
      DeleteTtsInferenceResultError::BadInput(_) => StatusCode::BAD_REQUEST,
      DeleteTtsInferenceResultError::NotAuthorized => StatusCode::UNAUTHORIZED,
      DeleteTtsInferenceResultError::NotFound => StatusCode::NOT_FOUND,
      DeleteTtsInferenceResultError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      DeleteTtsInferenceResultError::BadInput(reason) => reason.to_string(),
      DeleteTtsInferenceResultError::NotAuthorized => "unauthorized".to_string(),
      DeleteTtsInferenceResultError::NotFound => "not found".to_string(),
      DeleteTtsInferenceResultError::ServerError => "server error".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

pub async fn delete_tts_inference_result_handler(
  http_request: HttpRequest,
  path: Path<DeleteTtsInferenceResultPathInfo>,
  request: web::Json<DeleteTtsInferenceResultRequest>,
  server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, DeleteTtsInferenceResultError> {
  let maybe_user_session = server_state
      .session_checker
      .maybe_get_user_session(&http_request, &server_state.mysql_pool)
      .await
      .map_err(|e| {
        warn!("Session checker error: {:?}", e);
        DeleteTtsInferenceResultError::ServerError
      })?;

  let user_session = match maybe_user_session {
    Some(session) => session,
    None => {
      warn!("not logged in");
      return Err(DeleteTtsInferenceResultError::NotAuthorized);
    }
  };

  // NB: First permission check.
  // Only mods should see deleted models (both user_* and mod_* deleted).
  let is_mod_that_can_see_deleted = user_session.can_delete_other_users_tts_results;

  let inference_result_query_result = select_tts_result_by_token(
    &path.token,
    is_mod_that_can_see_deleted,
    &server_state.mysql_pool,
  ).await;

  let tts_inference_result = match inference_result_query_result {
    Err(e) => {
      warn!("query error: {:?}", e);
      return Err(DeleteTtsInferenceResultError::ServerError);
    }
    Ok(None) => return Err(DeleteTtsInferenceResultError::NotFound),
    Ok(Some(inference_result)) => inference_result,
  };

  // NB: Second set of permission checks
  let is_author = tts_inference_result.maybe_creator_user_token
      .as_deref()
      .map(|creator_token| creator_token == &user_session.user_token)
      .unwrap_or(false);

  let is_mod = user_session.can_delete_other_users_tts_results;

  if !is_author && !is_mod {
    warn!("user is not allowed to delete inference results: {}", user_session.user_token);
    return Err(DeleteTtsInferenceResultError::NotAuthorized);
  }

  // NB: I can't imagine we need to store this.
  // let ip_address = get_request_ip(&http_request);

  let query_result = if request.set_delete {
    if is_author {
      user_delete_inference_result(
        &path.token,
        &server_state.mysql_pool
      ).await
    } else {
      mod_delete_inference_result(
        &path.token,
        &user_session.user_token,
        &server_state.mysql_pool
      ).await
    }
  } else {
    if is_author {
      // NB: Technically only mods can see their own inference_results here
      user_undelete_inference_result(
        &path.token,
        &server_state.mysql_pool
      ).await
    } else {
      mod_undelete_inference_result(
        &path.token,
        &user_session.user_token,
        &server_state.mysql_pool
      ).await
    }
  };

  match query_result {
    Ok(_) => {},
    Err(err) => {
      warn!("Update tts mod approval status DB error: {:?}", err);
      return Err(DeleteTtsInferenceResultError::ServerError);
    }
  };

  Ok(simple_json_success())
}

async fn user_delete_inference_result(
  inference_result_token: &str,
  mysql_pool: &MySqlPool
) -> Result<(), sqlx::Error> {
  let _r = sqlx::query!(
        r#"
UPDATE tts_results
SET
  user_deleted_at = CURRENT_TIMESTAMP
WHERE
  token = ?
LIMIT 1
        "#,
      inference_result_token,
    )
      .execute(mysql_pool)
      .await?;
  Ok(())
}

async fn mod_delete_inference_result(
  inference_result_token: &str,
  mod_user_token: &str,
  mysql_pool: &MySqlPool
) -> Result<(), sqlx::Error> {
  let _r = sqlx::query!(
        r#"
UPDATE tts_results
SET
  mod_deleted_at = CURRENT_TIMESTAMP,
  maybe_mod_user_token = ?
WHERE
  token = ?
LIMIT 1
        "#,
      mod_user_token,
      inference_result_token,
    )
    .execute(mysql_pool)
    .await?;
  Ok(())
}

async fn user_undelete_inference_result(
  inference_result_token: &str,
  mysql_pool: &MySqlPool
) -> Result<(), sqlx::Error> {

  let _r = sqlx::query!(
        r#"
UPDATE tts_results
SET
  user_deleted_at = NULL
WHERE
  token = ?
LIMIT 1
        "#,
      inference_result_token,
    )
    .execute(mysql_pool)
    .await?;
  Ok(())
}

async fn mod_undelete_inference_result(
  inference_result_token: &str,
  mod_user_token: &str,
  mysql_pool: &MySqlPool
) -> Result<(), sqlx::Error> {

  let _r = sqlx::query!(
        r#"
UPDATE tts_results
SET
  mod_deleted_at = NULL,
  maybe_mod_user_token = ?
WHERE
  token = ?
LIMIT 1
        "#,
      mod_user_token,
      inference_result_token,
    )
      .execute(mysql_pool)
      .await?;
  Ok(())
}
