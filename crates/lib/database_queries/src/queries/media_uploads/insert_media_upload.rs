use anyhow::anyhow;
use container_common::anyhow_result::AnyhowResult;
use reusable_types::db::enums::entity_visibility::EntityVisibility;
use reusable_types::db::enums::media_upload_type::MediaUploadType;
use reusable_types::db::payloads::MediaUploadDetails;
use sqlx::MySqlPool;
use tokens::files::media_upload::MediaUploadToken;
use tokens::users::user::UserToken;

pub struct Args <'a> {
  pub token: &'a MediaUploadToken,
  pub uuid_idempotency_token: &'a str,

  pub media_type: MediaUploadType,
  pub maybe_original_filename: Option<&'a str>,
  pub original_file_size_bytes: u64,
  pub original_duration_millis: u64,
  pub maybe_original_mime_type: Option<&'a str>,
  pub maybe_original_audio_encoding: Option<&'a str>,
  pub maybe_original_video_encoding: Option<&'a str>,
  pub maybe_original_frame_width: Option<u64>,
  pub maybe_original_frame_height: Option<u64>,
  pub checksum_sha2: &'a str,

  pub public_bucket_directory_full_path: &'a str,
  pub extra_file_modification_info: MediaUploadDetails,

  pub maybe_creator_user_token: Option<&'a UserToken>,
  pub maybe_creator_anonymous_visitor_token: Option<&'a str>,
  pub creator_ip_address: &'a str,
  pub creator_set_visibility: EntityVisibility,

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
        args.original_duration_millis,
        args.maybe_original_mime_type,
        args.maybe_original_audio_encoding,
        args.maybe_original_video_encoding,
        args.maybe_original_frame_width,
        args.maybe_original_frame_height,
        args.checksum_sha2,

        args.public_bucket_directory_full_path,
        "", // TODO: args.extra_file_modification_info,

        args.maybe_creator_user_token,
        args.maybe_creator_anonymous_visitor_token,
        args.creator_ip_address,
        args.creator_set_visibility,

        args.maybe_creator_synthetic_id,
    );

  let query_result = query.execute(args.mysql_pool)
      .await;

  match query_result {
    Ok(res) => Ok(res.last_insert_id()),
    Err(err) => Err(anyhow!("error inserting new media upload: {:?}", err)),
  }
}
