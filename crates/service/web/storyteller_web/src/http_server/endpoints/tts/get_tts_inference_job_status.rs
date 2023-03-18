use actix_http::Error;
use actix_http::http::header;
use actix_web::HttpResponseBuilder;
use actix_web::cookie::Cookie;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Path;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest, HttpMessage};
use chrono::{DateTime, Utc};
use crate::AnyhowResult;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::server_state::ServerState;
use log::{info, warn, log, error};
use r2d2_redis::RedisConnectionManager;
use r2d2_redis::r2d2::{Pool, PooledConnection};
use r2d2_redis::redis::{Commands, RedisError, RedisResult};
use redis_common::redis_keys::RedisKeys;
use regex::Regex;
use sqlx::MySqlPool;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::borrow::BorrowMut;
use std::fmt;
use std::ops::Deref;
use std::sync::Arc;
use mysql_queries::queries::tts::tts_inference_jobs::get_tts_inference_job_status::get_tts_inference_job_status;

/// For the URL PathInfo
#[derive(Deserialize)]
pub struct GetTtsInferenceStatusPathInfo {
  token: String,
}

#[derive(Serialize)]
pub struct TtsInferenceJobStatusForResponse {
  pub job_token: String,

  /// Primary status from the database (a state machine).
  pub status: String,

  /// Extra, temporary status from Redis.
  /// This can denote inference progress, and the Python code can write to it.
  pub maybe_extra_status_description: Option<String>,

  pub attempt_count: u8,

  pub maybe_result_token: Option<String>,
  pub maybe_public_bucket_wav_audio_path: Option<String>,

  pub model_token: String,
  pub tts_model_type: String,
  pub title: String, // Name of the TTS model

  pub raw_inference_text: String, // User text

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct GetTtsInferenceStatusSuccessResponse {
  pub success: bool,
  pub state: TtsInferenceJobStatusForResponse,
}

#[derive(Debug)]
pub enum GetTtsInferenceStatusError {
  ServerError,
  NotFound,
}

impl ResponseError for GetTtsInferenceStatusError {
  fn status_code(&self) -> StatusCode {
    match *self {
      GetTtsInferenceStatusError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
      GetTtsInferenceStatusError::NotFound => StatusCode::NOT_FOUND,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      Self::ServerError => "server error".to_string(),
      Self::NotFound => "not found".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for GetTtsInferenceStatusError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}


pub async fn get_tts_inference_job_status_handler(
  http_request: HttpRequest,
  path: Path<GetTtsInferenceStatusPathInfo>,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, GetTtsInferenceStatusError>
{
  if path.token.trim() == "None" {
    // NB: A bunch of Python clients use our API and can fail in this manner.
    // This was a large traffic driver during the 2023-03-08 outage.
    return Err(GetTtsInferenceStatusError::NotFound);
  }

  // NB: Lookup failure is Err(RowNotFound).
  // NB: Since this is publicly exposed, we don't query sensitive data.
  let maybe_status = get_tts_inference_job_status(&path.token, &server_state.mysql_pool).await;

  let record = match maybe_status {
    Ok(Some(record)) => record,
    Ok(None) => return Err(GetTtsInferenceStatusError::NotFound),
    Err(err) => {
      error!("tts job query error: {:?}", err);
      return Err(GetTtsInferenceStatusError::ServerError);
    }
  };

  let mut redis = server_state.redis_pool
      .get()
      .map_err(|e| {
        error!("redis error: {:?}", e);
        GetTtsInferenceStatusError::ServerError
      })?;

  let extra_status_key = RedisKeys::tts_inference_extra_status_info(&path.token);
  let maybe_extra_status_description : Option<String> = match redis.get(&extra_status_key) {
    Ok(Some(status)) => {
      Some(status)
    },
    Ok(None) => None,
    Err(e) => {
      error!("redis error: {:?}", e);
      None // Fail open
    },
  };

  let record_for_response = TtsInferenceJobStatusForResponse {
    job_token: record.job_token,
    status: record.status,
    maybe_extra_status_description,
    attempt_count: record.attempt_count as u8,
    maybe_result_token: record.maybe_result_token,
    maybe_public_bucket_wav_audio_path: record.maybe_public_bucket_wav_audio_path,
    model_token: record.model_token,
    tts_model_type: record.tts_model_type,
    title: record.title,
    raw_inference_text: record.raw_inference_text,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };

  let response = GetTtsInferenceStatusSuccessResponse {
    success: true,
    state: record_for_response,
  };

  let body = serde_json::to_string(&response)
      .map_err(|e| {
        error!("error returning response: {:?}",  e);
        GetTtsInferenceStatusError::ServerError
      })?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
