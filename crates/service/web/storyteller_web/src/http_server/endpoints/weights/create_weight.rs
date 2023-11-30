use std::collections::HashSet;
use std::sync::Arc;

use actix_multipart::Multipart;
use actix_web::{HttpRequest, HttpResponse, web};
use mysql_queries::queries::model_weights::create_weight::{self, create_weight};
use once_cell::sync::Lazy;

use tokens::tokens::media_uploads::MediaUploadToken;

use crate::http_server::endpoints::media_uploads::common::upload_error::UploadError;
use crate::server_state::ServerState;

use log::{error, info, warn};

use buckets::public::media_uploads::original_file::MediaUploadOriginalFilePath;
use enums::by_table::media_uploads::media_upload_source::MediaUploadSource;
use enums::by_table::media_uploads::media_upload_type::MediaUploadType;
use enums::common::visibility::Visibility;
use hashing::sha256::sha256_hash_bytes::sha256_hash_bytes;
use http_server_common::request::get_request_ip::get_request_ip;
use media::decode_basic_audio_info::decode_basic_audio_bytes_info;
use mimetypes::mimetype_for_bytes::get_mimetype_for_bytes;
use mysql_queries::queries::media_uploads::get_media_upload_by_uuid::get_media_upload_by_uuid_with_connection;
use mysql_queries::queries::media_uploads::insert_media_upload::{Args, insert_media_upload};
use tokens::tokens::media_uploads::MediaUploadToken;

use crate::http_server::endpoints::media_uploads::common::drain_multipart_request::{drain_multipart_request, MediaSource};
use crate::http_server::endpoints::media_uploads::common::upload_error::UploadError;
use crate::server_state::ServerState;
use crate::validations::validate_idempotency_token_format::validate_idempotency_token_format;

#[derive(Serialize)]
pub struct UploadWeightsSuccessResponse {
  pub success: bool,
  pub upload_token: MediaUploadToken,
}

static ALLOWED_MIME_TYPES : Lazy<HashSet<&'static str>> = Lazy::new(|| {
  HashSet::from([
    "binary/octet-stream",
  ])
});

pub async fn upload_weights_handler(
  http_request: HttpRequest,
  server_state: web::Data<Arc<ServerState>>,
  mut multipart_payload: Multipart,
) -> Result<HttpResponse, UploadError> {

  let response = handle_weight_upload(
    &http_request,
    &server_state,
    multipart_payload,
    &ALLOWED_MIME_TYPES).await?;

  let weight_upload_token = response.to_media_token();

  let response: UploadWeightsSuccessResponse = UploadWeightsSuccessResponse {
    success: true,
    upload_token: weight_upload_token,
  };

  let body = serde_json::to_string(&response)
      .map_err(|e| UploadError::ServerError)?;

  return Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body));
}


pub enum SuccessCase {
  WeightAlreadyUploaded {
    existing_upload_token: WeightUploadToken,
  },
  WeightSuccessfullyUploaded {
    upload_token: WeightUploadToken,
  }
}

impl SuccessCase {
  pub fn to_media_token(self) -> WeightUploadToken {
    match self {
      SuccessCase::WeightAlreadyUploaded { existing_upload_token } => existing_upload_token,
      SuccessCase::WeightSuccessfullyUploaded { upload_token } => upload_token,
    }
  }
}

pub async fn handle_weight_upload(
  http_request: &HttpRequest,
  server_state: &web::Data<Arc<ServerState>>,
  mut multipart_payload: Multipart,
  allowed_mimetypes: &HashSet<&'static str>,
) -> Result<SuccessCase, UploadError> {

  let mut mysql_connection = server_state.mysql_pool
      .acquire()
      .await
      .map_err(|err| {
        error!("MySql pool error: {:?}", err);
        UploadError::ServerError
      })?;

  // ==================== READ SESSION ==================== //

  let maybe_user_session = server_state
      .session_checker
      .maybe_get_user_session_from_connection(http_request, &mut mysql_connection)
      .await
      .map_err(|e| {
        error!("Session checker error: {:?}", e);
        UploadError::ServerError
      })?;

  // ==================== RATE LIMIT ==================== //

  let rate_limiter = match maybe_user_session {
    None => &server_state.redis_rate_limiters.logged_out,
    Some(ref user) => {
      if user.is_banned {
        return Err(UploadError::NotAuthorized);
      }
      &server_state.redis_rate_limiters.logged_in
    },
  };

  if let Err(_err) = rate_limiter.rate_limit_request(&http_request) {
    return Err(UploadError::RateLimited);
  }

  if let Err(_err) = server_state.redis_rate_limiters.model_upload.rate_limit_request(&http_request) {
    return Err(UploadError::RateLimited);
  }

  // ==================== READ MULTIPART REQUEST ==================== //

  let upload_weights_request = drain_multipart_request(multipart_payload)
      .await
      .map_err(|e| {
        // TODO: Error handling could be nicer.
        UploadError::BadInput("bad request".to_string())
      })?;

  let uuid_idempotency_token = upload_weights_request.uuid_idempotency_token
      .ok_or(UploadError::BadInput("no uuid".to_string()))?;

  let maybe_existing_upload =
      get_media_upload_by_uuid_with_connection(&uuid_idempotency_token, &mut mysql_connection)
          .await;

  match maybe_existing_upload {
    Err(err) => {
      error!("Error checking for previous upload: {:?}", err);
      return Err(UploadError::ServerError);
    }
    Ok(Some(upload)) => {
      // File already uploaded and frontend didn't protect us.
      return Ok(SuccessCase::WeightAlreadyUploaded {
        existing_upload_token: upload.token,
      });
    }
    Ok(None) => {
      // Proceed.
    }
  }

  if let Err(reason) = validate_idempotency_token_format(&uuid_idempotency_token) {
    return Err(UploadError::BadInput(reason));
  }

  let creator_set_visibility = maybe_user_session
      .as_ref()
      .map(|user_session| user_session.preferred_tts_result_visibility) // TODO: We need a new type of visibility control.
      .unwrap_or(Visibility::default());

  let ip_address = get_request_ip(&http_request);

  let maybe_user_token = maybe_user_session
      .map(|session| session.get_strongly_typed_user_token());

  let maybe_file_size_bytes = upload_weights_request.file_bytes
      .as_ref()
      .map(|bytes| bytes.len());

  info!("Upload maybe filesize: {:?}", maybe_file_size_bytes);

  let maybe_mimetype = upload_weights_request.file_bytes
      .as_ref()
      .map(|bytes| get_mimetype_for_bytes(bytes.as_ref()))
      .flatten();

  let bytes = match upload_weights_request.file_bytes {
    None => return Err(UploadError::BadInput("missing file contents".to_string())),
    Some(bytes) => bytes,
  };

  let hash = sha256_hash_bytes(&bytes)
      .map_err(|io_error| {
        error!("Problem hashing bytes: {:?}", io_error);
        UploadError::ServerError
      })?;

  let file_size_bytes = bytes.len();

  let mut maybe_duration_millis = None;
  let mut maybe_codec_name = None;
  let mut media_upload_type = None;

  if let Some(mimetype) = maybe_mimetype.as_deref() {

    if !allowed_mimetypes.contains(mimetype) {
      // NB: Don't let our error message inject malicious strings
      let filtered_mimetype = mimetype
          .chars()
          .filter(|c| c.is_ascii())
          .filter(|c| c.is_alphanumeric() || *c == '/')
          .collect::<String>();
      return Err(UploadError::BadInput(format!("unpermitted mime type: {}", &filtered_mimetype)));
    }

    // NB: .aiff (audio/aiff) isn't supported by Symphonia:
    //  It contains uncompressed PCM-encoded audio similar to wav.
    //  See: https://github.com/pdeljanov/Symphonia/issues/75
    // NB: The following formats are not supported by Symphonia and
    //  do not have any open issues filed. They may simply be too old:
    //  - .wma (audio/x-ms-wma)
    //  - .avi (video/x-msvideo)
    media_upload_type = match mimetype {
      // Audio
      "audio/aac" /* .aac */ => Some(MediaUploadType::Audio),
      _ => None,
    };

    
  let media_upload_type = match media_upload_type {
    Some(m) => m,
    None => {
      warn!("Invalid mimetype: {:?}", maybe_mimetype);
      return Err(UploadError::BadInput(format!("unknown mimetype: {:?}", maybe_mimetype)))
    },
  };

  // probably don't need this 
  let media_upload_source = match upload_weights_request.media_source {
    MediaSource::Unknown => MediaUploadSource::Unknown,
    MediaSource::UserFile => MediaUploadSource::File,
    MediaSource::UserDeviceApi => MediaUploadSource::DeviceApi,
  };

  // This is fine for now we just don't expose the path!
  let public_upload_path = MediaUploadOriginalFilePath::generate_new();

  info!("Uploading media to bucket path: {}", public_upload_path.get_full_object_path_str());

  // need to upload based on visibility 
  server_state.public_bucket_client.upload_file_with_content_type(
    public_upload_path.get_full_object_path_str(),
    bytes.as_ref(),
    mime_type)
      .await
      .map_err(|e| {
        warn!("Upload media bytes to bucket error: {:?}", e);
        UploadError::ServerError
      })?;

  let token = create_weight(CreateModelWeightsArgs {
    token: &MediaUploadToken::generate(),
    weights_type: media_upload_type,
    weights_category: media_upload_category,
    title: upload_weights_request.file_name.as_deref(),
    maybe_thumbnail_token: None,
    description_markdown: None,
    description_rendered_html: None,
    creator_user_token: maybe_user_token.as_deref(),
    creator_ip_address: &ip_address,
    creator_set_visibility,
    maybe_last_update_user_token: None,
    original_download_url: None,
    original_filename: upload_weights_request.file_name.as_deref(),
    file_size_bytes: file_size_bytes as i32,
    file_checksum_sha2: hash,
    private_bucket_hash: private_bucket_hash,
    maybe_private_bucket_prefix: None,
    maybe_private_bucket_extension: None,
    cached_user_ratings_total_count: 0,
    cached_user_ratings_positive_count: 0,
    cached_user_ratings_negative_count: 0,
    maybe_cached_user_ratings_ratio: None,
    version: 0,
    mysql_pool: &server_state.mysql_pool,
  })
      .await
      .map_err(|err| {
        warn!("New generic download creation DB error: {:?}", err);
        UploadError::ServerError
      })?;
  }).await?;



  let (token, record_id) = insert_media_upload(Args{
    uuid_idempotency_token: &uuid_idempotency_token,
    media_type: media_upload_type,
    media_source: media_upload_source,
    maybe_original_filename: upload_weights_request.file_name.as_deref(),
    original_file_size_bytes: file_size_bytes as u64,
    maybe_original_duration_millis: maybe_duration_millis,
    maybe_original_mime_type: maybe_mimetype,
    maybe_original_audio_encoding: maybe_codec_name.as_deref(),
    maybe_original_video_encoding: None,
    maybe_original_frame_width: None, // TODO
    maybe_original_frame_height: None, // TODO
    checksum_sha2: &hash,
    public_upload_path: &public_upload_path,
    maybe_extra_file_modification_info: None,
    maybe_creator_user_token: maybe_user_token.as_ref(),
    maybe_creator_anonymous_visitor_token: None,
    creator_ip_address: &ip_address,
    creator_set_visibility,
    mysql_pool: &server_state.mysql_pool,
  })
      .await
      .map_err(|err| {
        warn!("New generic download creation DB error: {:?}", err);
        UploadError::ServerError
      })?;

  info!("new media upload id: {} token: {:?}", record_id, &token);

  Ok(SuccessCase::WeightSuccessfullyUploaded {
    upload_token: token,
  })
}
