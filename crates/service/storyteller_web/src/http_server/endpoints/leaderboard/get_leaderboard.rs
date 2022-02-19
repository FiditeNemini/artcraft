use actix_http::Error;
use actix_http::http::header;
use actix_web::HttpResponseBuilder;
use actix_web::cookie::Cookie;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest, HttpMessage};
use chrono::{DateTime, Utc};
use crate::database::queries::calculate_w2l_template_leaderboard::W2lLeaderboardRecordForList;
use crate::database::queries::calculate_w2l_template_leaderboard::calculate_w2l_template_leaderboard;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::http_server::web_utils::serialize_as_json_error::serialize_as_json_error;
use crate::server_state::ServerState;
use database_queries::tts::stats::calculate_tts_model_leaderboard::TtsLeaderboardRecordForList;
use database_queries::tts::stats::calculate_tts_model_leaderboard::calculate_tts_model_leaderboard;
use log::{info, warn, log};
use regex::Regex;
use sqlx::MySqlPool;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::fmt;
use std::sync::Arc;

#[derive(Serialize)]
pub struct LeaderboardResponse {
  success: bool,
  tts_leaderboard: Vec<TtsLeaderboardRecordForList>,
  w2l_leaderboard: Vec<W2lLeaderboardRecordForList>,
}

#[derive(Serialize, Debug)]
pub struct LeaderboardErrorResponse {
  pub success: bool,
  pub error_type: LeaderboardErrorType,
  pub error_message: String,
}

#[derive(Copy, Clone, Debug, Serialize)]
pub enum LeaderboardErrorType {
  ServerError,
}

impl LeaderboardErrorResponse {
  fn server_error() -> Self {
    Self {
      success: false,
      error_type: LeaderboardErrorType::ServerError,
      error_message: "server error".to_string()
    }
  }
}

impl ResponseError for LeaderboardErrorResponse {
  fn status_code(&self) -> StatusCode {
    match self.error_type {
      LeaderboardErrorType::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    serialize_as_json_error(self)
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for LeaderboardErrorResponse {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self.error_type)
  }
}

pub async fn leaderboard_handler(
  http_request: HttpRequest,
  server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, LeaderboardErrorResponse> {

  let maybe_tts_results =
      calculate_tts_model_leaderboard(&server_state.mysql_pool);

  let maybe_w2l_results =
      calculate_w2l_template_leaderboard(&server_state.mysql_pool);

  let tts_results = match maybe_tts_results.await {
    Ok(results) => results,
    Err(e) => {
      warn!("Query error: {:?}", e);
      return Err(LeaderboardErrorResponse::server_error());
    }
  };

  let w2l_results = match maybe_w2l_results.await {
    Ok(results) => results,
    Err(e) => {
      warn!("Query error: {:?}", e);
      return Err(LeaderboardErrorResponse::server_error());
    }
  };

  let response = LeaderboardResponse {
    success: true,
    tts_leaderboard: tts_results,
    w2l_leaderboard: w2l_results,
  };

  let body = serde_json::to_string(&response)
      .map_err(|e| LeaderboardErrorResponse::server_error())?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
