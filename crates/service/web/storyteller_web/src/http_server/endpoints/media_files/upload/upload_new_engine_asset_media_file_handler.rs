use std::collections::HashSet;
use std::io::{BufReader, Cursor, Read};
use std::path::PathBuf;
use std::sync::Arc;
use actix_multipart::form::MultipartForm;
use actix_multipart::form::tempfile::TempFile;
use actix_multipart::form::text::Text;

use actix_multipart::Multipart;
use actix_web::{HttpRequest, HttpResponse, web};
use log::{error, info, warn};
use once_cell::sync::Lazy;
use utoipa::ToSchema;

use buckets::public::media_files::bucket_file_path::MediaFileBucketPath;
use enums::by_table::media_files::media_file_animation_type::MediaFileAnimationType;
use enums::by_table::media_files::media_file_class::MediaFileClass;
use enums::by_table::media_files::media_file_engine_category::MediaFileEngineCategory;
use enums::by_table::media_files::media_file_type::MediaFileType;
use enums::common::visibility::Visibility;
use hashing::sha256::sha256_hash_bytes::sha256_hash_bytes;
use http_server_common::request::get_request_ip::get_request_ip;
use mimetypes::mimetype_for_bytes::get_mimetype_for_bytes;
use mimetypes::mimetype_to_extension::mimetype_to_extension;
use mysql_queries::queries::idepotency_tokens::insert_idempotency_token::insert_idempotency_token;
use mysql_queries::queries::media_files::create::insert_media_file_from_file_upload::{insert_media_file_from_file_upload, InsertMediaFileFromUploadArgs, UploadType};
use tokens::tokens::media_files::MediaFileToken;
use videos::get_mp4_info::{get_mp4_info, get_mp4_info_for_bytes, get_mp4_info_for_bytes_and_len};

use crate::http_server::endpoints::media_files::upload::upload_engine_asset::drain_multipart_request::drain_multipart_request;
use crate::http_server::endpoints::media_files::upload::upload_error::MediaFileUploadError;
use crate::http_server::endpoints::media_files::upload::upload_new_scene_media_file_handler::UploadNewSceneMediaFileForm;
use crate::server_state::ServerState;
use crate::validations::validate_idempotency_token_format::validate_idempotency_token_format;

/// PLEASE SEE BOTTOM OF PAGE `UploadNewEngineAssetFileForm` FOR DETAILS ON FIELDS AND NULLABILITY.
#[derive(MultipartForm, ToSchema)]
#[multipart(duplicate_field = "deny")]
pub struct UploadNewEngineAssetFileForm {
  /// UUID for request idempotency
  #[multipart(limit = "2 KiB")]
  #[schema(value_type = String, format = Binary)]
  uuid_idempotency_token: Text<String>,

  // TODO: is MultipartBytes better than TempFile ?
  /// The uploaded file
  #[multipart(limit = "512 MiB")]
  #[schema(value_type = Vec<u8>, format = Binary)]
  file: TempFile,

  /// The category of engine asset: character, animation, etc.
  /// See the documentation on `MediaFileEngineCategory`.
  #[multipart(limit = "2 KiB")]
  #[schema(value_type = String, format = Binary)]
  engine_category: Text<MediaFileEngineCategory>,

  /// Optional: Title (name) of the scene
  #[multipart(limit = "2 KiB")]
  #[schema(value_type = Option<String>, format = Binary)]
  maybe_title: Option<Text<String>>,

  /// Optional: Visibility of the scene
  #[multipart(limit = "2 KiB")]
  #[schema(value_type = Option<String>, format = Binary)]
  maybe_visibility: Option<Text<Visibility>>,

  /// Optional: the type of animation (if this is a character or animation)
  /// See the documentation on `MediaFileAnimationType`.
  #[multipart(limit = "2 KiB")]
  #[schema(value_type = Option<String>, format = Binary)]
  maybe_animation_type: Option<Text<MediaFileAnimationType>>,
}

#[derive(Serialize, ToSchema)]
pub struct UploadNewEngineAssetSuccessResponse {
  pub success: bool,
  pub media_file_token: MediaFileToken,
}

/// Upload an engine asset: character, animation, etc. Just don't use this for scenes.
/// 
/// This is for new assets. You can't update existing assets with this endpoint.
///
/// Be careful to set the correct `engine_category` and `maybe_animation_type` (if needed) fields!
#[utoipa::path(
  post,
  tag = "Media Files",
  path = "/v1/media_files/upload/new_engine_asset",
  responses(
    (status = 200, description = "Success Update", body = UploadNewEngineAssetSuccessResponse),
    (status = 400, description = "Bad input", body = MediaFileUploadError),
    (status = 401, description = "Not authorized", body = MediaFileUploadError),
    (status = 429, description = "Too many requests", body = MediaFileUploadError),
    (status = 500, description = "Server error", body = MediaFileUploadError),
  ),
  params(
    (
      "request" = UploadNewEngineAssetFileForm,
      description = "PLEASE SEE BOTTOM OF PAGE `UploadNewEngineAssetFileForm` FOR DETAILS ON FIELDS AND NULLABILITY."
    ),
  )
)]
pub async fn upload_new_engine_asset_media_file_handler(
  http_request: HttpRequest,
  server_state: web::Data<Arc<ServerState>>,
  MultipartForm(mut form): MultipartForm<UploadNewEngineAssetFileForm>,
) -> Result<HttpResponse, MediaFileUploadError> {

  let mut mysql_connection = server_state.mysql_pool
      .acquire()
      .await
      .map_err(|err| {
        error!("MySql pool error: {:?}", err);
        MediaFileUploadError::ServerError
      })?;

  // ==================== READ SESSION ==================== //

  let maybe_user_session = server_state
      .session_checker
      .maybe_get_user_session_from_connection(&http_request, &mut mysql_connection)
      .await
      .map_err(|e| {
        error!("Session checker error: {:?}", e);
        MediaFileUploadError::ServerError
      })?;

  let maybe_avt_token = server_state
      .avt_cookie_manager
      .get_avt_token_from_request(&http_request);

  // ==================== BANNED USERS ==================== //

  if let Some(ref user) = maybe_user_session {
    if user.is_banned {
      return Err(MediaFileUploadError::NotAuthorized);
    }
  }

  // ==================== RATE LIMIT ==================== //

  let rate_limiter = match maybe_user_session {
    None => &server_state.redis_rate_limiters.file_upload_logged_out,
    Some(ref _session) => &server_state.redis_rate_limiters.file_upload_logged_in,
  };

  if let Err(_err) = rate_limiter.rate_limit_request(&http_request) {
    return Err(MediaFileUploadError::RateLimited);
  }

  // ==================== HANDLE IDEMPOTENCY ==================== //

  // TODO(bt, 2024-02-26): This should be a transaction.
  let uuid_idempotency_token = form.uuid_idempotency_token.as_ref();

  if let Err(reason) = validate_idempotency_token_format(uuid_idempotency_token) {
    return Err(MediaFileUploadError::BadInput(reason));
  }

  insert_idempotency_token(uuid_idempotency_token, &mut *mysql_connection)
      .await
      .map_err(|err| {
        error!("Error inserting idempotency token: {:?}", err);
        MediaFileUploadError::BadInput("invalid idempotency token".to_string())
      })?;

  // ==================== UPLOAD METADATA ==================== //

  let engine_category = form.engine_category.0;

  let maybe_animation_type = form.maybe_animation_type.map(|t| t.0);

  let maybe_title = form.maybe_title.map(|title| title.to_string());

  let creator_set_visibility = form.maybe_visibility
      .map(|visibility| visibility.0)
      .or_else(|| {
        maybe_user_session
            .as_ref()
            .map(|user_session| user_session.preferred_tts_result_visibility)
      })
      .unwrap_or(Visibility::default());

  // ==================== USER DATA ==================== //

  let ip_address = get_request_ip(&http_request);

  let maybe_user_token = maybe_user_session
      .map(|session| session.get_strongly_typed_user_token());

  // ==================== FILE DATA ==================== //

  let maybe_filename = form.file.file_name.as_deref()
      .as_deref()
      .map(|filename| PathBuf::from(filename));

  let maybe_file_extension = maybe_filename
      .as_ref()
      .and_then(|filename| filename.extension())
      .and_then(|ext| ext.to_str());

  let mut file_bytes = Vec::new();
  form.file.file.read_to_end(&mut file_bytes)
      .map_err(|e| {
        error!("Problem reading file: {:?}", e);
        MediaFileUploadError::ServerError
      })?;

  let file_size_bytes = file_bytes.len();

  let hash = sha256_hash_bytes(&file_bytes)
      .map_err(|io_error| {
        error!("Problem hashing bytes: {:?}", io_error);
        MediaFileUploadError::ServerError
      })?;

  let (suffix, media_file_type, mimetype) = match maybe_file_extension {
    None => {
      return Err(MediaFileUploadError::BadInput("no file extension".to_string()));
    }
    Some("bvh") => (".bvh", MediaFileType::Bvh, "application/octet-stream"),
    Some("fbx") => (".fbx", MediaFileType::Fbx, "application/octet-stream"),
    Some("glb") => (".glb", MediaFileType::Glb, "application/octet-stream"),
    Some("gltf") => (".gltf", MediaFileType::Gltf, "application/octet-stream"),
    Some("pmd") => (".pmd", MediaFileType::Pmd, "application/octet-stream"),
    Some("vmd") => (".vmd", MediaFileType::Vmd, "application/octet-stream"),
    _ => {
      return Err(MediaFileUploadError::BadInput(
        "unsupported file extension. Must be bvh, glb, gltf, or fbx.".to_string()));
    }
  };

  // ==================== UPLOAD AND SAVE ==================== //

  const PREFIX : Option<&str> = Some("asset_");

  let public_upload_path = MediaFileBucketPath::generate_new(PREFIX, Some(suffix));

  info!("Uploading media to bucket path: {}", public_upload_path.get_full_object_path_str());

  server_state.public_bucket_client.upload_file_with_content_type(
    public_upload_path.get_full_object_path_str(),
    file_bytes.as_ref(),
    mimetype)
      .await
      .map_err(|e| {
        warn!("Upload media bytes to bucket error: {:?}", e);
        MediaFileUploadError::ServerError
      })?;

  // TODO(bt, 2024-02-22): This should be a transaction.
  let (token, record_id) = insert_media_file_from_file_upload(InsertMediaFileFromUploadArgs {
    maybe_media_class: Some(MediaFileClass::Dimensional),
    media_file_type,
    maybe_creator_user_token: maybe_user_token.as_ref(),
    maybe_creator_anonymous_visitor_token: maybe_avt_token.as_ref(),
    creator_ip_address: &ip_address,
    creator_set_visibility,
    upload_type: UploadType::Filesystem,
    maybe_engine_category: Some(engine_category),
    maybe_animation_type,
    maybe_mime_type: Some(mimetype),
    file_size_bytes: file_size_bytes as u64,
    duration_millis: 0,
    sha256_checksum: &hash,
    maybe_title: maybe_title.as_deref(),
    public_bucket_directory_hash: public_upload_path.get_object_hash(),
    maybe_public_bucket_prefix: PREFIX,
    maybe_public_bucket_extension: Some(suffix),
    pool: &server_state.mysql_pool,
  })
      .await
      .map_err(|err| {
        warn!("New file creation DB error: {:?}", err);
        MediaFileUploadError::ServerError
      })?;

  info!("new media file id: {} token: {:?}", record_id, &token);

  let response = UploadNewEngineAssetSuccessResponse {
    success: true,
    media_file_token: token,
  };

  let body = serde_json::to_string(&response)
      .map_err(|e| MediaFileUploadError::ServerError)?;

  return Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body));
}
