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
use crate::util::random_token::random_token;
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

const NEW_USER_ROLE: &'static str = "new-user";

#[derive(Deserialize)]
pub struct InferW2lRequest {
  w2l_template_token: Option<String>,
  tts_inference_result_token: Option<String>,
  creator_set_visibility: Option<CreatorSetVisibility>,
}

#[derive(Serialize)]
pub struct InferW2lSuccessResponse {
  pub success: bool,
}

#[derive(Serialize)]
pub struct ErrorResponse {
  pub success: bool,
  pub error_reason: String,
}

#[derive(Debug, Display)]
pub enum InferW2lError {
  BadInput(String),
  ServerError,
}

impl ResponseError for InferW2lError {
  fn status_code(&self) -> StatusCode {
    match *self {
      InferW2lError::BadInput(_) => StatusCode::BAD_REQUEST,
      InferW2lError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      InferW2lError::BadInput(reason) => reason.to_string(),
      InferW2lError::ServerError => "server error".to_string(),
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

pub async fn infer_w2l_handler(
  http_request: HttpRequest,
  request: web::Json<InferW2lRequest>,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, InferW2lError>
{
  let maybe_user_session = server_state
    .session_checker
    .maybe_get_user_session(&http_request, &server_state.mysql_pool)
    .await
    .map_err(|e| {
      warn!("Session checker error: {:?}", e);
      InferW2lError::ServerError
    })?;

  let mut maybe_user_token : Option<String> = maybe_user_session
    .as_ref()
    .map(|user_session| user_session.user_token.to_string());

  let w2l_template_token = match &request.w2l_template_token {
    None => {
      // TODO: Allow image uploads.
      return Err(InferW2lError::BadInput("w2l token is required".to_string()));
    },
    Some(t) => {
      // TODO: CHECK DATABASE!
      t.to_string()
    },
  };

  let tts_inference_result_token = match &request.tts_inference_result_token {
    None => {
      // TODO: Allow audio uploads.
      return Err(InferW2lError::BadInput("tts token is required".to_string()));
    },
    Some(t) => {
      // TODO: CHECK DATABASE!
      t.to_string()
    },
  };

  let ip_address = get_request_ip(&http_request);
  let creator_set_visibility = "public".to_string();

  let query_result = sqlx::query!(
        r#"
INSERT INTO w2l_inference_jobs
SET
  maybe_w2l_template_token = ?,
  maybe_tts_inference_result_token = ?,
  maybe_public_audio_bucket_location = NULL,
  maybe_public_image_bucket_location = NULL,
  maybe_creator_user_token = ?,
  creator_ip_address = ?,
  creator_set_visibility = ?,
  status = "pending"
        "#,
      w2l_template_token,
      tts_inference_result_token,
      maybe_user_token,
      ip_address,
      creator_set_visibility
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
      return Err(InferW2lError::ServerError);
    }
  };

  info!("new w2l inference job id: {}", record_id);

  let response = InferW2lSuccessResponse {
    success: true,
  };

  let body = serde_json::to_string(&response)
    .map_err(|e| InferW2lError::ServerError)?;

  Ok(HttpResponse::Ok()
    .content_type("application/json")
    .body(body))
}
