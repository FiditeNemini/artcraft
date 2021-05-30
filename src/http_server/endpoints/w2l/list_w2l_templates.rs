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
use crate::common_queries::list_w2l_templates::{list_w2l_templates, W2lTemplateRecordForList};

#[derive(Serialize)]
pub struct ListW2lTemplatesSuccessResponse {
  pub success: bool,
  pub templates: Vec<W2lTemplateRecordForList>,
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
  let scope_creator = None;
  let query_results = list_w2l_templates(
    &server_state.mysql_pool,
    scope_creator,
    false,
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
