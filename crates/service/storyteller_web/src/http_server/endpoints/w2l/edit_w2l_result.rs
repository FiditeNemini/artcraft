use actix_http::Error;
use actix_http::http::header;
use actix_web::HttpResponseBuilder;
use actix_web::cookie::Cookie;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::{Path, Json};
use actix_web::{Responder, web, HttpResponse, error, HttpRequest};
use crate::database::queries::query_w2l_result::select_w2l_result_by_token;
use crate::http_server::web_utils::ip_address::get_request_ip;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::http_server::web_utils::response_success_helpers::simple_json_success;
use crate::server_state::ServerState;
use crate::util::email_to_gravatar::email_to_gravatar;
use crate::util::markdown_to_html::markdown_to_html;
use database_queries::column_types::record_visibility::RecordVisibility;
use log::{info, warn, log};
use regex::Regex;
use sqlx::MySqlPool;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::fmt;
use std::sync::Arc;

/// For the URL PathInfo
#[derive(Deserialize)]
pub struct EditW2lResultPathInfo {
  token: String,
}

#[derive(Deserialize)]
pub struct EditW2lResultRequest {
  // ========== Author + Moderator options ==========
  pub creator_set_visibility: Option<String>,
}

#[derive(Debug)]
pub enum EditW2lResultError {
  BadInput(String),
  NotAuthorized,
  ResultNotFound,
  ServerError,
}

impl ResponseError for EditW2lResultError {
  fn status_code(&self) -> StatusCode {
    match *self {
      EditW2lResultError::BadInput(_) => StatusCode::BAD_REQUEST,
      EditW2lResultError::NotAuthorized => StatusCode::UNAUTHORIZED,
      EditW2lResultError::ResultNotFound => StatusCode::NOT_FOUND,
      EditW2lResultError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      EditW2lResultError::BadInput(reason) => reason.to_string(),
      EditW2lResultError::NotAuthorized=> "unauthorized".to_string(),
      EditW2lResultError::ResultNotFound => "not found".to_string(),
      EditW2lResultError::ServerError => "server error".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for EditW2lResultError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

pub async fn edit_w2l_inference_result_handler(
  http_request: HttpRequest,
  path: Path<EditW2lResultPathInfo>,
  request: web::Json<EditW2lResultRequest>,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, EditW2lResultError>
{
  let maybe_user_session = server_state
      .session_checker
      .maybe_get_user_session(&http_request, &server_state.mysql_pool)
      .await
      .map_err(|e| {
        warn!("Session checker error: {:?}", e);
        EditW2lResultError::ServerError
      })?;

  let user_session = match maybe_user_session {
    Some(session) => session,
    None => {
      warn!("not logged in");
      return Err(EditW2lResultError::NotAuthorized);
    }
  };

  // NB: Moderators can see deleted results.
  // Original creators cannot see them (unless they're moderators!)
  let show_deleted_results = user_session.can_delete_other_users_w2l_results;

  // Moderators get to see all the fields.
  let is_moderator = user_session.can_delete_other_users_w2l_results
      || user_session.can_edit_other_users_w2l_templates; // TODO: Not an exact permission fit

  let inference_result_query_result = select_w2l_result_by_token(
    &path.token,
    show_deleted_results,
    &server_state.mysql_pool
  ).await;

  let mut inference_result = match inference_result_query_result {
    Err(e) => {
      warn!("query error: {:?}", e);
      return Err(EditW2lResultError::ServerError);
    }
    Ok(None) => return Err(EditW2lResultError::ResultNotFound),
    Ok(Some(inference_result)) => inference_result,
  };

  // NB: Second set of permission checks
  let mut is_author = false;
  if let Some(creator_user_token) = inference_result.maybe_creator_user_token.as_deref() {
    is_author = creator_user_token == &user_session.user_token;
  }

  if !is_author && !is_moderator {
    warn!("user is not allowed to edit result: {}", user_session.user_token);
    return Err(EditW2lResultError::NotAuthorized);
  }

  // Author + Mod fields.
  // These fields must be present on all requests.
  let mut creator_set_visibility = RecordVisibility::Public;

  if let Some(visibility) = request.creator_set_visibility.as_deref() {
    creator_set_visibility = RecordVisibility::from_str(visibility)
        .map_err(|_| EditW2lResultError::BadInput("bad record visibility".to_string()))?;
  }

  let ip_address = get_request_ip(&http_request);

  let query_result = if is_author {
    // TODO: Don't update the original IP address. Create a new field.
    // We need to store the IP address details.
    sqlx::query!(
        r#"
UPDATE w2l_results
SET
    creator_set_visibility = ?,
    creator_ip_address = ?
WHERE token = ?
LIMIT 1
        "#,
      &creator_set_visibility.to_str(),
      &ip_address,
      &inference_result.w2l_result_token,
    )
        .execute(&server_state.mysql_pool)
        .await
  } else {
    // We need to store the moderator details.
    sqlx::query!(
        r#"
UPDATE w2l_results
SET
    creator_set_visibility = ?,
    maybe_mod_user_token = ?
WHERE token = ?
LIMIT 1
        "#,
      &creator_set_visibility.to_str(),
      &user_session.user_token,
      &inference_result.w2l_result_token,
    )
        .execute(&server_state.mysql_pool)
        .await
  };

  match query_result {
    Ok(_) => {},
    Err(err) => {
      warn!("Update W2L result DB error: {:?}", err);
      return Err(EditW2lResultError::ServerError);
    }
  };

  Ok(simple_json_success())
}
