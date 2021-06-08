use actix_http::Error;
use actix_http::http::header;
use actix_web::cookie::Cookie;
use actix_web::dev::HttpResponseBuilder;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest};
use crate::database_helpers::enums::{DownloadUrlType, CreatorSetVisibility, W2lTemplateType};
use crate::http_server::web_utils::ip_address::get_request_ip;
use crate::server_state::ServerState;
use crate::util::random_crockford_token::random_crockford_token;
use crate::validations::model_uploads::validate_model_title;
use crate::validations::passwords::validate_passwords;
use crate::validations::username::validate_username;
use derive_more::{Display, Error};
use log::{info, warn, log};
use regex::Regex;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::sync::Arc;
use crate::util::random_prefix_crockford_token::random_prefix_crockford_token;
use crate::validations::check_for_slurs::contains_slurs;

#[derive(Deserialize)]
pub struct UploadW2lTemplateRequest {
  idempotency_token: String,
  title: String,
  download_url: String,
  download_url_type: Option<DownloadUrlType>,
  template_type: Option<W2lTemplateType>,
  creator_set_visibility: Option<CreatorSetVisibility>,
  maybe_subject_token: Option<String>,
  maybe_actor_subject_token: Option<String>,
}

#[derive(Serialize)]
pub struct UploadW2lTemplateSuccessResponse {
  pub success: bool,
  /// This is how frontend clients can request the job execution status.
  pub job_token: String,
}

#[derive(Serialize)]
pub struct ErrorResponse {
  pub success: bool,
  pub error_reason: String,
}

#[derive(Debug, Display)]
pub enum UploadW2lTemplateError {
  BadInput(String),
  MustBeLoggedIn,
  ServerError,
}

impl ResponseError for UploadW2lTemplateError {
  fn status_code(&self) -> StatusCode {
    match *self {
      UploadW2lTemplateError::BadInput(_) => StatusCode::BAD_REQUEST,
      UploadW2lTemplateError::MustBeLoggedIn => StatusCode::UNAUTHORIZED,
      UploadW2lTemplateError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      UploadW2lTemplateError::BadInput(reason) => reason.to_string(),
      UploadW2lTemplateError::MustBeLoggedIn => "user must be logged in".to_string(),
      UploadW2lTemplateError::ServerError => "server error".to_string(),
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

pub async fn upload_w2l_template_handler(
  http_request: HttpRequest,
  request: web::Json<UploadW2lTemplateRequest>,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, UploadW2lTemplateError>
{
  let maybe_user_session = server_state
    .session_checker
    .maybe_get_user_session(&http_request, &server_state.mysql_pool)
    .await
    .map_err(|e| {
      warn!("Session checker error: {:?}", e);
      UploadW2lTemplateError::ServerError
    })?;

  let user_session = match maybe_user_session {
    Some(session) => session,
    None => {
      warn!("not logged in");
      return Err(UploadW2lTemplateError::MustBeLoggedIn);
    }
  };

  if let Err(reason) = validate_idempotency_token(&request.idempotency_token) {
    return Err(UploadW2lTemplateError::BadInput(reason));
  }

  if let Err(reason) = validate_model_title(&request.title) {
    return Err(UploadW2lTemplateError::BadInput(reason));
  }

  if contains_slurs(&request.title) {
    return Err(UploadW2lTemplateError::BadInput("title contains slurs".to_string()));
  }

  let ip_address = get_request_ip(&http_request);

  let uuid = request.idempotency_token.to_string();
  let title = request.title.to_string();
  let download_url = request.download_url.to_string();

  let template_type = "unknown".to_string();
  let download_url_type = "google-drive".to_string();
  let creator_set_visibility = "public".to_string();
  let maybe_subject_token : Option<String> = None;
  let maybe_actor_subject_token : Option<String> = None;

  // This token is returned to the client.
  let job_token = random_prefix_crockford_token("W2L_UP:", 32)
    .map_err(|e| {
      warn!("Error creating token");
      UploadW2lTemplateError::ServerError
    })?;


  let query_result = sqlx::query!(
        r#"
INSERT INTO w2l_template_upload_jobs
SET
  token = ?,
  uuid_idempotency_token = ?,
  creator_user_token = ?,
  creator_ip_address = ?,
  creator_set_visibility = ?,
  title = ?,
  template_type = ?,
  maybe_subject_token = ?,
  maybe_actor_subject_token = ?,
  download_url = ?,
  download_url_type = ?,
  status = "pending"
        "#,
        job_token.to_string(),
        uuid.to_string(),
        user_session.user_token.to_string(),
        ip_address.to_string(),
        creator_set_visibility.to_string(),
        title.to_string(),
        template_type,
        maybe_subject_token,
        maybe_actor_subject_token,
        download_url,
        download_url_type
    )
    .execute(&server_state.mysql_pool)
    .await;

  let record_id = match query_result {
    Ok(res) => {
      res.last_insert_id()
    },
    Err(err) => {
      warn!("New w2l template upload creation DB error: {:?}", err);

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
      return Err(UploadW2lTemplateError::ServerError);
    }
  };

  info!("new w2l template upload job id: {}", record_id);

  server_state.firehose_publisher.enqueue_w2l_template_upload(&user_session.user_token, &job_token)
    .await
    .map_err(|e| {
      warn!("error publishing event: {:?}", e);
      UploadW2lTemplateError::ServerError
    })?;

  let response = UploadW2lTemplateSuccessResponse {
    success: true,
    job_token: job_token.to_string(),
  };

  let body = serde_json::to_string(&response)
    .map_err(|e| UploadW2lTemplateError::ServerError)?;

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
