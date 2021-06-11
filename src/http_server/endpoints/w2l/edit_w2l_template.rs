use actix_http::Error;
use actix_http::http::header;
use actix_web::cookie::Cookie;
use actix_web::dev::HttpResponseBuilder;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::{Path, Json};
use actix_web::{Responder, web, HttpResponse, error, HttpRequest};
use crate::common_queries::query_w2l_template::select_w2l_template_by_token;
use crate::common_queries::sessions::create_session_for_user;
use crate::http_server::web_utils::ip_address::get_request_ip;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::http_server::web_utils::response_success_helpers::simple_json_success;
use crate::server_state::ServerState;
use crate::util::email_to_gravatar::email_to_gravatar;
use crate::util::markdown_to_html::markdown_to_html;
use crate::util::random_crockford_token::random_crockford_token;
use crate::util::random_prefix_crockford_token::random_prefix_crockford_token;
use crate::validations::check_for_slurs::contains_slurs;
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
pub struct EditW2lTemplatePathInfo {
  template_token: String,
}

#[derive(Deserialize)]
pub struct EditW2lTemplateRequest {
  // ========== Author + Moderator options ==========
  pub title: Option<String>,
  pub description_markdown: Option<String>,
  //pub updatable_slug: Option<String>,
  //pub creator_set_visibility: Option<String>,

  // ========== Moderator options ==========

  pub is_public_listing_approved: Option<bool>,
  pub is_locked_from_user_modification: Option<bool>,
  pub is_locked_from_use: Option<bool>,
  pub maybe_mod_comments: Option<String>,
}

#[derive(Debug, Display)]
pub enum EditW2lTemplateError {
  BadInput(String),
  NotAuthorized,
  TemplateNotFound,
  ServerError,
}

impl ResponseError for EditW2lTemplateError {
  fn status_code(&self) -> StatusCode {
    match *self {
      EditW2lTemplateError::BadInput(_) => StatusCode::BAD_REQUEST,
      EditW2lTemplateError::NotAuthorized => StatusCode::UNAUTHORIZED,
      EditW2lTemplateError::TemplateNotFound => StatusCode::NOT_FOUND,
      EditW2lTemplateError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      EditW2lTemplateError::BadInput(reason) => reason.to_string(),
      EditW2lTemplateError::NotAuthorized=> "unauthorized".to_string(),
      EditW2lTemplateError::TemplateNotFound => "not found".to_string(),
      EditW2lTemplateError::ServerError => "server error".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

pub async fn edit_w2l_template_handler(
  http_request: HttpRequest,
  path: Path<EditW2lTemplatePathInfo>,
  request: web::Json<EditW2lTemplateRequest>,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, EditW2lTemplateError>
{
  let maybe_user_session = server_state
      .session_checker
      .maybe_get_user_session(&http_request, &server_state.mysql_pool)
      .await
      .map_err(|e| {
        warn!("Session checker error: {:?}", e);
        EditW2lTemplateError::ServerError
      })?;

  let user_session = match maybe_user_session {
    Some(session) => session,
    None => {
      warn!("not logged in");
      return Err(EditW2lTemplateError::NotAuthorized);
    }
  };

  // NB: First permission check.
  // Only mods should see deleted templates (both user_* and mod_* deleted).
  let is_mod_that_can_see_deleted = user_session.can_delete_other_users_w2l_templates;

  let template_lookup_result = select_w2l_template_by_token(
    &path.template_token,
    is_mod_that_can_see_deleted,
    &server_state.mysql_pool).await;

  let template_record = match template_lookup_result {
    Ok(Some(result)) => {
      info!("Found template: {}", result.template_token);
      result
    },
    Ok(None) => {
      warn!("could not find template");
      return Err(EditW2lTemplateError::TemplateNotFound);
    },
    Err(err) => {
      warn!("error looking up template: {:?}", err);
      return Err(EditW2lTemplateError::TemplateNotFound);
    },
  };

  // NB: Second set of permission checks
  let is_author = template_record.creator_user_token == user_session.user_token;
  let is_mod = user_session.can_edit_other_users_w2l_templates ;

  if !is_author && !is_mod {
    return Err(EditW2lTemplateError::NotAuthorized);
  }

  if !is_mod {
    if template_record.is_locked_from_user_modification || template_record.is_locked_from_use {
      return Err(EditW2lTemplateError::NotAuthorized);
    }
  }

  // Author + Mod fields.
  // These fields must be present on all requests.
  let mut title = None;
  let mut description_markdown = None;
  let mut description_html = None;

  if let Some(payload) = request.title.as_deref() {
    if contains_slurs(payload) {
      return Err(EditW2lTemplateError::BadInput("title contains slurs".to_string()));
    }

    title = Some(payload.to_string());
  }

  if let Some(markdown) = request.description_markdown.as_deref() {
    if contains_slurs(markdown) {
      return Err(EditW2lTemplateError::BadInput("description contains slurs".to_string()));
    }

    let markdown = markdown.trim().to_string();
    let html = markdown_to_html(&markdown);

    description_markdown = Some(markdown);
    description_html = Some(html);
  }

  let ip_address = get_request_ip(&http_request);

  let query_result = if is_author {
    // We need to store the IP address details.
    sqlx::query!(
        r#"
UPDATE w2l_templates
SET
    title = ?,
    description_markdown = ?,
    description_rendered_html = ?,
    creator_ip_address_last_update = ?,
    version = version + 1
WHERE token = ?
LIMIT 1
        "#,
      &title,
      &description_markdown,
      &description_html,
      &ip_address,
      &template_record.template_token,
    )
        .execute(&server_state.mysql_pool)
        .await
  } else {
    // We need to store the moderator details.
    sqlx::query!(
        r#"
UPDATE w2l_templates
SET
    title = ?,
    description_markdown = ?,
    description_rendered_html = ?,
    maybe_mod_user_token = ?,
    version = version + 1
WHERE token = ?
LIMIT 1
        "#,
      &title,
      &description_markdown,
      &description_html,
      &user_session.user_token,
      &template_record.template_token,
    )
        .execute(&server_state.mysql_pool)
        .await
  };

  match query_result {
    Ok(_) => {},
    Err(err) => {
      warn!("Update W2L template edit DB error: {:?}", err);
      return Err(EditW2lTemplateError::ServerError);
    }
  };

  // TODO: This is lazy and suboptimal af to query again
  //  The reason we're doing this is because `sqlx` only does static type checking of queries
  //  with string literals. It does not support dynamic query building, thus the predicates
  //  must be held constant. :(
  if is_mod {
    update_mod_details(
      &request,
      &user_session.user_token,
      &template_record.template_token,
      &server_state.mysql_pool
    ).await?;
  }

  Ok(simple_json_success())
}

async fn update_mod_details(
  request: &Json<EditW2lTemplateRequest>,
  mod_user_token: &str,
  template_token: &str,
  mysql_pool: &MySqlPool
) -> Result<(), EditW2lTemplateError> {

  let is_public_listing_approved= request.is_public_listing_approved.unwrap_or(false);
  let is_locked_from_user_modification = request.is_locked_from_user_modification.unwrap_or(false);
  let is_locked_from_use = request.is_locked_from_use.unwrap_or(false);

  let query_result = sqlx::query!(
        r#"
UPDATE w2l_templates
SET
    is_public_listing_approved = ?,
    is_locked_from_user_modification = ?,
    is_locked_from_use = ?,
    maybe_mod_comments = ?,
    maybe_mod_user_token = ?,
    version = version + 1
WHERE token = ?
LIMIT 1
        "#,
      is_public_listing_approved,
      is_locked_from_user_modification,
      is_locked_from_use,
      request.maybe_mod_comments,
      mod_user_token,
      template_token
    )
      .execute(mysql_pool)
      .await;

  match query_result {
    Ok(_) => Ok(()),
    Err(err) => {
      warn!("Update W2L template (mod details) DB error: {:?}", err);
      Err(EditW2lTemplateError::ServerError)
    }
  }
}
