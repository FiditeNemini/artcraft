use actix_http::Error;
use actix_http::http::header;
use actix_web::cookie::Cookie;
use actix_web::dev::HttpResponseBuilder;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Path;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest};
use crate::database::queries::query_w2l_result::select_w2l_result_by_token;
use crate::http_server::web_utils::ip_address::get_request_ip;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::http_server::web_utils::response_success_helpers::simple_json_success;
use crate::server_state::ServerState;
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
pub struct DeleteW2lInferenceResultPathInfo {
  token: String,
}

#[derive(Deserialize)]
pub struct DeleteW2lInferenceResultRequest {
  set_delete: bool,
}

#[derive(Debug, Display)]
pub enum DeleteW2lInferenceResultError {
  BadInput(String),
  NotAuthorized,
  NotFound,
  ServerError,
}

impl ResponseError for DeleteW2lInferenceResultError {
  fn status_code(&self) -> StatusCode {
    match *self {
      DeleteW2lInferenceResultError::BadInput(_) => StatusCode::BAD_REQUEST,
      DeleteW2lInferenceResultError::NotAuthorized => StatusCode::UNAUTHORIZED,
      DeleteW2lInferenceResultError::NotFound => StatusCode::NOT_FOUND,
      DeleteW2lInferenceResultError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      DeleteW2lInferenceResultError::BadInput(reason) => reason.to_string(),
      DeleteW2lInferenceResultError::NotAuthorized => "unauthorized".to_string(),
      DeleteW2lInferenceResultError::NotFound => "not found".to_string(),
      DeleteW2lInferenceResultError::ServerError => "server error".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

pub async fn delete_w2l_inference_result_handler(
  http_request: HttpRequest,
  path: Path<DeleteW2lInferenceResultPathInfo>,
  request: web::Json<DeleteW2lInferenceResultRequest>,
  server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, DeleteW2lInferenceResultError> {
  let maybe_user_session = server_state
      .session_checker
      .maybe_get_user_session(&http_request, &server_state.mysql_pool)
      .await
      .map_err(|e| {
        warn!("Session checker error: {:?}", e);
        DeleteW2lInferenceResultError::ServerError
      })?;

  let user_session = match maybe_user_session {
    Some(session) => session,
    None => {
      warn!("not logged in");
      return Err(DeleteW2lInferenceResultError::NotAuthorized);
    }
  };

  // NB: First permission check.
  // Only mods should see deleted models (both user_* and mod_* deleted).
  let is_mod_that_can_see_deleted = user_session.can_delete_other_users_w2l_results;

  let inference_result_query_result = select_w2l_result_by_token(
    &path.token,
    is_mod_that_can_see_deleted,
    &server_state.mysql_pool,
  ).await;

  let w2l_inference_result = match inference_result_query_result {
    Err(e) => {
      warn!("query error: {:?}", e);
      return Err(DeleteW2lInferenceResultError::ServerError);
    }
    Ok(None) => return Err(DeleteW2lInferenceResultError::NotFound),
    Ok(Some(inference_result)) => inference_result,
  };

  // NB: Second set of permission checks
  let is_author = w2l_inference_result.maybe_creator_user_token
      .as_deref()
      .map(|creator_token| creator_token == &user_session.user_token)
      .unwrap_or(false);

  let is_mod = user_session.can_delete_other_users_w2l_results;

  if !is_author && !is_mod {
    warn!("user is not allowed to delete inference results: {}", user_session.user_token);
    return Err(DeleteW2lInferenceResultError::NotAuthorized);
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
      warn!("Update w2l mod approval status DB error: {:?}", err);
      return Err(DeleteW2lInferenceResultError::ServerError);
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
UPDATE w2l_results
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
UPDATE w2l_results
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
UPDATE w2l_results
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
UPDATE w2l_results
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
