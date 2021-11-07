use actix_http::Error;
use actix_http::http::header;
use actix_web::cookie::Cookie;
use actix_web::dev::HttpResponseBuilder;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Path;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest};
use chrono::{DateTime, Utc};
use crate::database::helpers::enums::{DownloadUrlType, CreatorSetVisibility, W2lTemplateType};
use crate::database::queries::list_user_roles::UserRoleForList;
use crate::database::queries::list_user_roles::list_user_roles;
use crate::http_server::web_utils::ip_address::get_request_ip;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::http_server::web_utils::response_success_helpers::simple_json_success;
use crate::server_state::ServerState;
use crate::util::random_prefix_crockford_token::random_prefix_crockford_token;
use crate::validations::check_for_slurs::contains_slurs;
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

#[derive(Serialize)]
pub struct ListUserRolesResponse {
  pub success: bool,
  pub user_roles: Vec<UserRoleForList>,
}

#[derive(Debug, Display)]
pub enum ListUserRolesError {
  BadInput(String),
  ServerError,
  Unauthorized,
}

impl ResponseError for ListUserRolesError {
  fn status_code(&self) -> StatusCode {
    match *self {
      ListUserRolesError::BadInput(_) => StatusCode::BAD_REQUEST,
      ListUserRolesError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
      ListUserRolesError::Unauthorized => StatusCode::UNAUTHORIZED,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      ListUserRolesError::BadInput(reason) => reason.to_string(),
      ListUserRolesError::ServerError => "server error".to_string(),
      ListUserRolesError::Unauthorized => "unauthorized".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

pub async fn list_user_roles_handler(
  http_request: HttpRequest,
  server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, ListUserRolesError> {

  let maybe_user_session = server_state
      .session_checker
      .maybe_get_user_session(&http_request, &server_state.mysql_pool)
      .await
      .map_err(|e| {
        warn!("Session checker error: {:?}", e);
        ListUserRolesError::ServerError
      })?;

  let user_session = match maybe_user_session {
    Some(session) => session,
    None => {
      warn!("not logged in");
      return Err(ListUserRolesError::Unauthorized);
    }
  };

  // TODO: Add new permission for this.
  if !user_session.can_ban_users {
    warn!("user is not allowed to view user roles: {}", user_session.user_token);
    return Err(ListUserRolesError::Unauthorized);
  }

  let maybe_user_roles =
      list_user_roles(&server_state.mysql_pool).await;

  let user_roles = match maybe_user_roles {
    Ok(results) => results,
    Err(e) => {
      warn!("Error querying user roles: {:?}", e);
      return Err(ListUserRolesError::ServerError);
    }
  };

  let response = ListUserRolesResponse {
    success: true,
    user_roles,
  };

  let body = serde_json::to_string(&response)
      .map_err(|e| ListUserRolesError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
