use actix_http::Error;
use actix_http::http::header;
use actix_web::cookie::Cookie;
use actix_web::dev::HttpResponseBuilder;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Path;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest};
use crate::common_queries::query_tts_model::select_tts_model_by_token;
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
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::sync::Arc;

/// For the URL PathInfo
#[derive(Deserialize)]
pub struct EditTtsModelPathInfo {
  model_token: String,
}

#[derive(Deserialize)]
pub struct EditTtsModelRequest {
  pub title: Option<String>,
  pub description_markdown: Option<String>,

  //pub updatable_slug: Option<String>,
  //pub creator_set_visibility: Option<String>,

  //pub tts_model_type: Option<String>,
  //pub text_preprocessing_algorithm: Option<String>,
  //pub vocoder_token: Option<String>,

  //pub is_mod_disabled: Option<bool>,
  //pub is_locked_from_user_modification: Option<bool>,
  //pub maybe_mod_comments: Option<String>,
}

#[derive(Debug, Display)]
pub enum EditTtsModelError {
  BadInput(String),
  NotAuthorized,
  TemplateNotFound,
  ServerError,
}

impl ResponseError for EditTtsModelError {
  fn status_code(&self) -> StatusCode {
    match *self {
      EditTtsModelError::BadInput(_) => StatusCode::BAD_REQUEST,
      EditTtsModelError::NotAuthorized => StatusCode::UNAUTHORIZED,
      EditTtsModelError::TemplateNotFound => StatusCode::NOT_FOUND,
      EditTtsModelError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      EditTtsModelError::BadInput(reason) => reason.to_string(),
      EditTtsModelError::NotAuthorized=> "unauthorized".to_string(),
      EditTtsModelError::TemplateNotFound => "not found".to_string(),
      EditTtsModelError::ServerError => "server error".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

pub async fn edit_tts_model_handler(
  http_request: HttpRequest,
  path: Path<EditTtsModelPathInfo>,
  request: web::Json<EditTtsModelRequest>,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, EditTtsModelError>
{
  let maybe_user_session = server_state
      .session_checker
      .maybe_get_user_session(&http_request, &server_state.mysql_pool)
      .await
      .map_err(|e| {
        warn!("Session checker error: {:?}", e);
        EditTtsModelError::ServerError
      })?;

  let user_session = match maybe_user_session {
    Some(session) => session,
    None => {
      warn!("not logged in");
      return Err(EditTtsModelError::NotAuthorized);
    }
  };

  // NB: First permission check.
  // Only mods should see deleted models (both user_* and mod_* deleted).
  let is_mod_that_can_see_deleted = user_session.can_delete_other_users_tts_models;

  let model_lookup_result = select_tts_model_by_token(
    &path.model_token,
    is_mod_that_can_see_deleted,
    &server_state.mysql_pool).await;

  let model_record = match model_lookup_result {
    Ok(Some(result)) => {
      info!("Found model: {}", result.model_token);
      result
    },
    Ok(None) => {
      warn!("could not find model");
      return Err(EditTtsModelError::TemplateNotFound);
    },
    Err(err) => {
      warn!("error looking up model: {:?}", err);
      return Err(EditTtsModelError::TemplateNotFound);
    },
  };

  // NB: Second set of permission checks
  let mut editor_is_original_user = false;
  let mut editor_is_moderator = false;

  if model_record.creator_user_token == user_session.user_token {
    editor_is_original_user = true;
  }

  if user_session.can_edit_other_users_tts_models {
    editor_is_moderator = true;
  }

  if !editor_is_original_user && !editor_is_moderator {
    return Err(EditTtsModelError::NotAuthorized);
  }

  if !editor_is_moderator {
    if model_record.is_locked_from_user_modification || model_record.is_mod_disabled {
      return Err(EditTtsModelError::NotAuthorized);
    }
  }

  // Fields to set
  let mut title = None;
  let mut description_markdown = None;
  let mut description_html = None;

  if let Some(payload) = request.title.as_deref() {
    if contains_slurs(payload) {
      return Err(EditTtsModelError::BadInput("title contains slurs".to_string()));
    }

    title = Some(payload.to_string());
  }

  if let Some(markdown) = request.description_markdown.as_deref() {
    if contains_slurs(markdown) {
      return Err(EditTtsModelError::BadInput("description contains slurs".to_string()));
    }

    let markdown = markdown.trim().to_string();
    let html = markdown_to_html(&markdown);

    description_markdown = Some(markdown);
    description_html = Some(html);
  }

  let ip_address = get_request_ip(&http_request);

  let query_result = if editor_is_original_user {
    // We need to store the IP address details.
    sqlx::query!(
        r#"
UPDATE tts_models
SET
    title = ?,
    description_markdown = ?,
    description_rendered_html = ?,
    creator_ip_address_last_update = ?,
    version = version + 1

WHERE tts_models.token = ?
LIMIT 1
        "#,
      &title,
      &description_markdown,
      &description_html,
      &ip_address,
      &model_record.model_token,
    )
        .execute(&server_state.mysql_pool)
        .await
  } else {
    // We need to store the moderator details.
    sqlx::query!(
        r#"
UPDATE tts_models
SET
    title = ?,
    description_markdown = ?,
    description_rendered_html = ?,
    maybe_mod_user_token = ?,
    version = version + 1

WHERE tts_models.token = ?
LIMIT 1
        "#,
      &title,
      &description_markdown,
      &description_html,
      &user_session.user_token,
      &model_record.model_token,
    )
        .execute(&server_state.mysql_pool)
        .await
  };

  match query_result {
    Ok(_) => {},
    Err(err) => {
      warn!("Update W2L model edit DB error: {:?}", err);
      return Err(EditTtsModelError::ServerError);
    }
  };

  Ok(simple_json_success())
}
