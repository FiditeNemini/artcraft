use anyhow::anyhow;
use buckets::public::media_uploads::original_file::MediaUploadOriginalFilePath;
use container_common::anyhow_result::AnyhowResult;
use crate::payloads::media_upload_details::MediaUploadDetails;
use enums::by_table::media_uploads::media_upload_type::MediaUploadType;
use enums::common::visibility::Visibility;
use sqlx::MySqlPool;
use tokens::files::media_upload::MediaUploadToken;
use tokens::users::user::UserToken;

pub struct Args <'a> {
  pub token: &'a MediaUploadToken,
  pub uuid_idempotency_token: &'a str,

  pub media_type: MediaUploadType,
  pub maybe_original_filename: Option<&'a str>,
  pub original_file_size_bytes: u64,
  pub maybe_original_duration_millis: Option<u64>,
  pub maybe_original_mime_type: Option<&'a str>,
  pub maybe_original_audio_encoding: Option<&'a str>,
  pub maybe_original_video_encoding: Option<&'a str>,
  pub maybe_original_frame_width: Option<u64>,
  pub maybe_original_frame_height: Option<u64>,
  pub checksum_sha2: &'a str,

  pub public_upload_path: &'a MediaUploadOriginalFilePath,
  pub extra_file_modification_info: MediaUploadDetails,

  pub maybe_creator_user_token: Option<&'a UserToken>,
  pub maybe_creator_anonymous_visitor_token: Option<&'a str>,
  pub creator_ip_address: &'a str,
  pub creator_set_visibility: Visibility,

  pub maybe_creator_synthetic_id: Option<u64>,

  pub mysql_pool: &'a MySqlPool,
}

pub async fn insert_media_upload(args: Args<'_>) -> AnyhowResult<u64> {
  let query = sqlx::query!(
        r#"
INSERT INTO media_uploads
SET
  token = ?,
  uuid_idempotency_token = ?,

  media_type = ?,
  maybe_original_filename = ?,
  original_file_size_bytes = ?,
  original_duration_millis = ?,
  maybe_original_mime_type = ?,
  maybe_original_audio_encoding = ?,
  maybe_original_video_encoding = ?,
  maybe_original_frame_width = ?,
  maybe_original_frame_height = ?,
  checksum_sha2 = ?,

  public_bucket_directory_hash = ?,
  public_bucket_directory_full_path = ?,
  extra_file_modification_info = ?,

  maybe_creator_user_token = ?,
  maybe_creator_anonymous_visitor_token = ?,
  creator_ip_address = ?,
  creator_set_visibility = ?,

  maybe_creator_synthetic_id = ?
        "#,
        args.token,
        args.uuid_idempotency_token,

        args.media_type,
        args.maybe_original_filename,
        args.original_file_size_bytes,
        args.maybe_original_duration_millis.unwrap_or(0),
        args.maybe_original_mime_type,
        args.maybe_original_audio_encoding,
        args.maybe_original_video_encoding,
        args.maybe_original_frame_width,
        args.maybe_original_frame_height,
        args.checksum_sha2,

        args.public_upload_path.get_object_hash(),
        args.public_upload_path.get_full_object_path_str(),
        "", // TODO: args.extra_file_modification_info,

        args.maybe_creator_user_token,
        args.maybe_creator_anonymous_visitor_token,
        args.creator_ip_address,
        args.creator_set_visibility.to_str(),

        args.maybe_creator_synthetic_id,
    );

  let query_result = query.execute(args.mysql_pool)
      .await;

  match query_result {
    Ok(res) => Ok(res.last_insert_id()),
    Err(err) => Err(anyhow!("error inserting new media upload: {:?}", err)),
  }
}
