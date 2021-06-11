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
pub struct GetTtsInferenceStatusPathInfo {
  token: String,
}

#[derive(Serialize)]
pub struct TtsInferenceJobStatusForResponse {
  pub job_token: String,

  pub status: String,
  pub attempt_count: u8,

  pub maybe_result_token: Option<String>,
  pub maybe_public_bucket_wav_audio_path: Option<String>,

  pub model_token: String,
  pub tts_model_type: String,
  pub title: String,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct GetTtsInferenceStatusSuccessResponse {
  pub success: bool,
  pub state: TtsInferenceJobStatusForResponse,
}

#[derive(Debug, Display)]
pub enum GetTtsInferenceStatusError {
  ServerError,
}

#[derive(Serialize)]
pub struct TtsInferenceJobStatusRecord {
  pub job_token: String,

  pub status: String,
  pub attempt_count: i32,

  pub maybe_result_token: Option<String>,
  pub maybe_public_bucket_wav_audio_path: Option<String>,

  pub model_token: String,
  pub tts_model_type: String,

  pub title: String,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

impl ResponseError for GetTtsInferenceStatusError {
  fn status_code(&self) -> StatusCode {
    match *self {
      GetTtsInferenceStatusError::ServerError=> StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      GetTtsInferenceStatusError::ServerError => "server error".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

pub async fn get_tts_inference_job_status_handler(
  http_request: HttpRequest,
  path: Path<GetTtsInferenceStatusPathInfo>,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, GetTtsInferenceStatusError>
{
  // NB: Lookup failure is Err(RowNotFound).
  // NB: Since this is publicly exposed, we don't query sensitive data.
  let maybe_status = sqlx::query_as!(
      TtsInferenceJobStatusRecord,
        r#"
SELECT
    jobs.token as job_token,

    jobs.status,
    jobs.attempt_count,
    jobs.on_success_result_token as maybe_result_token,
    results.public_bucket_wav_audio_path as maybe_public_bucket_wav_audio_path,

    jobs.model_token,
    tts.tts_model_type,
    tts.title,

    jobs.created_at,
    jobs.updated_at

FROM tts_inference_jobs as jobs
JOIN tts_models as tts
    ON tts.token = jobs.model_token
LEFT OUTER JOIN tts_results as results
    ON jobs.on_success_result_token = results.token

WHERE jobs.token = ?
        "#,
      &path.token
    )
      .fetch_one(&server_state.mysql_pool)
      .await; // TODO: This will return error if it doesn't exist

  let record : TtsInferenceJobStatusRecord = match maybe_status {
    Ok(record) => record,
    Err(err) => {
      match err {
        RowNotFound => {
          return Err(GetTtsInferenceStatusError::ServerError);
        },
        _ => {
          warn!("tts template query error: {:?}", err);
          return Err(GetTtsInferenceStatusError::ServerError);
        }
      }
    }
  };

  let model_for_response = TtsInferenceJobStatusForResponse {
    job_token: record.job_token.clone(),
    status: record.status.clone(),
    attempt_count: record.attempt_count as u8,
    maybe_result_token: record.maybe_result_token.clone(),
    maybe_public_bucket_wav_audio_path: record.maybe_public_bucket_wav_audio_path.clone(),
    model_token: record.model_token.clone(),
    tts_model_type: record.tts_model_type.clone(),
    title: record.title.clone(),
    created_at: record.created_at.clone(),
    updated_at: record.updated_at.clone(),
  };

  let response = GetTtsInferenceStatusSuccessResponse {
    success: true,
    state: model_for_response,
  };

  let body = serde_json::to_string(&response)
      .map_err(|e| GetTtsInferenceStatusError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
