// NB: Incrementally getting rid of build warnings...
#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::{web, HttpResponse, HttpRequest};
use errors::AnyhowResult;
use crate::http_server::web_utils::serialize_as_json_error::serialize_as_json_error;
use crate::server_state::ServerState;
use mysql_queries::queries::tts::stats::calculate_tts_model_leaderboard::TtsLeaderboardRecordForList;
use mysql_queries::queries::tts::stats::calculate_tts_model_leaderboard::calculate_tts_model_leaderboard;
use mysql_queries::queries::w2l::stats::calculate_w2l_template_leaderboard::W2lLeaderboardRecordForList;
use mysql_queries::queries::w2l::stats::calculate_w2l_template_leaderboard::calculate_w2l_template_leaderboard;
use log::{debug, error, warn};
use sqlx::MySqlPool;
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
  _http_request: HttpRequest,
  server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, LeaderboardErrorResponse> {

  let maybe_cached = server_state.caches.leaderboard.grab_copy_without_bump_if_unexpired()
      .map_err(|e| {
        error!("error consulting cache: {:?}", e);
        LeaderboardErrorResponse::server_error()
      })?;


  let leaderboard_info = match maybe_cached {
    Some(leaderboard) => {
      leaderboard
    }
    None => {
      debug!("populating leaderboard from database");

      let leaderboard_query_result = query_leaderboard(
        &server_state.mysql_pool
      ).await;

      match leaderboard_query_result {
        // If the database misbehaves (eg. DDoS), let's stop spamming it.
        // We'll attempt to read the old value from the cache and keep going.
        Err(err) => {
          warn!("error querying database / inserting into cache: {:?}", err);

          let maybe_cached = server_state.caches.leaderboard.grab_even_expired_and_bump()
              .map_err(|err| {
                error!("error consulting cache (even expired): {:?}", err);
                LeaderboardErrorResponse::server_error()
              })?;

          maybe_cached.ok_or_else(|| {
            error!("error querying database and subsequently reading cache: {:?}", err);
            LeaderboardErrorResponse::server_error()
          })?
        }

        // Happy path...
        Ok(leaderboard_info) => {
          server_state.caches.leaderboard.store_copy(&leaderboard_info)
              .map_err(|e| {
                error!("error storing cache: {:?}", e);
                LeaderboardErrorResponse::server_error()
              })?;

          leaderboard_info
        }
      }
    }
  };

  let response = LeaderboardResponse {
    success: true,
    tts_leaderboard: leaderboard_info.tts_leaderboard,
    w2l_leaderboard: leaderboard_info.w2l_leaderboard,
  };

  let body = serde_json::to_string(&response)
      .map_err(|_e| LeaderboardErrorResponse::server_error())?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}

#[derive(Clone)]
pub struct LeaderboardInfo {
  tts_leaderboard: Vec<TtsLeaderboardRecordForList>,
  w2l_leaderboard: Vec<W2lLeaderboardRecordForList>,
}

async fn query_leaderboard(mysql_pool: &MySqlPool) -> AnyhowResult<LeaderboardInfo> {
  // TODO: There has to be a better way of doing this in parallel.
  //  Some more intelligent DB connection pool. (What did jOOQ in Java do? Surely not this insanity!)
  let mysql_connection_1 = mysql_pool.acquire();
  let mysql_connection_2 = mysql_pool.acquire();

  let mut mysql_connection_1 = mysql_connection_1.await?;
  let mut mysql_connection_2 = mysql_connection_2.await?;

  let maybe_tts_results =
      calculate_tts_model_leaderboard(&mut mysql_connection_1);

  let maybe_w2l_results =
      calculate_w2l_template_leaderboard(&mut mysql_connection_2);

  let tts_results = maybe_tts_results.await?;
  let w2l_results = maybe_w2l_results.await?;

  Ok(LeaderboardInfo {
    tts_leaderboard: tts_results,
    w2l_leaderboard: w2l_results,
  })
}
