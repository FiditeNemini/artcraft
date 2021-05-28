use actix_http::Error;
use actix_http::http::header;
use actix_web::cookie::Cookie;
use actix_web::dev::HttpResponseBuilder;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest, HttpMessage};
use crate::AnyhowResult;
use crate::common_queries::sessions::create_session_for_user;
use crate::http_server::endpoints::users::create_account::CreateAccountError::{BadInput, ServerError, UsernameTaken, EmailTaken};
use crate::http_server::endpoints::users::login::LoginSuccessResponse;
use crate::http_server::web_utils::ip_address::get_request_ip;
use crate::http_server::web_utils::session_checker::SessionRecord;
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
use chrono::{DateTime, Utc};

#[derive(Serialize)]
pub struct W2lTemplateRecordForResponse {
  pub template_token: String,
  pub template_type: String,
  pub creator_user_token: String,
  pub creator_username: String,
  pub creator_display_name: String,
  pub updatable_slug: String,
  pub title: String,
  pub frame_width: u32,
  pub frame_height: u32,
  pub duration_millis: u32,
  pub maybe_image_object_name: Option<String>,
  pub maybe_video_object_name: Option<String>,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct ListW2lTemplatesSuccessResponse {
  pub success: bool,
  pub templates: Vec<W2lTemplateRecordForResponse>,
}

#[derive(Serialize)]
pub struct ErrorResponse {
  pub success: bool,
  pub error_reason: String,
}

#[derive(Debug, Display)]
pub enum ListW2lTemplatesError {
  ServerError,
}

#[derive(Serialize)]
pub struct W2lTemplateRecord {
  pub template_token: String,
  pub template_type: String,
  pub creator_user_token: String,
  pub creator_username: String,
  pub creator_display_name: String,
  pub updatable_slug: String,
  pub title: String,
  pub frame_width: i32,
  pub frame_height: i32,
  pub duration_millis: i32,
  pub maybe_public_bucket_preview_image_object_name: Option<String>,
  pub maybe_public_bucket_preview_video_object_name: Option<String>,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

impl ResponseError for ListW2lTemplatesError {
  fn status_code(&self) -> StatusCode {
    match *self {
      ListW2lTemplatesError::ServerError=> StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      ListW2lTemplatesError::ServerError => "server error".to_string(),
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

pub async fn list_w2l_templates_handler(
  http_request: HttpRequest,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, ListW2lTemplatesError>
{
  // NB: Lookup failure is Err(RowNotFound).
  // NB: Since this is publicly exposed, we don't query sensitive data.
  let maybe_templates = sqlx::query_as!(
      W2lTemplateRecord,
        r#"
SELECT
    w2l.token as template_token,
    w2l.template_type,
    w2l.creator_user_token,
    users.username as creator_username,
    users.display_name as creator_display_name,
    w2l.updatable_slug,
    w2l.title,
    w2l.frame_width,
    w2l.frame_height,
    w2l.duration_millis,
    w2l.maybe_public_bucket_preview_image_object_name,
    w2l.maybe_public_bucket_preview_video_object_name,
    w2l.created_at,
    w2l.updated_at
FROM w2l_templates as w2l
JOIN users
ON users.token = w2l.creator_user_token
WHERE w2l.deleted_at IS NULL
        "#,
    )
    .fetch_all(&server_state.mysql_pool)
    .await; // TODO: This will return error if it doesn't exist

  let templates : Vec<W2lTemplateRecord> = match maybe_templates {
    Ok(templates) => templates,
    Err(err) => {
      match err {
        RowNotFound => {
          return Err(ListW2lTemplatesError::ServerError);
        },
        _ => {
          warn!("w2l template list query error: {:?}", err);
          return Err(ListW2lTemplatesError::ServerError);
        }
      }
    }
  };

  let templates_for_response = templates.into_iter()
    .map(|template| {
      W2lTemplateRecordForResponse {
        template_token: template.template_token.clone(),
        template_type: template.template_type.clone(),
        creator_user_token: template.creator_user_token.clone(),
        creator_username: template.creator_username.clone(),
        creator_display_name: template.creator_display_name.clone(),
        updatable_slug: template.updatable_slug.clone(),
        title: template.title.clone(),
        frame_width: if template.frame_width > 0 { template.frame_width as u32 } else { 0 },
        frame_height: if template.frame_height  > 0 { template.frame_height as u32 } else { 0 },
        duration_millis: if template.duration_millis > 0 { template.duration_millis as u32 } else { 0 },
        maybe_image_object_name: template.maybe_public_bucket_preview_image_object_name.clone(),
        maybe_video_object_name: template.maybe_public_bucket_preview_video_object_name.clone(),
        created_at: template.created_at.clone(),
        updated_at: template.updated_at.clone(),
      }
    })
    .collect::<Vec<W2lTemplateRecordForResponse>>();

  let response = ListW2lTemplatesSuccessResponse {
    success: true,
    templates: templates_for_response,
  };

  let body = serde_json::to_string(&response)
    .map_err(|e| ListW2lTemplatesError::ServerError)?;

  Ok(HttpResponse::Ok()
    .content_type("application/json")
    .body(body))
}
