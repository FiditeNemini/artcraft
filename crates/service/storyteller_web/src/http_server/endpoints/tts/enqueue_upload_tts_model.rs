use actix_http::Error;
use actix_http::http::header;
use actix_web::HttpResponseBuilder;
use actix_web::cookie::Cookie;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest};
use crate::http_server::web_utils::ip_address::get_request_ip;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::server_state::ServerState;
use crate::validations::model_uploads::validate_model_title;
use crate::validations::passwords::validate_passwords;
use crate::validations::username::validate_username;
use database_queries::tokens::Tokens;
use log::{info, warn, log};
use regex::Regex;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::fmt;
use std::sync::Arc;

#[derive(Deserialize)]
pub enum TtsModelType {
  /// tacotron2
  Tacotron2,
  /// glowtts
  GlowTts,
  /// glowtts-vocodes
  GlowTts_Vocodes,
  /// talknet
  Talknet,
}

#[deprecated(note = "Use `RecordVisibility` instead!")]
#[derive(Deserialize)]
pub enum CreatorSetVisibility {
  /// public
  Public,
  /// hidden
  Hidden,
  /// private
  Private,
}

#[derive(Deserialize)]
pub struct UploadTtsModelRequest {
  idempotency_token: String,
  title: String,
  download_url: String,
  tts_model_type: Option<TtsModelType>,
  creator_set_visibility: Option<CreatorSetVisibility>,
}

#[derive(Serialize)]
pub struct UploadTtsModelSuccessResponse {
  pub success: bool,
  /// This is how frontend clients can request the job execution status.
  pub job_token: String,
}

#[derive(Debug)]
pub enum UploadTtsModelError {
  BadInput(String),
  MustBeLoggedIn,
  ServerError,
  RateLimited,
}

impl ResponseError for UploadTtsModelError {
  fn status_code(&self) -> StatusCode {
    match *self {
      UploadTtsModelError::BadInput(_) => StatusCode::BAD_REQUEST,
      UploadTtsModelError::MustBeLoggedIn => StatusCode::UNAUTHORIZED,
      UploadTtsModelError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
      UploadTtsModelError::RateLimited => StatusCode::TOO_MANY_REQUESTS,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      UploadTtsModelError::BadInput(reason) => reason.to_string(),
      UploadTtsModelError::MustBeLoggedIn => "user must be logged in".to_string(),
      UploadTtsModelError::ServerError => "server error".to_string(),
      UploadTtsModelError::RateLimited => "rate limited".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for UploadTtsModelError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

pub async fn upload_tts_model_handler(
  http_request: HttpRequest,
  request: web::Json<UploadTtsModelRequest>,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, UploadTtsModelError>
{
  if let Err(_err) = server_state.redis_rate_limiters.model_upload.rate_limit_request(&http_request) {
    return Err(UploadTtsModelError::RateLimited);
  }

  let maybe_user_session = server_state
    .session_checker
    .maybe_get_user_session(&http_request, &server_state.mysql_pool)
    .await
    .map_err(|e| {
      warn!("Session checker error: {:?}", e);
      UploadTtsModelError::ServerError
    })?;

  let user_session = match maybe_user_session {
    Some(session) => session,
    None => {
      warn!("not logged in");
      return Err(UploadTtsModelError::MustBeLoggedIn);
    }
  };

  if let Err(reason) = validate_idempotency_token(&request.idempotency_token) {
    return Err(UploadTtsModelError::BadInput(reason));
  }

  if let Err(reason) = validate_model_title(&request.title) {
    return Err(UploadTtsModelError::BadInput(reason));
  }

  let ip_address = get_request_ip(&http_request);

  let uuid = request.idempotency_token.to_string();
  let title = request.title.to_string();
  let download_url = request.download_url.to_string();

  let tts_model_type = "tacotron2".to_string();
  let creator_set_visibility = "public".to_string();

  // This token is returned to the client.
  let job_token = Tokens::new_tts_model_upload_job()
    .map_err(|e| {
      warn!("Error creating token");
      UploadTtsModelError::ServerError
    })?;

  let query_result = sqlx::query!(
        r#"
INSERT INTO tts_model_upload_jobs
SET
  token = ?,
  uuid_idempotency_token = ?,
  creator_user_token = ?,
  creator_ip_address = ?,
  creator_set_visibility = ?,
  title = ?,
  tts_model_type = ?,
  download_url = ?,
  status = "pending"
        "#,
        job_token.to_string(),
        uuid.to_string(),
        user_session.user_token.to_string(),
        ip_address.to_string(),
        creator_set_visibility.to_string(),
        title.to_string(),
        tts_model_type,
        download_url,
    )
    .execute(&server_state.mysql_pool)
    .await;

  let record_id = match query_result {
    Ok(res) => {
      res.last_insert_id()
    },
    Err(err) => {
      warn!("New tts model upload creation DB error: {:?}", err);

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
      return Err(UploadTtsModelError::ServerError);
    }
  };

  info!("new model upload job id: {}", record_id);

  server_state.firehose_publisher.enqueue_tts_model_upload(&user_session.user_token, &job_token)
      .await
      .map_err(|e| {
        warn!("error publishing event: {:?}", e);
        UploadTtsModelError::ServerError
      })?;

  let response = UploadTtsModelSuccessResponse {
    success: true,
    job_token: job_token.to_string(),
  };

  let body = serde_json::to_string(&response)
    .map_err(|e| UploadTtsModelError::ServerError)?;

  Ok(HttpResponse::Ok()
    .content_type("application/json")
    .body(body))
}

fn validate_idempotency_token(token: &str) -> Result<(), String> {
  if token.len() != 36 {
    return Err("idempotency token should be 36 characters".to_string());
  }

  Ok(())
}
