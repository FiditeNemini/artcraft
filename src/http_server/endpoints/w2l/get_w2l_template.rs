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
use crate::common_queries::query_w2l_template::W2lTemplateRecordForResponse;
use crate::common_queries::query_w2l_template::select_w2l_template_by_token;
use crate::common_queries::sessions::create_session_for_user;
use crate::database_helpers::boolean_converters::nullable_i8_to_optional_bool;
use crate::http_server::web_utils::ip_address::get_request_ip;
use crate::server_state::ServerState;
use crate::util::random_crockford_token::random_crockford_token;
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
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;

/// For the URL PathInfo
#[derive(Deserialize)]
pub struct GetW2lTemplatePathInfo {
  token: String,
}

#[derive(Serialize)]
pub struct GetW2lTemplateSuccessResponse {
  pub success: bool,
  pub template: W2lTemplateRecordForResponse,
}

#[derive(Debug, Display)]
pub enum GetW2lTemplateError {
  ServerError,
  NotFound,
}

impl ResponseError for GetW2lTemplateError {
  fn status_code(&self) -> StatusCode {
    match *self {
      GetW2lTemplateError::ServerError=> StatusCode::INTERNAL_SERVER_ERROR,
      GetW2lTemplateError::NotFound => StatusCode::NOT_FOUND,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      GetW2lTemplateError::ServerError => "server error".to_string(),
      GetW2lTemplateError::NotFound=> "not found".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

pub async fn get_w2l_template_handler(
  http_request: HttpRequest,
  path: Path<GetW2lTemplatePathInfo>,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, GetW2lTemplateError>
{
  let maybe_user_session = server_state
      .session_checker
      .maybe_get_user_session(&http_request, &server_state.mysql_pool)
      .await
      .map_err(|e| {
        warn!("Session checker error: {:?}", e);
        GetW2lTemplateError::ServerError
      })?;

  let mut show_deleted_templates = false;

  if let Some(user_session) = maybe_user_session {
    // NB: Moderators can see deleted templates.
    // Original creators cannot see them (unless they're moderators!)
    show_deleted_templates = user_session.can_delete_other_users_w2l_templates;
  }

  let template_query_result = select_w2l_template_by_token(
    &path.token,
    show_deleted_templates,
    &server_state.mysql_pool
  ).await;

  let template = match template_query_result {
    Err(e) => {
      warn!("query error: {:?}", e);
      return Err(GetW2lTemplateError::ServerError);
    }
    Ok(None) => return Err(GetW2lTemplateError::NotFound),
    Ok(Some(template)) => template,
  };

  let response = GetW2lTemplateSuccessResponse {
    success: true,
    template,
  };

  let body = serde_json::to_string(&response)
    .map_err(|e| GetW2lTemplateError::ServerError)?;

  Ok(HttpResponse::Ok()
    .content_type("application/json")
    .body(body))
}
