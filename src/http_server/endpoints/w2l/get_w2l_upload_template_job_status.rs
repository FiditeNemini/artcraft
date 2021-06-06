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

/// For the URL PathInfo
#[derive(Deserialize)]
pub struct GetW2lUploadTemplateStatusPathInfo {
  token: String,
}

#[derive(Serialize)]
pub struct W2lUploadTemplateJobStatusForResponse {
  pub job_token: String,

  pub status: String,
  pub maybe_template_token: Option<String>,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct GetW2lUploadTemplateStatusSuccessResponse {
  pub success: bool,
  pub state: W2lUploadTemplateJobStatusForResponse,
}

#[derive(Serialize)]
pub struct ErrorResponse {
  pub success: bool,
  pub error_reason: String,
}

#[derive(Debug, Display)]
pub enum GetW2lUploadTemplateStatusError {
  ServerError,
}

#[derive(Serialize)]
pub struct W2lUploadTemplateJobStatusRecord {
  pub job_token: String,

  pub status: String,
  pub maybe_template_token: Option<String>,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

impl ResponseError for GetW2lUploadTemplateStatusError {
  fn status_code(&self) -> StatusCode {
    match *self {
      GetW2lUploadTemplateStatusError::ServerError=> StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      GetW2lUploadTemplateStatusError::ServerError => "server error".to_string(),
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

pub async fn get_w2l_upload_template_job_status_handler(
  http_request: HttpRequest,
  path: Path<GetW2lUploadTemplateStatusPathInfo>,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, GetW2lUploadTemplateStatusError>
{
  // NB: Lookup failure is Err(RowNotFound).
  // NB: Since this is publicly exposed, we don't query sensitive data.
  let maybe_status = sqlx::query_as!(
      W2lUploadTemplateJobStatusRecord,
        r#"
SELECT
    jobs.token as job_token,

    jobs.status,
    jobs.on_success_result_token as maybe_template_token,

    jobs.created_at,
    jobs.updated_at

FROM w2l_template_upload_jobs as jobs

WHERE jobs.token = ?
        "#,
      &path.token
    )
      .fetch_one(&server_state.mysql_pool)
      .await; // TODO: This will return error if it doesn't exist

  let record : W2lUploadTemplateJobStatusRecord = match maybe_status {
    Ok(record) => record,
    Err(err) => {
      match err {
        RowNotFound => {
          return Err(GetW2lUploadTemplateStatusError::ServerError);
        },
        _ => {
          warn!("w2l template query error: {:?}", err);
          return Err(GetW2lUploadTemplateStatusError::ServerError);
        }
      }
    }
  };

  let template_for_response = W2lUploadTemplateJobStatusForResponse {
    job_token: record.job_token.clone(),
    status: record.status.clone(),
    maybe_template_token: record.maybe_template_token.clone(),
    created_at: record.created_at.clone(),
    updated_at: record.updated_at.clone(),
  };

  let response = GetW2lUploadTemplateStatusSuccessResponse {
    success: true,
    state: template_for_response,
  };

  let body = serde_json::to_string(&response)
      .map_err(|e| GetW2lUploadTemplateStatusError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
