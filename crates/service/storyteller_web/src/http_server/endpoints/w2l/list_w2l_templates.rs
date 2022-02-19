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
use database_queries::w2l::w2l_templates::list_w2l_templates::{W2lTemplateRecordForList, list_w2l_templates};
use log::{info, warn, log};
use regex::Regex;
use sqlx::MySqlPool;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::fmt;
use std::sync::Arc;

#[derive(Serialize)]
pub struct ListW2lTemplatesSuccessResponse {
  pub success: bool,
  pub templates: Vec<W2lTemplateRecordForList>,
}

#[derive(Debug)]
pub enum ListW2lTemplatesError {
  ServerError,
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

    to_simple_json_error(&error_reason, self.status_code())
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for ListW2lTemplatesError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

pub async fn list_w2l_templates_handler(
  http_request: HttpRequest,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, ListW2lTemplatesError>
{
  let no_scope_creator = None;

  // TODO(bt): Ideally we show users their own W2L templates here before they're mod approved.

  let query_results = list_w2l_templates(
    &server_state.mysql_pool,
    no_scope_creator,
    true,
  ).await;

  let templates = match query_results {
    Ok(results) => results,
    Err(e) => {
      warn!("w2l template list query error: {:?}", e);
      return Err(ListW2lTemplatesError::ServerError);
    }
  };

  let response = ListW2lTemplatesSuccessResponse {
    success: true,
    templates,
  };

  let body = serde_json::to_string(&response)
    .map_err(|e| ListW2lTemplatesError::ServerError)?;

  Ok(HttpResponse::Ok()
    .content_type("application/json")
    .body(body))
}
