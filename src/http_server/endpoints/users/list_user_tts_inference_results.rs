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
use crate::common_queries::list_tts_inference_results::TtsInferenceRecordForList;
use crate::common_queries::list_tts_inference_results::list_tts_inference_results;
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

/// For the URL PathInfo
#[derive(Deserialize)]
pub struct GetProfilePathInfo {
  username: String,
}

#[derive(Serialize)]
pub struct ListTtsInferenceResultsForUserSuccessResponse {
  pub success: bool,
  pub results: Vec<TtsInferenceRecordForList>,
}

#[derive(Serialize)]
pub struct ErrorResponse {
  pub success: bool,
  pub error_reason: String,
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

pub async fn list_user_tts_inference_results_handler(
  http_request: HttpRequest,
  path: Path<GetProfilePathInfo>,
  server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, ListTtsInferenceResultsForUserError>
{
  info!("Fetching inference results for user: {}", &path.username);

  let query_results = list_tts_inference_results(
    &server_state.mysql_pool,
    Some(path.username.as_ref()),
    false
  ).await;

  let results = match query_results {
    Ok(results) => results,
    Err(e) => {
      warn!("Query error: {:?}", e);
      return Err(ListTtsInferenceResultsForUserError::ServerError);
    }
  };

  let response = ListTtsInferenceResultsForUserSuccessResponse {
    success: true,
    results,
  };

  let body = serde_json::to_string(&response)
    .map_err(|e| ListTtsInferenceResultsForUserError::ServerError)?;

  Ok(HttpResponse::Ok()
    .content_type("application/json")
    .body(body))
}
