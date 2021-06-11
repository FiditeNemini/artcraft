use actix_http::Error;
use actix_http::http::header;
use actix_web::cookie::Cookie;
use actix_web::dev::HttpResponseBuilder;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::{Path, Query};
use actix_web::{Responder, web, HttpResponse, error, HttpRequest, HttpMessage};
use chrono::{DateTime, Utc};
use crate::AnyhowResult;
use crate::common_queries::list_tts_inference_results::TtsInferenceRecordForList;
use crate::common_queries::list_tts_inference_results::list_tts_inference_page;
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
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;

/// For the URL PathInfo
#[derive(Deserialize)]
pub struct ListTtsInferenceResultsForUserPathInfo {
  pub username: String,
}

#[derive(Deserialize)]
pub struct ListTtsInferenceResultsForUserQuery {
  pub sort_ascending: Option<bool>,
  pub limit: Option<u16>,
  pub cursor: Option<String>,
}

#[derive(Serialize)]
pub struct ListTtsInferenceResultsForUserSuccessResponse {
  pub success: bool,
  pub results: Vec<TtsInferenceRecordForList>,
  pub cursor_next: Option<String>,
  pub cursor_previous: Option<String>,
}

#[derive(Debug, Display)]
pub enum ListTtsInferenceResultsForUserError {
  ServerError,
}

impl ResponseError for ListTtsInferenceResultsForUserError {
  fn status_code(&self) -> StatusCode {
    match *self {
      ListTtsInferenceResultsForUserError::ServerError=> StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      ListTtsInferenceResultsForUserError::ServerError => "server error".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

pub async fn list_user_tts_inference_results_handler(
  http_request: HttpRequest,
  path: Path<ListTtsInferenceResultsForUserPathInfo>,
  query: Query<ListTtsInferenceResultsForUserQuery>,
  server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, ListTtsInferenceResultsForUserError>
{
  info!("Fetching inference results for user: {}", &path.username);

  let mod_disabled = false;

  let limit = query.limit.unwrap_or(25);
  let limit = std::cmp::max(limit, 100);

  let cursor = if let Some(cursor) = query.cursor.as_deref() {
    let cursor = server_state.sort_key_crypto.decrypt_id(cursor)
        .map_err(|e| {
          warn!("crypto error: {:?}", e);
          return ListTtsInferenceResultsForUserError::ServerError
        })?;
    Some(cursor)
  } else {
    None
  };

  let query_results = list_tts_inference_page(
    &server_state.mysql_pool,
    Some(path.username.as_ref()),
    false,
    mod_disabled,
    limit,
    cursor,
  ).await;

  let results_page = match query_results {
    Ok(results) => results,
    Err(e) => {
      warn!("Query error: {:?}", e);
      return Err(ListTtsInferenceResultsForUserError::ServerError);
    }
  };

  let cursor_next = if let Some(id) = results_page.last_id {
    let cursor = server_state.sort_key_crypto.encrypt_id(id as u64)
        .map_err(|e| {
          warn!("crypto error: {:?}", e);
          return ListTtsInferenceResultsForUserError::ServerError
        })?;
    Some(cursor)
  } else {
    None
  };

  let cursor_previous = if let Some(id) = results_page.first_id {
    let cursor = server_state.sort_key_crypto.encrypt_id(id as u64)
        .map_err(|e| {
          warn!("crypto error: {:?}", e);
          return ListTtsInferenceResultsForUserError::ServerError
        })?;
    Some(cursor)
  } else {
    None
  };

  let response = ListTtsInferenceResultsForUserSuccessResponse {
    success: true,
    results: results_page.inference_records,
    cursor_next,
    cursor_previous,
  };

  let body = serde_json::to_string(&response)
    .map_err(|e| ListTtsInferenceResultsForUserError::ServerError)?;

  Ok(HttpResponse::Ok()
    .content_type("application/json")
    .body(body))
}
