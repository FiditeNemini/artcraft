use actix_http::Error;
use actix_http::http::header;
use actix_multipart::Multipart;
use actix_web::HttpResponseBuilder;
use actix_web::cookie::Cookie;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest};
use config::bad_urls::is_bad_tts_model_download_url;
use crate::http_server::endpoints::media_uploads::drain_multipart_request::drain_multipart_request;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::server_state::ServerState;
use crate::validations::model_uploads::validate_model_title;
use crate::validations::validate_idempotency_token_format::validate_idempotency_token_format;
use database_queries::column_types::record_visibility::RecordVisibility;
use database_queries::queries::media_uploads::insert_media_upload::{Args, insert_media_upload};
use database_queries::tokens::Tokens;
use http_server_common::request::get_request_ip::get_request_ip;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use log::{info, warn, log};
use regex::Regex;
use reusable_types::db::enums::entity_visibility::EntityVisibility;
use reusable_types::db::enums::generic_download_type::GenericDownloadType;
use reusable_types::db::enums::media_upload_type::MediaUploadType;
use reusable_types::db::payloads::MediaUploadDetails;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::fmt;
use std::sync::Arc;
use tokens::files::media_upload::MediaUploadToken;

#[derive(Serialize)]
pub struct UploadAudioSuccessResponse {
  pub success: bool,
  pub upload_token: MediaUploadToken,
}

#[derive(Debug, Serialize)]
pub enum UploadAudioError {
  BadInput(String),
  NotAuthorized,
  MustBeLoggedIn,
  ServerError,
  RateLimited,
}

impl ResponseError for UploadAudioError {
  fn status_code(&self) -> StatusCode {
    match *self {
      UploadAudioError::BadInput(_) => StatusCode::BAD_REQUEST,
      UploadAudioError::NotAuthorized => StatusCode::UNAUTHORIZED,
      UploadAudioError::MustBeLoggedIn => StatusCode::UNAUTHORIZED,
      UploadAudioError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
      UploadAudioError::RateLimited => StatusCode::TOO_MANY_REQUESTS,
    }
  }

  fn error_response(&self) -> HttpResponse {
    serialize_as_json_error(self)
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for UploadAudioError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

pub async fn upload_audio_handler(
  http_request: HttpRequest,
  server_state: web::Data<Arc<ServerState>>,
  mut multipart_payload: Multipart,
) -> Result<HttpResponse, UploadAudioError> {

  // ==================== READ SESSION ==================== //

  let maybe_user_session = server_state
      .session_checker
      .maybe_get_user_session(&http_request, &server_state.mysql_pool)
      .await
      .map_err(|e| {
        warn!("Session checker error: {:?}", e);
        UploadAudioError::ServerError
      })?;

  // ==================== RATE LIMIT ==================== //

  let rate_limiter = match maybe_user_session {
    None => &server_state.redis_rate_limiters.logged_out,
    Some(ref user) => {
      if user.is_banned {
        return Err(UploadAudioError::NotAuthorized);
      }
      &server_state.redis_rate_limiters.logged_in
    },
  };

  if let Err(_err) = rate_limiter.rate_limit_request(&http_request) {
    return Err(UploadAudioError::RateLimited);
  }

  if let Err(_err) = server_state.redis_rate_limiters.model_upload.rate_limit_request(&http_request) {
    return Err(UploadAudioError::RateLimited);
  }

  // ==================== READ MULTIPART REQUEST ==================== //

  let upload_media_request = drain_multipart_request(multipart_payload)
      .await
      .map_err(|e| {
        // TODO: Error handling could be nicer.
        UploadAudioError::BadInput("bad request".to_string())
      })?;


  let uuid_idempotency_token = upload_media_request.uuid_idempotency_token
      .ok_or(UploadAudioError::BadInput("no uuid".to_string()))?;

  if let Err(reason) = validate_idempotency_token_format(&uuid_idempotency_token) {
    return Err(UploadAudioError::BadInput(reason));
  }

  let creator_set_visibility = maybe_user_session
      .as_ref()
      .map(|user_session| user_session.preferred_tts_result_visibility)
      .unwrap_or(RecordVisibility::Public);

  let ip_address = get_request_ip(&http_request);

  let maybe_user_token = maybe_user_session
      .map(|session| session.get_strongly_typed_user_token());

  let token = MediaUploadToken::generate();

  let record_id = insert_media_upload(Args {
    token: &token,
    uuid_idempotency_token: &uuid_idempotency_token,
    media_type: MediaUploadType::Audio,
    maybe_original_filename: upload_media_request.file_name.as_deref(),
    original_file_size_bytes: 0,
    original_duration_millis: 0,
    maybe_original_mime_type: None,
    maybe_original_audio_encoding: None,
    maybe_original_video_encoding: None,
    maybe_original_frame_width: None,
    maybe_original_frame_height: None,
    checksum_sha2: "",
    public_bucket_directory_full_path: "",
    extra_file_modification_info: MediaUploadDetails {}, // TODO
    maybe_creator_user_token: maybe_user_token.as_ref(),
    maybe_creator_anonymous_visitor_token: None,
    creator_ip_address: &ip_address,
    creator_set_visibility: EntityVisibility::Public, // TODO: Combine these two types.
    maybe_creator_synthetic_id: None,
    mysql_pool: &server_state.mysql_pool,
  })
      .await
      .map_err(|err| {
        warn!("New generic download creation DB error: {:?}", err);
        UploadAudioError::ServerError
      })?;

  info!("new media upload id: {}", record_id);

  server_state.firehose_publisher.publish_media_uploaded(
    maybe_user_token.as_ref(),
    &token)
      .await
      .map_err(|e| {
        warn!("error publishing event: {:?}", e);
        UploadAudioError::ServerError
      })?;

  let response = UploadAudioSuccessResponse {
    success: true,
    upload_token: token,
  };

  let body = serde_json::to_string(&response)
      .map_err(|e| UploadAudioError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
