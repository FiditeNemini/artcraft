use actix_http::Error;
use actix_http::http::header;
use actix_web::cookie::Cookie;
use actix_web::dev::HttpResponseBuilder;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Path;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest};
use crate::common_queries::query_w2l_template::select_w2l_template_by_token;
use crate::database_helpers::enums::{DownloadUrlType, CreatorSetVisibility, W2lTemplateType};
use crate::http_server::web_utils::ip_address::get_request_ip;
use crate::server_state::ServerState;
use crate::util::random_crockford_token::random_crockford_token;
use crate::validations::model_uploads::validate_model_title;
use crate::validations::passwords::validate_passwords;
use crate::validations::username::validate_username;
use derive_more::{Display, Error};
use log::{info, warn, log};
use regex::Regex;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::sync::Arc;
use sqlx::MySqlPool;

/// For the URL PathInfo
#[derive(Deserialize)]
pub struct DeleteW2lTemplatePathInfo {
  slug: String,
}

#[derive(Deserialize)]
pub struct DeleteW2lTemplateRequest {
  set_delete: bool,
}

#[derive(Serialize)]
pub struct DeleteW2lTemplateSuccessResponse {
  pub success: bool,
}

#[derive(Serialize)]
pub struct ErrorResponse {
  pub success: bool,
  pub error_reason: String,
}

#[derive(Debug, Display)]
pub enum DeleteW2lTemplateError {
  BadInput(String),
  NotAuthorized,
  NotFound,
  ServerError,
}

impl ResponseError for DeleteW2lTemplateError {
  fn status_code(&self) -> StatusCode {
    match *self {
      DeleteW2lTemplateError::BadInput(_) => StatusCode::BAD_REQUEST,
      DeleteW2lTemplateError::NotAuthorized => StatusCode::UNAUTHORIZED,
      DeleteW2lTemplateError::NotFound => StatusCode::NOT_FOUND,
      DeleteW2lTemplateError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      DeleteW2lTemplateError::BadInput(reason) => reason.to_string(),
      DeleteW2lTemplateError::NotAuthorized => "unauthorized".to_string(),
      DeleteW2lTemplateError::NotFound => "not found".to_string(),
      DeleteW2lTemplateError::ServerError => "server error".to_string(),
    };

    let response = ErrorResponse {
      success: false,
      error_reason,
    };

    let body = match serde_json::to_string(&response) {
      Ok(json) => json,
      Err(_) => "{}".to_string(),
    };

    HttpResponseBuilder::new(self.status_code())
        .set_header(header::CONTENT_TYPE, "application/json")
        .body(body)
  }
}

pub async fn delete_w2l_template_handler(
  http_request: HttpRequest,
  path: Path<DeleteW2lTemplatePathInfo>,
  request: web::Json<DeleteW2lTemplateRequest>,
  server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, DeleteW2lTemplateError> {
  let maybe_user_session = server_state
      .session_checker
      .maybe_get_user_session(&http_request, &server_state.mysql_pool)
      .await
      .map_err(|e| {
        warn!("Session checker error: {:?}", e);
        DeleteW2lTemplateError::ServerError
      })?;

  let user_session = match maybe_user_session {
    Some(session) => session,
    None => {
      warn!("not logged in");
      return Err(DeleteW2lTemplateError::NotAuthorized);
    }
  };

  if !user_session.can_delete_other_users_w2l_templates {
    warn!("user is not allowed to delete templates: {}", user_session.user_token);
    return Err(DeleteW2lTemplateError::NotAuthorized);
  }

  let template_query_result = select_w2l_template_by_token(
    &path.slug,
    true, // Only mods can perform this action
    &server_state.mysql_pool,
  ).await;

  let w2l_template = match template_query_result {
    Err(e) => {
      warn!("query error: {:?}", e);
      return Err(DeleteW2lTemplateError::ServerError);
    }
    Ok(None) => return Err(DeleteW2lTemplateError::NotFound),
    Ok(Some(template)) => template,
  };

  let ip_address = get_request_ip(&http_request);

  let query_result = if request.set_delete {
    delete_template(
      &path.slug,
      &user_session.user_token,
      &server_state.mysql_pool
    ).await
  } else {
    undelete_template(
      &path.slug,
      &user_session.user_token,
      &server_state.mysql_pool
    ).await
  };

  match query_result {
    Ok(_) => {},
    Err(err) => {
      warn!("Update w2l mod approval status DB error: {:?}", err);
      return Err(DeleteW2lTemplateError::ServerError);
    }
  };

  let response = DeleteW2lTemplateSuccessResponse {
    success: true,
  };

  let body = serde_json::to_string(&response)
      .map_err(|e| DeleteW2lTemplateError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}

async fn delete_template(
  template_token: &str,
  mod_user_token: &str,
  mysql_pool: &MySqlPool
) -> Result<(), sqlx::Error> {
  let _r = sqlx::query!(
        r#"
UPDATE w2l_templates
SET
  deleted_at = CURRENT_TIMESTAMP,
  maybe_mod_user_token = ?
WHERE
  token = ?
LIMIT 1
        "#,
      mod_user_token,
      template_token,
    )
    .execute(mysql_pool)
    .await?;
  Ok(())
}

async fn undelete_template(
  template_token: &str,
  mod_user_token: &str,
  mysql_pool: &MySqlPool
) -> Result<(), sqlx::Error> {

  let _r = sqlx::query!(
        r#"
UPDATE w2l_templates
SET
  deleted_at = NULL,
  maybe_mod_user_token = ?
WHERE
  token = ?
LIMIT 1
        "#,
      mod_user_token,
      template_token,
    )
    .execute(mysql_pool)
    .await?;
  Ok(())
}
