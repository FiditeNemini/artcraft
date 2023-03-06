use actix_http::Error;
use actix_http::http::header;
use actix_web::HttpResponseBuilder;
use actix_web::cookie::Cookie;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest, HttpMessage};
use chrono::{DateTime, Utc};
use crate::AnyhowResult;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::server_state::ServerState;
use database_queries::queries::public_event_feed::list_public_event_feed_items::list_public_event_feed_items;
use derive_more::{Display, Error};
use log::{info, warn, log, error};
use regex::Regex;
use sqlx::MySqlPool;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::sync::Arc;

#[derive(Serialize)]
pub struct EventRecord {
  pub event_token: String,
  pub event_type: String,
  pub maybe_target_user_token: Option<String>,
  pub maybe_target_username: Option<String>,
  pub maybe_target_display_name: Option<String>,
  pub maybe_target_user_gravatar_hash: Option<String>,
  pub maybe_target_entity_token: Option<String>,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct ListEventsSuccessResponse {
  pub success: bool,
  pub events: Vec<EventRecord>,
}

#[derive(Debug, Display)]
pub enum ListEventsError {
  ServerError,
}

impl ResponseError for ListEventsError {
  fn status_code(&self) -> StatusCode {
    match *self {
      ListEventsError::ServerError=> StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      ListEventsError::ServerError => "server error".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

pub async fn list_events_handler(
  http_request: HttpRequest,
  server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, ListEventsError> {

  // NB: Since this is publicly exposed, we don't query sensitive data.
  let events = list_public_event_feed_items(&server_state.mysql_pool)
      .await
      .map_err(|err| {
        error!("error querying for event feed events: {:?}", err);
        ListEventsError::ServerError
      })?
      .into_iter()
      .map(|event| EventRecord {
        event_token: event.event_token,
        event_type: event.event_type,
        maybe_target_user_token: event.maybe_target_user_token,
        maybe_target_username: event.maybe_target_username,
        maybe_target_display_name: event.maybe_target_display_name,
        maybe_target_user_gravatar_hash: event.maybe_target_user_gravatar_hash,
        maybe_target_entity_token: event.maybe_target_entity_token,
        created_at: event.created_at,
        updated_at: event.updated_at,
      })
      .collect();

  let response = ListEventsSuccessResponse {
    success: true,
    events,
  };

  let body = serde_json::to_string(&response)
    .map_err(|e| ListEventsError::ServerError)?;

  Ok(HttpResponse::Ok()
    .content_type("application/json")
    .body(body))
}
