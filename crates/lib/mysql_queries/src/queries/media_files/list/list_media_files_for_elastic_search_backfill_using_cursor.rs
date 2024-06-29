use anyhow::anyhow;
use chrono::{DateTime, Utc};
use log::warn;
use sqlx::{MySql, MySqlPool};
use sqlx::pool::PoolConnection;

use enums::by_table::media_files::media_file_animation_type::MediaFileAnimationType;
use enums::by_table::media_files::media_file_class::MediaFileClass;
use enums::by_table::media_files::media_file_engine_category::MediaFileEngineCategory;
use enums::by_table::media_files::media_file_origin_category::MediaFileOriginCategory;
use enums::by_table::media_files::media_file_origin_model_type::MediaFileOriginModelType;
use enums::by_table::media_files::media_file_origin_product_category::MediaFileOriginProductCategory;
use enums::by_table::media_files::media_file_subtype::MediaFileSubtype;
use enums::by_table::media_files::media_file_type::MediaFileType;
use enums::by_table::model_weights::weights_category::WeightsCategory;
use enums::by_table::model_weights::weights_types::WeightsType;
use enums::common::visibility::Visibility;
use errors::AnyhowResult;
use tokens::tokens::anonymous_visitor_tracking::AnonymousVisitorTrackingToken;
use tokens::tokens::batch_generations::BatchGenerationToken;
use tokens::tokens::media_files::MediaFileToken;
use tokens::tokens::model_weights::ModelWeightToken;
use tokens::tokens::prompts::PromptToken;
use tokens::tokens::users::UserToken;

use crate::helpers::boolean_converters::i8_to_bool;

/// This is meant to be the entire table
#[derive(Debug)]
pub struct MediaFileForElasticsearchRecord {
  pub id: i64,
  pub token: MediaFileToken,

  pub origin_category: MediaFileOriginCategory,
  pub origin_product_category: MediaFileOriginProductCategory,

  pub maybe_origin_model_type: Option<MediaFileOriginModelType>,
  pub maybe_origin_model_token: Option<String>,

  pub maybe_origin_filename: Option<String>,

  pub is_batch_generated: bool,
  pub maybe_batch_token: Option<BatchGenerationToken>,

  pub is_intermediate_system_file: bool,

  pub maybe_title: Option<String>,

  // Cover images
  pub maybe_cover_image_media_file_token: Option<MediaFileToken>,
  pub maybe_cover_image_public_bucket_hash: Option<String>,
  pub maybe_cover_image_public_bucket_prefix: Option<String>,
  pub maybe_cover_image_public_bucket_extension: Option<String>,

  pub maybe_style_transfer_source_media_file_token: Option<MediaFileToken>,
  pub maybe_scene_source_media_file_token: Option<MediaFileToken>,

  pub nsfw_status: String,

  pub media_type: MediaFileType,
  pub media_class: MediaFileClass,
  pub maybe_media_subtype: Option<MediaFileSubtype>,

  pub maybe_mime_type: Option<String>,
  pub file_size_bytes: u64,
  pub maybe_duration_millis: Option<u64>,

  pub maybe_audio_encoding: Option<String>,
  pub maybe_video_encoding: Option<String>,

  //pub maybe_frame_width: Option<u64>,
  //pub maybe_frame_height: Option<u64>,

  pub maybe_engine_category: Option<MediaFileEngineCategory>,
  pub maybe_animation_type: Option<MediaFileAnimationType>,

  pub maybe_text_transcript: Option<String>,

  pub maybe_prompt_token: Option<PromptToken>,

  pub checksum_sha2: String,

  pub public_bucket_directory_hash: String,
  pub maybe_public_bucket_prefix: Option<String>,
  pub maybe_public_bucket_extension: Option<String>,

  pub extra_file_modification_info: Option<String>,

  // Creator
  pub maybe_creator_user_token: Option<UserToken>,
  pub maybe_creator_username: Option<String>,
  pub maybe_creator_display_name: Option<String>,
  pub maybe_creator_gravatar_hash: Option<String>,

  pub maybe_creator_anonymous_visitor_token: Option<AnonymousVisitorTrackingToken>,

  pub creator_ip_address: String,

  pub creator_set_visibility: Visibility,

  // TODO: Other fields really don't matter.

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,

  pub user_deleted_at: Option<DateTime<Utc>>,
  pub mod_deleted_at: Option<DateTime<Utc>>,
}

pub async fn list_model_weights_for_elastic_search_backfill_using_cursor(
  mysql_pool: &MySqlPool,
  page_size: u64,
  cursor: u64,
) -> AnyhowResult<Vec<MediaFileForElasticsearchRecord>> {
  let mut connection = mysql_pool.acquire().await?;

  let maybe_media_files
      = list_media_files(&mut connection, page_size, cursor)
      .await;

  let media_files : Vec<RawRecord> = match maybe_media_files {
    Ok(media_files) => media_files,
    Err(sqlx::error::Error::RowNotFound) => return Ok(Vec::new()),
    Err(err) => {
      warn!("media file list query error: {:?}", err);
      return Err(anyhow!("media file list query error"));
    }
  };

  Ok(media_files.into_iter()
      .map(|record| {
        MediaFileForElasticsearchRecord {
          id: record.id,
          token: record.token,
          origin_category: record.origin_category,
          origin_product_category: record.origin_product_category,
          maybe_origin_model_type: record.maybe_origin_model_type,
          maybe_origin_model_token: record.maybe_origin_model_token,
          maybe_origin_filename: record.maybe_origin_filename,
          is_batch_generated: i8_to_bool(record.is_batch_generated),
          maybe_batch_token: record.maybe_batch_token,
          is_intermediate_system_file: i8_to_bool(record.is_intermediate_system_file),
          maybe_title: record.maybe_title,
          maybe_cover_image_media_file_token: record.maybe_cover_image_media_file_token,
          maybe_cover_image_public_bucket_hash: record.maybe_cover_image_public_bucket_hash,
          maybe_cover_image_public_bucket_prefix: record.maybe_cover_image_public_bucket_prefix,
          maybe_cover_image_public_bucket_extension: record.maybe_cover_image_public_bucket_extension,
          maybe_style_transfer_source_media_file_token: record.maybe_style_transfer_source_media_file_token,
          maybe_scene_source_media_file_token: record.maybe_scene_source_media_file_token,
          nsfw_status: record.nsfw_status,
          media_type: record.media_type,
          media_class: record.media_class,
          maybe_media_subtype: record.maybe_media_subtype,
          maybe_mime_type: record.maybe_mime_type,
          file_size_bytes: record.file_size_bytes as u64,
          maybe_duration_millis: record.maybe_duration_millis.map(|d| d as u64),
          maybe_audio_encoding: record.maybe_audio_encoding,
          maybe_video_encoding: record.maybe_video_encoding,
          maybe_engine_category: record.maybe_engine_category,
          maybe_animation_type: record.maybe_animation_type,
          maybe_text_transcript: record.maybe_text_transcript,
          maybe_prompt_token: record.maybe_prompt_token,
          checksum_sha2: record.checksum_sha2,
          public_bucket_directory_hash: record.public_bucket_directory_hash,
          maybe_public_bucket_prefix: record.maybe_public_bucket_prefix,
          maybe_public_bucket_extension: record.maybe_public_bucket_extension,
          extra_file_modification_info: record.extra_file_modification_info,
          maybe_creator_user_token: record.maybe_creator_user_token,
          maybe_creator_username: record.maybe_creator_username,
          maybe_creator_display_name: record.maybe_creator_display_name,
          maybe_creator_gravatar_hash: record.maybe_creator_gravatar_hash,
          maybe_creator_anonymous_visitor_token: record.maybe_creator_anonymous_visitor_token,
          creator_ip_address: record.creator_ip_address,
          creator_set_visibility: record.creator_set_visibility,
          created_at: record.created_at,
          updated_at: record.updated_at,
          user_deleted_at: record.user_deleted_at,
          mod_deleted_at: record.mod_deleted_at,
        }
      })
      .collect::<Vec<MediaFileForElasticsearchRecord>>())
}

async fn list_media_files(
  mysql_connection: &mut PoolConnection<MySql>,
  page_size: u64,
  cursor: u64,
) -> Result<Vec<RawRecord>, sqlx::Error> {
  Ok(sqlx::query_as!(
      RawRecord,
        r#"
SELECT
    m.id,
    m.token as `token: tokens::tokens::media_files::MediaFileToken`,

    m.origin_category as `origin_category: enums::by_table::media_files::media_file_origin_category::MediaFileOriginCategory`,
    m.origin_product_category as `origin_product_category: enums::by_table::media_files::media_file_origin_product_category::MediaFileOriginProductCategory`,

    m.maybe_origin_model_type as `maybe_origin_model_type: enums::by_table::media_files::media_file_origin_model_type::MediaFileOriginModelType`,
    m.maybe_origin_model_token,

    m.maybe_origin_filename,

    m.is_batch_generated,
    m.maybe_batch_token as `maybe_batch_token: tokens::tokens::batch_generations::BatchGenerationToken`,

    m.is_intermediate_system_file,

    m.maybe_title,

    cover_image.token as `maybe_cover_image_media_file_token: tokens::tokens::media_files::MediaFileToken`,
    cover_image.public_bucket_directory_hash as maybe_cover_image_public_bucket_hash,
    cover_image.maybe_public_bucket_prefix as maybe_cover_image_public_bucket_prefix,
    cover_image.maybe_public_bucket_extension as maybe_cover_image_public_bucket_extension,

    m.maybe_style_transfer_source_media_file_token as `maybe_style_transfer_source_media_file_token: tokens::tokens::media_files::MediaFileToken`,
    m.maybe_scene_source_media_file_token as `maybe_scene_source_media_file_token: tokens::tokens::media_files::MediaFileToken`,

    m.nsfw_status,

    m.media_type as `media_type: enums::by_table::media_files::media_file_type::MediaFileType`,
    m.media_class as `media_class: enums::by_table::media_files::media_file_class::MediaFileClass`,
    m.maybe_media_subtype as `maybe_media_subtype: enums::by_table::media_files::media_file_subtype::MediaFileSubtype`,

    m.maybe_mime_type,
    m.file_size_bytes,
    m.maybe_duration_millis,

    m.maybe_audio_encoding,
    m.maybe_video_encoding,

    m.maybe_engine_category as `maybe_engine_category: enums::by_table::media_files::media_file_engine_category::MediaFileEngineCategory`,
    m.maybe_animation_type as `maybe_animation_type: enums::by_table::media_files::media_file_animation_type::MediaFileAnimationType`,

    m.maybe_text_transcript,

    m.maybe_prompt_token as `maybe_prompt_token: tokens::tokens::prompts::PromptToken`,

    m.checksum_sha2,

    m.public_bucket_directory_hash,
    m.maybe_public_bucket_prefix,
    m.maybe_public_bucket_extension,

    m.extra_file_modification_info,

    users.token as `maybe_creator_user_token: tokens::tokens::users::UserToken`,
    users.username as `maybe_creator_username`,
    users.display_name as `maybe_creator_display_name`,
    users.email_gravatar_hash as `maybe_creator_gravatar_hash`,

    m.maybe_creator_anonymous_visitor_token as `maybe_creator_anonymous_visitor_token: tokens::tokens::anonymous_visitor_tracking::AnonymousVisitorTrackingToken`,

    m.creator_ip_address,

    m.creator_set_visibility as `creator_set_visibility: enums::common::visibility::Visibility`,

    m.created_at,
    m.updated_at,
    m.user_deleted_at,
    m.mod_deleted_at

FROM media_files as m

LEFT OUTER JOIN users
    ON users.token = m.maybe_creator_user_token

LEFT OUTER JOIN media_files as cover_image
    ON cover_image.token = m.maybe_cover_image_media_file_token

WHERE
  m.id > ?
ORDER BY m.id ASC
LIMIT ?
        "#,
      cursor,
      page_size
  )
      .fetch_all(&mut **mysql_connection)
      .await?)
}

struct RawRecord {
  pub id: i64,
  pub token: MediaFileToken,

  pub origin_category: MediaFileOriginCategory,
  pub origin_product_category: MediaFileOriginProductCategory,

  pub maybe_origin_model_type: Option<MediaFileOriginModelType>,
  pub maybe_origin_model_token: Option<String>,

  pub maybe_origin_filename: Option<String>,

  pub is_batch_generated: i8,
  pub maybe_batch_token: Option<BatchGenerationToken>,

  pub is_intermediate_system_file: i8,

  pub maybe_title: Option<String>,

  // Cover images
  pub maybe_cover_image_media_file_token: Option<MediaFileToken>,
  pub maybe_cover_image_public_bucket_hash: Option<String>,
  pub maybe_cover_image_public_bucket_prefix: Option<String>,
  pub maybe_cover_image_public_bucket_extension: Option<String>,

  pub maybe_style_transfer_source_media_file_token: Option<MediaFileToken>,
  pub maybe_scene_source_media_file_token: Option<MediaFileToken>,

  pub nsfw_status: String,

  pub media_type: MediaFileType,
  pub media_class: MediaFileClass,
  pub maybe_media_subtype: Option<MediaFileSubtype>,

  pub maybe_mime_type: Option<String>,
  pub file_size_bytes: i32,
  pub maybe_duration_millis: Option<i32>,

  pub maybe_audio_encoding: Option<String>,
  pub maybe_video_encoding: Option<String>,

  //pub maybe_frame_width: Option<u64>,
  //pub maybe_frame_height: Option<u64>,

  pub maybe_engine_category: Option<MediaFileEngineCategory>,
  pub maybe_animation_type: Option<MediaFileAnimationType>,

  pub maybe_text_transcript: Option<String>,

  pub maybe_prompt_token: Option<PromptToken>,

  pub checksum_sha2: String,

  pub public_bucket_directory_hash: String,
  pub maybe_public_bucket_prefix: Option<String>,
  pub maybe_public_bucket_extension: Option<String>,

  pub extra_file_modification_info: Option<String>,

  // Creator
  pub maybe_creator_user_token: Option<UserToken>,
  pub maybe_creator_username: Option<String>,
  pub maybe_creator_display_name: Option<String>,
  pub maybe_creator_gravatar_hash: Option<String>,

  pub maybe_creator_anonymous_visitor_token: Option<AnonymousVisitorTrackingToken>,

  pub creator_ip_address: String,

  pub creator_set_visibility: Visibility,

  // TODO: Other fields really don't matter.

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,

  pub user_deleted_at: Option<DateTime<Utc>>,
  pub mod_deleted_at: Option<DateTime<Utc>>,
}
