use actix_http::Error;
use actix_http::http::header;
use actix_multipart::Multipart;
use actix_web::HttpResponseBuilder;
use actix_web::cookie::Cookie;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::BytesMut;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest};
use buckets::public::media_uploads::original_file::MediaUploadOriginalFilePath;
use config::bad_urls::is_bad_tts_model_download_url;
use crate::http_server::endpoints::media_uploads::common::drain_multipart_request::drain_multipart_request;
use crate::http_server::endpoints::media_uploads::common::handle_request_preamble::{handle_request_preamble, SuccessCase};
use crate::http_server::endpoints::media_uploads::common::upload_error::UploadError;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::server_state::ServerState;
use crate::validations::model_uploads::validate_model_title;
use crate::validations::validate_idempotency_token_format::validate_idempotency_token_format;
use enums::by_table::media_uploads::media_upload_type::MediaUploadType;
use enums::common::visibility::Visibility;
use hashing::sha256::sha256_hash_bytes::sha256_hash_bytes;
use http_server_common::request::get_request_ip::get_request_ip;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use log::{info, warn, log, error};
use media::decode_basic_audio_info::decode_basic_audio_bytes_info;
use mimetypes::mimetype_for_bytes::get_mimetype_for_bytes;
use mysql_queries::payloads::media_upload_modification_details::MediaUploadModificationDetails;
use mysql_queries::queries::media_uploads::get_media_upload_by_uuid::{get_media_upload_by_uuid, get_media_upload_by_uuid_with_connection};
use mysql_queries::queries::media_uploads::insert_media_upload::{Args, insert_media_upload};
use once_cell::sync::Lazy;
use regex::Regex;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::collections::HashSet;
use std::fmt;
use std::io::{BufReader, Cursor};
use std::sync::Arc;
use symphonia::core::formats::FormatOptions;
use symphonia::core::io::{MediaSourceStream, ReadOnlySource};
use symphonia::core::meta::MetadataOptions;
use symphonia::core::probe::Hint;
use tokens::files::media_upload::MediaUploadToken;

#[derive(Serialize)]
pub struct UploadAudioSuccessResponse {
  pub success: bool,
  pub upload_token: MediaUploadToken,
}

static ALLOWED_MIME_TYPES : Lazy<HashSet<&'static str>> = Lazy::new(|| {
  HashSet::from([
    "audio/aac",
    "audio/m4a",
    "audio/mpeg",
    "audio/ogg",
    "audio/x-flac",
    "audio/x-wav",
  ])
});

pub async fn upload_audio_handler(
  http_request: HttpRequest,
  server_state: web::Data<Arc<ServerState>>,
  mut multipart_payload: Multipart,
) -> Result<HttpResponse, UploadError> {

  let response = handle_request_preamble(
    &http_request,
    &server_state,
    multipart_payload,
    &ALLOWED_MIME_TYPES).await?;

  let media_upload_token = response.to_media_token();

  let response = UploadAudioSuccessResponse {
    success: true,
    upload_token: media_upload_token,
  };

  let body = serde_json::to_string(&response)
      .map_err(|e| UploadError::ServerError)?;

  return Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body));
}
