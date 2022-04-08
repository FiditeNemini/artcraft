use actix_http::Error;
use actix_http::http::header;
use actix_web::HttpResponseBuilder;
use actix_web::cookie::Cookie;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest};
use crate::http_server::endpoints::investor_demo::demo_cookie::request_has_demo_cookie;
use crate::http_server::web_utils::ip_address::get_request_ip;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::server_state::ServerState;
use crate::validations::model_uploads::validate_model_title;
use crate::validations::passwords::validate_passwords;
use crate::validations::username::validate_username;
use database_queries::column_types::record_visibility::RecordVisibility;
use database_queries::tokens::Tokens;
use log::{info, warn, log};
use r2d2_redis::redis::Commands;
use redis_common::redis_keys::RedisKeys;
use regex::Regex;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::fmt;
use std::sync::Arc;
use tts_common::priority::{FAKEYOU_LOGGED_IN_PRIORITY_LEVEL, FAKEYOU_ANONYMOUS_PRIORITY_LEVEL, FAKEYOU_INVESTOR_PRIORITY_LEVEL};
use user_input_common::check_for_slurs::contains_slurs;

// TODO: Temporary for investor demo
const STORYTELLER_DEMO_COOKIE_NAME : &'static str = "storyteller_demo";

#[derive(Deserialize)]
pub struct InferTtsRequest {
  uuid_idempotency_token: String,
  tts_model_token: String,
  inference_text: String,
  creator_set_visibility: Option<RecordVisibility>,
  is_storyteller_demo: Option<bool>,
}

#[derive(Serialize)]
pub struct InferTtsSuccessResponse {
  pub success: bool,
  pub inference_job_token: String,
}

#[derive(Debug)]
pub enum InferTtsError {
  BadInput(String),
  NotAuthorized,
  ServerError,
  RateLimited,
}

impl ResponseError for InferTtsError {
  fn status_code(&self) -> StatusCode {
    match *self {
      InferTtsError::BadInput(_) => StatusCode::BAD_REQUEST,
      InferTtsError::NotAuthorized => StatusCode::UNAUTHORIZED,
      InferTtsError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
      InferTtsError::RateLimited => StatusCode::TOO_MANY_REQUESTS,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      InferTtsError::BadInput(reason) => reason.to_string(),
      InferTtsError::NotAuthorized => "unauthorized".to_string(),
      InferTtsError::ServerError => "server error".to_string(),
      InferTtsError::RateLimited => "rate limited".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for InferTtsError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
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

  // ==================== PRIORITY ==================== //

  // Give logged in users execution priority.
  let mut priority_level = if maybe_user_session.is_some() {
    FAKEYOU_LOGGED_IN_PRIORITY_LEVEL
  } else {
    FAKEYOU_ANONYMOUS_PRIORITY_LEVEL
  };

  // TODO/TEMP: Give investors even more priority
  let mut is_investor = false;

  // TODO/TEMP: The storyteller.io website's AJAX calls will set this.
  //  This is just for the YCombinator demo.
  match request.is_storyteller_demo {
    Some(true) => {
      is_investor = true;
    },
    _ => {},
  };

  // TODO/TEMP: The storyteller.io website will redirect and establish this cookie.
  //  This is just for the YCombinator demo.
  if request_has_demo_cookie(&http_request) {
    is_investor = true;
  }

  if is_investor {
    priority_level = FAKEYOU_INVESTOR_PRIORITY_LEVEL;
  }

  // ==================== RATE LIMIT ==================== //

  let mut rate_limiter = match maybe_user_session {
    None => &server_state.redis_rate_limiters.logged_out,
    Some(ref user) => {
      if user.is_banned {
        return Err(InferTtsError::NotAuthorized);
      }
      &server_state.redis_rate_limiters.logged_in
    },
  };

  // TODO/TEMP
  if is_investor {
    rate_limiter = &server_state.redis_rate_limiters.logged_in;
  }

  if let Err(_err) = rate_limiter.rate_limit_request(&http_request) {
    return Err(InferTtsError::RateLimited);
  }

  // ==================== CHECK AND PERFORM TTS ==================== //

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
  priority_level = ?,
  status = "pending"
        "#,
      &job_token,
      request.uuid_idempotency_token.clone(),
      model_token,
      inference_text,
      maybe_user_token,
      ip_address,
      set_visibility.to_str(),
      priority_level,
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
