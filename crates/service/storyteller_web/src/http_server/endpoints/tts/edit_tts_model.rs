use actix_http::Error;
use actix_http::http::header;
use actix_web::HttpResponseBuilder;
use actix_web::cookie::Cookie;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::{Path, Json};
use actix_web::{Responder, web, HttpResponse, error, HttpRequest};
use crate::http_server::web_utils::ip_address::get_request_ip;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::http_server::web_utils::response_success_helpers::simple_json_success;
use crate::server_state::ServerState;
use crate::util::email_to_gravatar::email_to_gravatar;
use crate::util::markdown_to_html::markdown_to_html;
use database_queries::column_types::record_visibility::RecordVisibility;
use database_queries::column_types::vocoder_type::VocoderType;
use database_queries::tts::tts_models::get_tts_model::get_tts_model_by_token;
use log::{info, warn, log};
use regex::Regex;
use sqlx::MySqlPool;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::fmt;
use std::sync::Arc;
use user_input_common::check_for_slurs::contains_slurs;

/// For the URL PathInfo
#[derive(Deserialize)]
pub struct EditTtsModelPathInfo {
  model_token: String,
}

#[derive(Deserialize)]
pub struct EditTtsModelRequest {
  // ========== Author + Moderator options ==========

  pub title: Option<String>,
  pub description_markdown: Option<String>,
  pub creator_set_visibility: Option<String>,
  pub maybe_default_pretrained_vocoder: Option<VocoderType>,
  //pub updatable_slug: Option<String>,
  //pub tts_model_type: Option<String>,
  //pub text_preprocessing_algorithm: Option<String>,
  //pub vocoder_token: Option<String>,

  // ========== Moderator options (protection) ==========

  pub is_public_listing_approved: Option<bool>,
  pub is_locked_from_user_modification: Option<bool>,
  pub is_locked_from_use: Option<bool>,
  pub maybe_mod_comments: Option<String>,

  // ========== Moderator options (front page) ==========

  pub is_front_page_featured: Option<bool>,
  pub is_twitch_featured: Option<bool>,
}

#[derive(Debug)]
pub enum EditTtsModelError {
  BadInput(String),
  NotAuthorized,
  ModelNotFound,
  ServerError,
}

impl ResponseError for EditTtsModelError {
  fn status_code(&self) -> StatusCode {
    match *self {
      EditTtsModelError::BadInput(_) => StatusCode::BAD_REQUEST,
      EditTtsModelError::NotAuthorized => StatusCode::UNAUTHORIZED,
      EditTtsModelError::ModelNotFound => StatusCode::NOT_FOUND,
      EditTtsModelError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      EditTtsModelError::BadInput(reason) => reason.to_string(),
      EditTtsModelError::NotAuthorized=> "unauthorized".to_string(),
      EditTtsModelError::ModelNotFound => "not found".to_string(),
      EditTtsModelError::ServerError => "server error".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for EditTtsModelError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
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

  let model_lookup_result = get_tts_model_by_token(
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
      return Err(EditTtsModelError::ModelNotFound);
    },
    Err(err) => {
      warn!("error looking up model: {:?}", err);
      return Err(EditTtsModelError::ModelNotFound);
    },
  };

  // NB: Second set of permission checks
  let is_author = model_record.creator_user_token == user_session.user_token;
  let is_mod = user_session.can_edit_other_users_tts_models ;

  if !is_author && !is_mod {
    warn!("user is not allowed to edit model: {}", user_session.user_token);
    return Err(EditTtsModelError::NotAuthorized);
  }

  if !is_mod {
    if model_record.is_locked_from_user_modification || model_record.is_locked_from_use {
      return Err(EditTtsModelError::NotAuthorized);
    }
  }

  // Author + Mod fields.
  // These fields must be present on all requests.
  let mut title = None;
  let mut description_markdown = None;
  let mut description_html = None;
  let mut creator_set_visibility = RecordVisibility::Public;
  let mut maybe_default_pretrained_vocoder =
      model_record.maybe_default_pretrained_vocoder
          .clone();

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

  if let Some(visibility) = request.creator_set_visibility.as_deref() {
    creator_set_visibility = RecordVisibility::from_str(visibility)
        .map_err(|_| EditTtsModelError::BadInput("bad record visibility".to_string()))?;
  }

  if let Some(vocoder) = request.maybe_default_pretrained_vocoder {
    maybe_default_pretrained_vocoder = Some(vocoder);
  }

  let ip_address = get_request_ip(&http_request);

  let query_result = if is_author {
    // We need to store the IP address details.
    sqlx::query!(
        r#"
UPDATE tts_models
SET
    maybe_default_pretrained_vocoder = ?,
    title = ?,
    description_markdown = ?,
    description_rendered_html = ?,
    creator_set_visibility = ?,
    creator_ip_address_last_update = ?,
    version = version + 1
WHERE token = ?
LIMIT 1
        "#,
      maybe_default_pretrained_vocoder.map(|v| v.to_str()),
      &title,
      &description_markdown,
      &description_html,
      &creator_set_visibility.to_str(),
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
    maybe_default_pretrained_vocoder = ?,
    title = ?,
    description_markdown = ?,
    description_rendered_html = ?,
    creator_set_visibility = ?,
    maybe_mod_user_token = ?,
    version = version + 1
WHERE token = ?
LIMIT 1
        "#,
      maybe_default_pretrained_vocoder.map(|v| v.to_str()),
      &title,
      &description_markdown,
      &description_html,
      &creator_set_visibility.to_str(),
      &user_session.user_token,
      &model_record.model_token,
    )
        .execute(&server_state.mysql_pool)
        .await
  };

  // TODO: This is lazy and suboptimal af to UPDATE again.
  //  The reason we're doing this is because `sqlx` only does static type checking of queries
  //  with string literals. It does not support dynamic query building, thus the PREDICATES
  //  MUST BE HELD CONSTANT (at least in type signature). :(
  if is_mod {
    update_mod_details(
      &request,
      &user_session.user_token,
      &model_record.model_token,
      &server_state.mysql_pool
    ).await?;
  }

  match query_result {
    Ok(_) => {},
    Err(err) => {
      warn!("Update W2L model edit DB error: {:?}", err);
      return Err(EditTtsModelError::ServerError);
    }
  };

  Ok(simple_json_success())
}

async fn update_mod_details(
  request: &Json<EditTtsModelRequest>,
  mod_user_token: &str,
  model_token: &str,
  mysql_pool: &MySqlPool
) -> Result<(), EditTtsModelError> {

  let is_public_listing_approved= request.is_public_listing_approved.unwrap_or(false);
  let is_locked_from_user_modification = request.is_locked_from_user_modification.unwrap_or(false);
  let is_locked_from_use = request.is_locked_from_use.unwrap_or(false);

  let is_front_page_featured = request.is_front_page_featured.unwrap_or(false);
  let is_twitch_featured = request.is_twitch_featured.unwrap_or(false);

  let query_result = sqlx::query!(
        r#"
UPDATE tts_models
SET
    is_public_listing_approved = ?,
    is_locked_from_user_modification = ?,
    is_locked_from_use = ?,
    maybe_mod_comments = ?,
    maybe_mod_user_token = ?,
    is_front_page_featured = ?,
    is_twitch_featured = ?,
    version = version + 1
WHERE token = ?
LIMIT 1
        "#,
      is_public_listing_approved,
      is_locked_from_user_modification,
      is_locked_from_use,
      request.maybe_mod_comments,
      mod_user_token,
      is_front_page_featured,
      is_twitch_featured,
      model_token
    )
      .execute(mysql_pool)
      .await;

  match query_result {
    Ok(_) => Ok(()),
    Err(err) => {
      warn!("Update TTS model (mod details) DB error: {:?}", err);
      Err(EditTtsModelError::ServerError)
    }
  }
}
