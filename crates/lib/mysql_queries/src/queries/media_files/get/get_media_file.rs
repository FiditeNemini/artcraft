// NB: Incrementally getting rid of build warnings...
#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

use anyhow::anyhow;
use chrono::{DateTime, Utc};
use sqlx::MySqlPool;

use enums::by_table::media_files::media_file_animation_type::MediaFileAnimationType;
use enums::by_table::media_files::media_file_class::MediaFileClass;
use enums::by_table::media_files::media_file_engine_category::MediaFileEngineCategory;
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

use crate::payloads::prompt_args::prompt_inner_payload::PromptInnerPayload;

#[derive(Serialize, Debug)]
pub struct MediaFile {
  pub token: MediaFileToken,

  pub media_class: MediaFileClass,
  pub media_type: MediaFileType,

  pub maybe_engine_category: Option<MediaFileEngineCategory>,
  pub maybe_animation_type: Option<MediaFileAnimationType>,

  pub maybe_media_subtype: Option<MediaFileSubtype>,

  // TODO: Other media details (file size, mime type, dimensions, duration, etc.)
  // TODO: Provenance data (product, upload vs inference, model details and foreign keys)

  pub maybe_batch_token: Option<BatchGenerationToken>,

  pub maybe_title: Option<String>,
  pub maybe_text_transcript: Option<String>,

  pub maybe_origin_filename: Option<String>,

  pub maybe_duration_millis: Option<u64>,

  pub maybe_creator_user_token: Option<UserToken>,
  pub maybe_creator_username: Option<String>,
  pub maybe_creator_display_name: Option<String>,
  pub maybe_creator_gravatar_hash: Option<String>,

  /// This should not be exposed for GET endpoints, but is useful for permission checking.
  pub maybe_creator_anonymous_visitor_token: Option<AnonymousVisitorTrackingToken>,

  pub creator_set_visibility: Visibility,

  pub maybe_prompt_token: Option<PromptToken>,
  pub maybe_prompt_args: Option<PromptInnerPayload>,

  pub maybe_file_cover_image_public_bucket_hash: Option<String>,
  pub maybe_file_cover_image_public_bucket_prefix: Option<String>,
  pub maybe_file_cover_image_public_bucket_extension: Option<String>,

  pub maybe_model_weights_token: Option<ModelWeightToken>,
  pub maybe_model_weights_title: Option<String>,
  pub maybe_model_weights_type: Option<WeightsType>,
  pub maybe_model_weights_category: Option<WeightsCategory>,

  pub maybe_model_cover_image_public_bucket_hash: Option<String>,
  pub maybe_model_cover_image_public_bucket_prefix: Option<String>,
  pub maybe_model_cover_image_public_bucket_extension: Option<String>,

  pub maybe_model_weight_creator_user_token: Option<UserToken>,
  pub maybe_model_weight_creator_username: Option<String>,
  pub maybe_model_weight_creator_display_name: Option<String>,
  pub maybe_model_weight_creator_gravatar_hash: Option<String>,

  pub public_bucket_directory_hash: String,
  pub maybe_public_bucket_prefix: Option<String>,
  pub maybe_public_bucket_extension: Option<String>,

  pub maybe_ratings_positive_count: Option<u32>,
  pub maybe_ratings_negative_count: Option<u32>,
  pub maybe_bookmark_count: Option<u32>,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,

  // pub maybe_moderator_fields: Option<MediaFileModeratorFields>,
}

// /// "Moderator-only fields" that we wouldn't want to expose to ordinary users.
// /// It's the web endpoint controller's responsibility to clear these for non-mods.
// #[derive(Serialize)]
// pub struct MediaFileModeratorFields {
//   pub model_creator_is_banned: bool,
//   pub result_creator_is_banned_if_user: bool,
//   pub result_creator_ip_address: String,
//   pub result_creator_deleted_at: Option<DateTime<Utc>>,
//   pub mod_deleted_at: Option<DateTime<Utc>>,
//   pub maybe_mod_user_token: Option<String>,
// }

#[derive(Serialize)]
pub struct MediaFileRaw {
  pub token: MediaFileToken,

  pub media_class: MediaFileClass,
  pub media_type: MediaFileType,

  pub maybe_engine_category: Option<MediaFileEngineCategory>,
  pub maybe_animation_type: Option<MediaFileAnimationType>,

  pub maybe_media_subtype: Option<MediaFileSubtype>,

  pub maybe_batch_token: Option<BatchGenerationToken>,

  pub maybe_title: Option<String>,
  pub maybe_text_transcript: Option<String>,

  pub maybe_origin_filename: Option<String>,

  pub maybe_duration_millis: Option<i32>,

  pub maybe_creator_user_token: Option<UserToken>,
  pub maybe_creator_username: Option<String>,
  pub maybe_creator_display_name: Option<String>,
  pub maybe_creator_gravatar_hash: Option<String>,

  /// This should not be exposed for GET endpoints, but is useful for permission checking.
  pub maybe_creator_anonymous_visitor_token: Option<AnonymousVisitorTrackingToken>,

  pub creator_set_visibility: Visibility,

  pub maybe_prompt_token: Option<PromptToken>,
  pub maybe_other_prompt_args: Option<String>,

  pub maybe_file_cover_image_public_bucket_hash: Option<String>,
  pub maybe_file_cover_image_public_bucket_prefix: Option<String>,
  pub maybe_file_cover_image_public_bucket_extension: Option<String>,

  pub maybe_model_weights_token: Option<ModelWeightToken>,
  pub maybe_model_weights_title: Option<String>,
  pub maybe_model_weights_type: Option<WeightsType>,
  pub maybe_model_weights_category: Option<WeightsCategory>,

  pub maybe_model_cover_image_public_bucket_hash: Option<String>,
  pub maybe_model_cover_image_public_bucket_prefix: Option<String>,
  pub maybe_model_cover_image_public_bucket_extension: Option<String>,

  pub maybe_model_weight_creator_user_token: Option<UserToken>,
  pub maybe_model_weight_creator_username: Option<String>,
  pub maybe_model_weight_creator_display_name: Option<String>,
  pub maybe_model_weight_creator_gravatar_hash: Option<String>,

  pub public_bucket_directory_hash: String,
  pub maybe_public_bucket_prefix: Option<String>,
  pub maybe_public_bucket_extension: Option<String>,

  //pub model_is_mod_approved: bool, // converted
  //pub maybe_mod_user_token: Option<String>,

  pub maybe_ratings_positive_count: Option<u32>,
  pub maybe_ratings_negative_count: Option<u32>,
  pub maybe_bookmark_count: Option<u32>,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

pub async fn get_media_file(
  media_file_token: &MediaFileToken,
  can_see_deleted: bool,
  mysql_pool: &MySqlPool
) -> AnyhowResult<Option<MediaFile>> {

  let record = if can_see_deleted {
    select_including_deleted(media_file_token, mysql_pool).await
  } else {
    select_without_deleted(media_file_token, mysql_pool).await
  };

  let record = match record {
    Ok(record) => record,
    Err(ref err) => {
      return match err {
        sqlx::Error::RowNotFound => Ok(None),
        _ => Err(anyhow!("database error: {:?}", err)),
      }
    }
  };

  let maybe_prompt_args = record.maybe_other_prompt_args
      .as_deref()
      .map(|args| PromptInnerPayload::from_json(args))
      .transpose()
      .ok() // NB: Fail open
      .flatten();

  Ok(Some(MediaFile {
    token: record.token,
    media_type: record.media_type,
    maybe_engine_category: record.maybe_engine_category,
    maybe_animation_type: record.maybe_animation_type,
    media_class: record.media_class,
    maybe_media_subtype: record.maybe_media_subtype,
    maybe_batch_token: record.maybe_batch_token,
    maybe_title: record.maybe_title,
    maybe_text_transcript: record.maybe_text_transcript,
    maybe_origin_filename: record.maybe_origin_filename,
    maybe_duration_millis: record.maybe_duration_millis.map(|d| d as u64),
    maybe_creator_user_token: record.maybe_creator_user_token,
    maybe_creator_username: record.maybe_creator_username,
    maybe_creator_display_name: record.maybe_creator_display_name,
    maybe_creator_gravatar_hash: record.maybe_creator_gravatar_hash,
    maybe_creator_anonymous_visitor_token: record.maybe_creator_anonymous_visitor_token,
    creator_set_visibility: record.creator_set_visibility,
    maybe_prompt_token: record.maybe_prompt_token,
    maybe_prompt_args,
    maybe_file_cover_image_public_bucket_hash: record.maybe_file_cover_image_public_bucket_hash,
    maybe_file_cover_image_public_bucket_prefix: record.maybe_file_cover_image_public_bucket_prefix,
    maybe_file_cover_image_public_bucket_extension: record.maybe_file_cover_image_public_bucket_extension,
    maybe_model_weights_token: record.maybe_model_weights_token,
    maybe_model_weights_title: record.maybe_model_weights_title,
    maybe_model_weights_type: record.maybe_model_weights_type,
    maybe_model_weights_category: record.maybe_model_weights_category,
    maybe_model_cover_image_public_bucket_hash: record.maybe_model_cover_image_public_bucket_hash,
    maybe_model_cover_image_public_bucket_prefix: record.maybe_model_cover_image_public_bucket_prefix,
    maybe_model_cover_image_public_bucket_extension: record.maybe_model_cover_image_public_bucket_extension,
    maybe_model_weight_creator_user_token: record.maybe_model_weight_creator_user_token,
    maybe_model_weight_creator_username: record.maybe_model_weight_creator_username,
    maybe_model_weight_creator_display_name: record.maybe_model_weight_creator_display_name,
    maybe_model_weight_creator_gravatar_hash: record.maybe_model_weight_creator_gravatar_hash,
    public_bucket_directory_hash: record.public_bucket_directory_hash,
    maybe_public_bucket_prefix: record.maybe_public_bucket_prefix,
    maybe_public_bucket_extension: record.maybe_public_bucket_extension,
    maybe_ratings_positive_count: record.maybe_ratings_positive_count,
    maybe_ratings_negative_count: record.maybe_ratings_negative_count,
    maybe_bookmark_count: record.maybe_bookmark_count,
    created_at: record.created_at,
    updated_at: record.updated_at,
  }))
}

async fn select_including_deleted(
  media_file_token: &MediaFileToken,
  mysql_pool: &MySqlPool
) -> Result<MediaFileRaw, sqlx::Error> {
  sqlx::query_as!(
      MediaFileRaw,
        r#"
SELECT
    m.token as `token: tokens::tokens::media_files::MediaFileToken`,

    m.media_class as `media_class: enums::by_table::media_files::media_file_class::MediaFileClass`,
    m.media_type as `media_type: enums::by_table::media_files::media_file_type::MediaFileType`,

    m.maybe_engine_category as `maybe_engine_category: enums::by_table::media_files::media_file_engine_category::MediaFileEngineCategory`,
    m.maybe_animation_type as `maybe_animation_type: enums::by_table::media_files::media_file_animation_type::MediaFileAnimationType`,

    m.maybe_media_subtype as `maybe_media_subtype: enums::by_table::media_files::media_file_subtype::MediaFileSubtype`,

    users.token as `maybe_creator_user_token: tokens::tokens::users::UserToken`,
    users.username as maybe_creator_username,
    users.display_name as maybe_creator_display_name,
    users.email_gravatar_hash as maybe_creator_gravatar_hash,

    m.maybe_creator_anonymous_visitor_token as `maybe_creator_anonymous_visitor_token: tokens::tokens::anonymous_visitor_tracking::AnonymousVisitorTrackingToken`,

    m.maybe_batch_token as `maybe_batch_token: tokens::tokens::batch_generations::BatchGenerationToken`,

    m.maybe_title,
    m.maybe_text_transcript,

    m.maybe_origin_filename,

    m.maybe_duration_millis,

    m.maybe_prompt_token as `maybe_prompt_token: tokens::tokens::prompts::PromptToken`,
    prompts.maybe_other_args as maybe_other_prompt_args,

    media_file_cover_image.public_bucket_directory_hash as maybe_file_cover_image_public_bucket_hash,
    media_file_cover_image.maybe_public_bucket_prefix as maybe_file_cover_image_public_bucket_prefix,
    media_file_cover_image.maybe_public_bucket_extension as maybe_file_cover_image_public_bucket_extension,

    m.creator_set_visibility as `creator_set_visibility: enums::common::visibility::Visibility`,

    model_weights.token as `maybe_model_weights_token: tokens::tokens::model_weights::ModelWeightToken`,
    model_weights.title as maybe_model_weights_title,
    model_weights.weights_type as `maybe_model_weights_type: enums::by_table::model_weights::weights_types::WeightsType`,
    model_weights.weights_category as `maybe_model_weights_category: enums::by_table::model_weights::weights_category::WeightsCategory`,

    model_weight_cover_image.public_bucket_directory_hash as maybe_model_cover_image_public_bucket_hash,
    model_weight_cover_image.maybe_public_bucket_prefix as maybe_model_cover_image_public_bucket_prefix,
    model_weight_cover_image.maybe_public_bucket_extension as maybe_model_cover_image_public_bucket_extension,

    model_weight_creator.token as `maybe_model_weight_creator_user_token: tokens::tokens::users::UserToken`,
    model_weight_creator.username as maybe_model_weight_creator_username,
    model_weight_creator.display_name as maybe_model_weight_creator_display_name,
    model_weight_creator.email_gravatar_hash as maybe_model_weight_creator_gravatar_hash,

    m.public_bucket_directory_hash,
    m.maybe_public_bucket_prefix,
    m.maybe_public_bucket_extension,

    entity_stats.ratings_positive_count as maybe_ratings_positive_count,
    entity_stats.ratings_negative_count as maybe_ratings_negative_count,
    entity_stats.bookmark_count as maybe_bookmark_count,

    m.created_at,
    m.updated_at

FROM media_files AS m
LEFT OUTER JOIN users
    ON m.maybe_creator_user_token = users.token
LEFT OUTER JOIN model_weights
    ON m.maybe_origin_model_token = model_weights.token
LEFT OUTER JOIN media_files as media_file_cover_image
    ON media_file_cover_image.token = m.maybe_cover_image_media_file_token
LEFT OUTER JOIN media_files as model_weight_cover_image
    ON model_weight_cover_image.token = model_weights.maybe_cover_image_media_file_token
LEFT OUTER JOIN users as model_weight_creator
    ON model_weight_creator.token = model_weights.creator_user_token
LEFT OUTER JOIN entity_stats
    ON entity_stats.entity_type = "media_file"
    AND entity_stats.entity_token = m.token
LEFT OUTER JOIN prompts
    ON prompts.token = m.maybe_prompt_token
WHERE
    m.token = ?
        "#,
      media_file_token
    )
    .fetch_one(mysql_pool)
    .await
}

async fn select_without_deleted(
  media_file_token: &MediaFileToken,
  mysql_pool: &MySqlPool
) -> Result<MediaFileRaw, sqlx::Error> {
  sqlx::query_as!(
      MediaFileRaw,
        r#"
SELECT
    m.token as `token: tokens::tokens::media_files::MediaFileToken`,

    m.media_class as `media_class: enums::by_table::media_files::media_file_class::MediaFileClass`,
    m.media_type as `media_type: enums::by_table::media_files::media_file_type::MediaFileType`,

    m.maybe_engine_category as `maybe_engine_category: enums::by_table::media_files::media_file_engine_category::MediaFileEngineCategory`,
    m.maybe_animation_type as `maybe_animation_type: enums::by_table::media_files::media_file_animation_type::MediaFileAnimationType`,

    m.maybe_media_subtype as `maybe_media_subtype: enums::by_table::media_files::media_file_subtype::MediaFileSubtype`,

    users.token as `maybe_creator_user_token: tokens::tokens::users::UserToken`,
    users.username as maybe_creator_username,
    users.display_name as maybe_creator_display_name,
    users.email_gravatar_hash as maybe_creator_gravatar_hash,

    m.maybe_creator_anonymous_visitor_token as `maybe_creator_anonymous_visitor_token: tokens::tokens::anonymous_visitor_tracking::AnonymousVisitorTrackingToken`,

    m.maybe_batch_token as `maybe_batch_token: tokens::tokens::batch_generations::BatchGenerationToken`,

    m.maybe_title,
    m.maybe_text_transcript,

    m.maybe_origin_filename,

    m.maybe_duration_millis,

    m.maybe_prompt_token as `maybe_prompt_token: tokens::tokens::prompts::PromptToken`,
    prompts.maybe_other_args as maybe_other_prompt_args,

    media_file_cover_image.public_bucket_directory_hash as maybe_file_cover_image_public_bucket_hash,
    media_file_cover_image.maybe_public_bucket_prefix as maybe_file_cover_image_public_bucket_prefix,
    media_file_cover_image.maybe_public_bucket_extension as maybe_file_cover_image_public_bucket_extension,

    m.creator_set_visibility as `creator_set_visibility: enums::common::visibility::Visibility`,

    model_weights.token as `maybe_model_weights_token: tokens::tokens::model_weights::ModelWeightToken`,
    model_weights.title as maybe_model_weights_title,
    model_weights.weights_type as `maybe_model_weights_type: enums::by_table::model_weights::weights_types::WeightsType`,
    model_weights.weights_category as `maybe_model_weights_category: enums::by_table::model_weights::weights_category::WeightsCategory`,

    model_weight_cover_image.public_bucket_directory_hash as maybe_model_cover_image_public_bucket_hash,
    model_weight_cover_image.maybe_public_bucket_prefix as maybe_model_cover_image_public_bucket_prefix,
    model_weight_cover_image.maybe_public_bucket_extension as maybe_model_cover_image_public_bucket_extension,

    model_weight_creator.token as `maybe_model_weight_creator_user_token: tokens::tokens::users::UserToken`,
    model_weight_creator.username as maybe_model_weight_creator_username,
    model_weight_creator.display_name as maybe_model_weight_creator_display_name,
    model_weight_creator.email_gravatar_hash as maybe_model_weight_creator_gravatar_hash,

    m.public_bucket_directory_hash,
    m.maybe_public_bucket_prefix,
    m.maybe_public_bucket_extension,

    entity_stats.ratings_positive_count as maybe_ratings_positive_count,
    entity_stats.ratings_negative_count as maybe_ratings_negative_count,
    entity_stats.bookmark_count as maybe_bookmark_count,

    m.created_at,
    m.updated_at

FROM media_files AS m
LEFT OUTER JOIN users
    ON m.maybe_creator_user_token = users.token
LEFT OUTER JOIN model_weights
    ON m.maybe_origin_model_token = model_weights.token
LEFT OUTER JOIN media_files as media_file_cover_image
    ON media_file_cover_image.token = m.maybe_cover_image_media_file_token
LEFT OUTER JOIN media_files as model_weight_cover_image
    ON model_weight_cover_image.token = model_weights.maybe_cover_image_media_file_token
LEFT OUTER JOIN users as model_weight_creator
    ON model_weight_creator.token = model_weights.creator_user_token
LEFT OUTER JOIN entity_stats
    ON entity_stats.entity_type = "media_file"
    AND entity_stats.entity_token = m.token
LEFT OUTER JOIN prompts
    ON prompts.token = m.maybe_prompt_token
WHERE
    m.token = ?
    AND m.user_deleted_at IS NULL
    AND m.mod_deleted_at IS NULL
        "#,
      media_file_token
    )
    .fetch_one(mysql_pool)
    .await
}
