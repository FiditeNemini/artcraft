use actix_http::Error;
use actix_http::http::header;
use actix_web::cookie::Cookie;
use actix_web::dev::HttpResponseBuilder;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Path;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest, HttpMessage};
use chrono::{DateTime, Utc};
use crate::AnyhowResult;
use crate::database::queries::query_w2l_result::W2lResultRecordForResponse;
use crate::database::queries::query_w2l_result::select_w2l_result_by_token;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
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
pub struct GetW2lResultPathInfo {
  token: String,
}

#[derive(Serialize)]
pub struct GetW2lResultSuccessResponse {
  pub success: bool,
  pub result: W2lResultRecordForResponse,
}

#[derive(Debug, Display)]
pub enum GetW2lResultError {
  ServerError,
  NotFound,
}

impl ResponseError for GetW2lResultError {
  fn status_code(&self) -> StatusCode {
    match *self {
      GetW2lResultError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
      GetW2lResultError::NotFound => StatusCode::NOT_FOUND,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      GetW2lResultError::ServerError => "server error".to_string(),
      GetW2lResultError::NotFound => "not founnd".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

pub async fn get_w2l_inference_result_handler(
  http_request: HttpRequest,
  path: Path<GetW2lResultPathInfo>,
  server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, GetW2lResultError> {
  let maybe_user_session = server_state
      .session_checker
      .maybe_get_user_session(&http_request, &server_state.mysql_pool)
      .await
      .map_err(|e| {
        warn!("Session checker error: {:?}", e);
        GetW2lResultError::ServerError
      })?;

  let mut show_deleted_results = false;
  let mut is_moderator = false;

  if let Some(user_session) = maybe_user_session {
    // NB: Moderators can see deleted results.
    // Original creators cannot see them (unless they're moderators!)
    show_deleted_results = user_session.can_delete_other_users_w2l_results;
    // Moderators get to see all the fields.
    is_moderator = user_session.can_delete_other_users_w2l_results
        || user_session.can_edit_other_users_w2l_templates;
  }

  let inference_result_query_result = select_w2l_result_by_token(
    &path.token,
    show_deleted_results,
    &server_state.mysql_pool
  ).await;

  let mut inference_result = match inference_result_query_result {
    Err(e) => {
      warn!("query error: {:?}", e);
      return Err(GetW2lResultError::ServerError);
    }
    Ok(None) => return Err(GetW2lResultError::NotFound),
    Ok(Some(inference_result)) => inference_result,
  };

  if !is_moderator {
    inference_result.maybe_moderator_fields = None;
  }

  let response = GetW2lResultSuccessResponse {
    success: true,
    result: inference_result,
  };

  let body = serde_json::to_string(&response)
    .map_err(|e| GetW2lResultError::ServerError)?;

  Ok(HttpResponse::Ok()
    .content_type("application/json")
    .body(body))
}
