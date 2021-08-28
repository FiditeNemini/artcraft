use actix_http::Error;
use actix_http::http::header;
use actix_web::cookie::Cookie;
use actix_web::dev::HttpResponseBuilder;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest};
use crate::database::enums::record_visibility::RecordVisibility;
use crate::database::helpers::enums::{DownloadUrlType, W2lTemplateType};
use crate::database::helpers::tokens::Tokens;
use crate::http_server::web_utils::ip_address::get_request_ip;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::server_state::ServerState;
use crate::util::random_prefix_crockford_token::random_prefix_crockford_token;
use crate::util::redis::redis_keys::RedisKeys;
use crate::validations::check_for_slurs::contains_slurs;
use crate::validations::model_uploads::validate_model_title;
use crate::validations::passwords::validate_passwords;
use crate::validations::username::validate_username;
use derive_more::{Display, Error};
use log::{info, warn, log};
use r2d2_redis::redis::Commands;
use regex::Regex;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::sync::Arc;

#[derive(Deserialize)]
pub struct InferTtsRequest {
  uuid_idempotency_token: String,
  tts_model_token: String,
  inference_text: String,
  creator_set_visibility: Option<RecordVisibility>,
}

#[derive(Serialize)]
pub struct InferTtsSuccessResponse {
  pub success: bool,
  pub inference_job_token: String,
}

#[derive(Debug, Display)]
pub enum InferTtsError {
  BadInput(String),
  ServerError,
}

impl ResponseError for InferTtsError {
  fn status_code(&self) -> StatusCode {
    match *self {
      InferTtsError::BadInput(_) => StatusCode::BAD_REQUEST,
      InferTtsError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      InferTtsError::BadInput(reason) => reason.to_string(),
      InferTtsError::ServerError => "server error".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

pub async fn infer_tts_handler(
  http_request: HttpRequest,
  request: web::Json<InferTtsRequest>,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, InferTtsError>
{
  let maybe_user_session = server_state
    .session_checker
    .maybe_get_user_session(&http_request, &server_state.mysql_pool)
    .await
    .map_err(|e| {
      warn!("Session checker error: {:?}", e);
      InferTtsError::ServerError
    })?;

  let mut maybe_user_token : Option<String> = maybe_user_session
    .as_ref()
    .map(|user_session| user_session.user_token.to_string());

  let inference_text = &request.inference_text.trim().to_string();

  if let Err(reason) = validate_inference_text(&inference_text) {
    return Err(InferTtsError::BadInput(reason));
  }

  if contains_slurs(&inference_text) {
    return Err(InferTtsError::BadInput("text contains slurs".to_string()));
  }

  // TODO(bt): CHECK DATABASE!
  let model_token = request.tts_model_token.to_string();

  let mut redis = server_state.redis_pool
      .get()
      .map_err(|e| {
        warn!("redis error: {:?}", e);
        InferTtsError::ServerError
      })?;

  let redis_count_key = RedisKeys::tts_model_usage_count(&model_token);

  redis.incr(&redis_count_key, 1)
      .map_err(|e| {
        warn!("redis error: {:?}", e);
        InferTtsError::ServerError
      })?;

  let ip_address = get_request_ip(&http_request);

  let maybe_user_preferred_visibility : Option<RecordVisibility> = maybe_user_session
      .as_ref()
      .map(|user_session| user_session.preferred_tts_result_visibility);

  let set_visibility = request.creator_set_visibility
      .or(maybe_user_preferred_visibility)
      .unwrap_or(RecordVisibility::Public);

  // This token is returned to the client.
  let job_token = Tokens::new_tts_inference_job()
      .map_err(|e| {
        warn!("Error creating token");
        InferTtsError::ServerError
      })?;

  info!("Creating w2l inference job record...");

  let query_result = sqlx::query!(
        r#"
INSERT INTO tts_inference_jobs
SET
  token = ?,
  uuid_idempotency_token = ?,

  model_token = ?,
  raw_inference_text = ?,
  maybe_creator_user_token = ?,
  creator_ip_address = ?,
  creator_set_visibility = ?,
  status = "pending"
        "#,
      &job_token,
      request.uuid_idempotency_token.clone(),
      model_token,
      inference_text,
      maybe_user_token,
      ip_address,
      set_visibility.to_str(),
    )
    .execute(&server_state.mysql_pool)
    .await;

  let record_id = match query_result {
    Ok(res) => {
      res.last_insert_id()
    },
    Err(err) => {
      warn!("New w2l inference job creation DB error: {:?}", err);

      // NB: SQLSTATE[23000]: Integrity constraint violation
      // NB: MySQL Error Code 1062: Duplicate key insertion (this is harder to access)
      match err {
        Database(err) => {
          let maybe_code = err.code().map(|c| c.into_owned());
          /*match maybe_code.as_deref() {
            Some("23000") => {
              if err.message().contains("username") {
                return Err(UsernameTaken);
              } else if err.message().contains("email_address") {
                return Err(EmailTaken);
              }
            }
            _ => {},
          }*/
        },
        _ => {},
      }
      return Err(InferTtsError::ServerError);
    }
  };

  info!("new w2l inference job id: {}", record_id);

  server_state.firehose_publisher.enqueue_tts_inference(maybe_user_token.as_deref(), &job_token, &model_token)
      .await
      .map_err(|e| {
        warn!("error publishing event: {:?}", e);
        InferTtsError::ServerError
      })?;

  let response = InferTtsSuccessResponse {
    success: true,
    inference_job_token: job_token.to_string(),
  };

  let body = serde_json::to_string(&response)
    .map_err(|e| InferTtsError::ServerError)?;

  Ok(HttpResponse::Ok()
    .content_type("application/json")
    .body(body))
}

pub fn validate_inference_text(text: &str) -> Result<(), String> {
  if text.len() < 3 {
    return Err("text is too short".to_string());
  }

  if text.len() > 1024 {
    return Err("text is too long".to_string());
  }

  Ok(())
}
