//use bytes::{Bytes, BytesMut};
use actix_http::http::header;
use actix_multipart::{Multipart, Field};
use actix_web::body::ResponseBody::Body;
use actix_web::dev::HttpResponseBuilder;
use actix_web::http::StatusCode;
use actix_web::http::header::ContentDisposition;
use actix_web::web::{Data, Json, BytesMut};
use actix_web::{middleware, web, App, Error, HttpResponse, HttpServer, HttpRequest, Either, ResponseError};
use anyhow::anyhow;
use crate::buckets::bucket_client::BucketClient;
use crate::buckets::bucket_paths::hash_to_bucket_path;
use crate::http_server::web_utils::ip_address::get_request_ip;
use crate::http_server::web_utils::read_multipart_field_bytes::checked_read_multipart_bytes;
use crate::http_server::web_utils::read_multipart_field_bytes::read_multipart_field_as_boolean;
use crate::http_server::web_utils::read_multipart_field_bytes::read_multipart_field_as_text;
use crate::http_server::web_utils::read_multipart_field_bytes::read_multipart_field_bytes;
use crate::server_state::ServerState;
use crate::util::anyhow_result::AnyhowResult;
use crate::util::random_prefix_crockford_token::random_prefix_crockford_token;
use crate::util::random_crockford_token::random_crockford_token;
use crate::util::random_uuid::generate_random_uuid;
use derive_more::{Display, Error};
use futures::{StreamExt, TryStreamExt};
use log::{warn, info};
use sqlx::MySqlPool;
use sqlx::error::Error::Database;
use std::io::Write;
use std::sync::Arc;
use uuid::Uuid;

const BUCKET_AUDIO_FILE_NAME : &'static str = "input_audio_file";
const BUCKET_IMAGE_FILE_NAME: &'static str = "input_image_file";
const BUCKET_VIDEO_FILE_NAME : &'static str = "input_video_file";

const MIN_BYTES : usize = 10;
const MAX_BYTES : usize = 1024 * 1024 * 20;



/// Just to query for existence
#[derive(Serialize)]
pub struct W2lTemplateExistenceRecord {
  pub template_token: String,
}

#[derive(Serialize)]
pub struct InferW2lWithUploadSuccessResponse {
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
pub enum InferW2lWithUploadError {
  BadInput(String),
  EmptyFileUploaded,
  ServerError,
}

impl ResponseError for InferW2lWithUploadError {
  fn status_code(&self) -> StatusCode {
    match *self {
      InferW2lWithUploadError::BadInput(_) => StatusCode::BAD_REQUEST,
      InferW2lWithUploadError::EmptyFileUploaded => StatusCode::BAD_REQUEST,
      InferW2lWithUploadError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      InferW2lWithUploadError::BadInput(reason) => reason.to_string(),
      InferW2lWithUploadError::EmptyFileUploaded => "empty file uploaded".to_string(),
      InferW2lWithUploadError::ServerError => "server error".to_string(),
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

/// This handles audio uploads w/ W2L templates.
pub async fn enqueue_infer_w2l_with_uploads(
  http_request: HttpRequest,
  server_state: web::Data<Arc<ServerState>>,
  mut payload: Multipart)
  //-> Result<Json<UploadResponse>, HttpResponse>
  -> Result<HttpResponse, InferW2lWithUploadError>
{
  // ==================== TODO: READ IP AND RATE LIMIT ==================== //

  let ip_address = get_request_ip(&http_request);

  // TODO: Check IP address holds
  // TODO: Rate Limiting!
  /*let mut hold_exists = handler_state.redis_client.get_ip_hold(&ip_address)
    .map_err(|err| HttpResponse::InternalServerError()
      .body(format!("Error: {:?}", err)))?;

  match ip_address.as_ref() {
    "127.0.0.1" => {
      warn!("Allowing IP address hold bypass for {}", &ip_address);
      hold_exists = false
    },
    _ => {},
  }

  if hold_exists {
    return Err(HttpResponse::TooManyRequests().body("you already have pending requests").into())
  }*/

  // ==================== READ SESSION ==================== //

  let maybe_session = server_state
    .session_checker
    .maybe_get_session(&http_request, &server_state.mysql_pool)
    .await
    .map_err(|e| {
      warn!("Session checker error: {:?}", e);
      InferW2lWithUploadError::ServerError
    })?;

  let mut maybe_user_token : Option<String> = maybe_session
    .as_ref()
    .map(|user_session| user_session.user_token.to_string());

  info!("Enqueue infer w2l by user token: {:?}", maybe_user_token);

  // ==================== READ MULTIPART REQUEST ==================== //

  info!("Reading multipart request...");

  let mut maybe_uuid_idempotency_token: Option<String> = None;
  let mut maybe_template_token: Option<String> = None;
  let mut maybe_audio_file_name : Option<String> = None;
  let mut audio_bytes = BytesMut::with_capacity(0);

  while let Ok(Some(mut field)) = payload.try_next().await {
    let mut field_name = "".to_string();
    let mut filename = "".to_string();

    if let Some(content_disposition) = field.content_disposition() {
      field_name = content_disposition.get_name()
        .map(|s| s.to_string())
        .unwrap_or("".to_string());
      filename = content_disposition.get_filename()
        .map(|s| s.to_string())
        .unwrap_or("".to_string());
    }

    match field_name.as_ref() {
      "uuid_idempotency_token" => {
        // Form text field.
        maybe_uuid_idempotency_token = read_multipart_field_as_text(&mut field).await
          .map_err(|e| {
            warn!("Error reading idempotency token: {:}", e);
            InferW2lWithUploadError::ServerError
          })?;
      },
      "template_token" => {
        // Form text field.
        maybe_template_token = read_multipart_field_as_text(&mut field).await
          .map_err(|e| {
            warn!("Error reading template token: {:}", e);
            InferW2lWithUploadError::ServerError
          })?;
      },
      "audio" => {
        // Form binary data.
        maybe_audio_file_name = Some(filename.to_string());

        let maybe_bytes = checked_read_multipart_bytes(&mut field).await
          .map_err(|e| {
            warn!("Error reading audio upload: {:}", e);
            InferW2lWithUploadError::ServerError
          })?;

        audio_bytes = match maybe_bytes {
          Some(bytes) => bytes,
          None => {
            warn!("Empty file uploaded");
            return Err(InferW2lWithUploadError::EmptyFileUploaded); // Nothing was uploaded!
          },
        };
      },
      _ => continue,
    }

    info!("Saved file: {}.", &filename);
  }

  // ==================== CHECK REQUEST ==================== //

  let template_token = match &maybe_template_token {
    Some(ref token) => token.to_string(),
    None => {
      return Err(InferW2lWithUploadError::BadInput("No template selected".to_string()));
    }
  };

  let uuid_idempotency_token = match maybe_uuid_idempotency_token {
    Some(token) => token,
    None => {
      return Err(InferW2lWithUploadError::BadInput("No uuid idempotency token".to_string()));
    }
  };

  let exists = check_template_exists(&template_token, &server_state.mysql_pool).await
    .map_err(|e| {
      warn!("error checking tmpl existence : {:?}", e);
      InferW2lWithUploadError::ServerError
    })?;

  if !exists {
    return Err(InferW2lWithUploadError::BadInput("Template does not exist".to_string()));
  }

  // ==================== ANALYZE AND UPLOAD AUDIO FILE ==================== //

  let mut audio_type = "application/octet-stream".to_string();

  if let Some(maybe_type) = infer::get(audio_bytes.as_ref()) {
    audio_type = maybe_type.mime_type().to_string();
  }

  let upload_uuid = generate_random_uuid();

  let audio_upload_bucket_hash = upload_uuid.clone();

  let audio_upload_bucket_path = hash_to_bucket_path(
    &upload_uuid,
    Some(&server_state.audio_uploads_bucket_root)
  ).map_err(|e| {
    warn!("Hash bucket path error: {:?}", e);
    InferW2lWithUploadError::ServerError
  })?;

  info!("Uploading audio to bucket...");
  server_state.private_bucket_client.upload_file_with_content_type(
    &audio_upload_bucket_path,
    audio_bytes.as_ref(),
    &audio_type)
    .await
    .map_err(|e| {
      warn!("Upload audio bytes to bucket error: {:?}", e);
      InferW2lWithUploadError::ServerError
    })?;

  // ==================== SAVE JOB RECORD ==================== //

  // This token is returned to the client.
  let job_token = random_prefix_crockford_token("W2L_INF:", 32)
    .map_err(|e| {
      warn!("Error creating token");
      InferW2lWithUploadError::ServerError
    })?;

  info!("Creating w2l inference job record...");

  let query_result = sqlx::query!(
        r#"
INSERT INTO w2l_inference_jobs
SET
  token = ?,
  uuid_idempotency_token = ?,

  maybe_w2l_template_token = ?,
  maybe_public_audio_bucket_hash = ?,
  maybe_public_audio_bucket_location = ?,

  maybe_original_audio_filename = ?,
  maybe_audio_mime_type = ?,

  maybe_creator_user_token = ?,
  creator_ip_address = ?,
  disable_end_bump = false,
  creator_set_visibility = "public",
  status = "pending"
        "#,
        job_token.to_string(),
        uuid_idempotency_token.to_string(),
        maybe_template_token.clone(),
        Some(audio_upload_bucket_hash.clone()),
        Some(audio_upload_bucket_path.clone()),
        maybe_audio_file_name.clone(),
        Some(audio_type.clone()),
        maybe_user_token.clone(),
        ip_address.to_string()
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
      return Err(InferW2lWithUploadError::ServerError);
    }
  };

  // TODO: IP Address holds.
  //handler_state.redis_client.set_ip_hold(&ip_address)
  //  .map_err(|err| HttpResponse::InternalServerError()
  //    .body(format!("Redis Err: {:?}", err)))?;

  let response = InferW2lWithUploadSuccessResponse {
    success: true,
    job_token: job_token.to_string(),
  };

  let body = serde_json::to_string(&response)
    .map_err(|e| InferW2lWithUploadError::ServerError)?;

  Ok(HttpResponse::Ok()
    .content_type("application/json")
    .body(body))
}

async fn check_template_exists(template_token: &str, mysql_pool: &MySqlPool) -> AnyhowResult<bool>
{
  // NB: Lookup failure is Err(RowNotFound).
  // NB: Since this is publicly exposed, we don't query sensitive data.
  let maybe_template = sqlx::query_as!(
      W2lTemplateExistenceRecord,
        r#"
SELECT
    token as template_token
FROM w2l_templates
WHERE token = ?
AND deleted_at IS NULL
        "#,
      &template_token
    )
    .fetch_one(mysql_pool)
    .await; // TODO: This will return error if it doesn't exist

  let record_exists = match maybe_template {
    Ok(record) => {
      true
    },
    Err(err) => {
      match err {
        RowNotFound => {
          false
        },
        _ => {
          warn!("Infer w2l query error: {:?}", err);
          return Err(anyhow!("infer w2l query error: {:?}", err));
        }
      }
    }
  };

  Ok(record_exists)
}

