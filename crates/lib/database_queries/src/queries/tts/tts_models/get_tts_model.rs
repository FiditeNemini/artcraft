use anyhow::anyhow;
use chrono::{DateTime, Utc};
use container_common::anyhow_result::AnyhowResult;
use crate::column_types::record_visibility::RecordVisibility;
use crate::column_types::vocoder_type::VocoderType;
use crate::helpers::boolean_converters::i8_to_bool;
use log::warn;
use sqlx::MySqlPool;

// FIXME: This is the old style of query scoping and shouldn't be copied.
//  The moderator-only fields are good practice, though.

pub struct TtsModelRecord {
  pub model_token: String,
  pub tts_model_type: String,

  /// NB: text_pipeline_type may not always be present in the database.
  pub text_pipeline_type: Option<String>,

  pub maybe_default_pretrained_vocoder: Option<VocoderType>,
  pub text_preprocessing_algorithm: String,

  pub creator_user_token: String,
  pub creator_username: String,
  pub creator_display_name: String,
  pub creator_gravatar_hash: String,

  pub title: String,
  pub description_markdown: String,
  pub description_rendered_html: String,

  pub ietf_language_tag: String,
  pub ietf_primary_language_subtag: String,

  pub is_front_page_featured: bool,
  pub is_twitch_featured: bool,

  pub maybe_suggested_unique_bot_command: Option<String>,

  pub creator_set_visibility: RecordVisibility,

  pub is_locked_from_use: bool,
  pub is_locked_from_user_modification: bool,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,

  pub maybe_moderator_fields: Option<TtsModelModeratorFields>,
}

/// "Moderator-only fields" that we wouldn't want to expose to ordinary users.
/// It's the web endpoint controller's responsibility to clear these for non-mods.
pub struct TtsModelModeratorFields {
  pub creator_is_banned: bool,
  pub creator_ip_address_creation: String,
  pub creator_ip_address_last_update: String,
  pub user_deleted_at: Option<DateTime<Utc>>,
  pub mod_deleted_at: Option<DateTime<Utc>>,
}

// FIXME: This is the old style of query scoping and shouldn't be copied.
//  The moderator-only fields are good practice, though.

pub async fn get_tts_model_by_token(
  tts_model_token: &str,
  can_see_deleted: bool,
  mysql_pool: &MySqlPool
) -> AnyhowResult<Option<TtsModelRecord>> {

  let maybe_record = if can_see_deleted {
    select_including_deleted(tts_model_token, mysql_pool).await
  } else {
    select_without_deleted(tts_model_token, mysql_pool).await
  };

  let model : InternalTtsModelRecordRaw = match maybe_record {
    Ok(model) => model,
    Err(ref err) => {
      match err {
        sqlx::Error::RowNotFound => {
          warn!("tts model not found: {:?}", &err);
          return Ok(None);
        },
        _ => {
          warn!("tts model query error: {:?}", &err);
          return Err(anyhow!("database error"));
        }
      }
    }
  };

  let mut maybe_vocoder : Option<VocoderType> = None;
  if let Some(vocoder) = model.maybe_default_pretrained_vocoder.as_deref() {
    maybe_vocoder = Some(VocoderType::from_str(vocoder)?);
  }

  let model_for_response = TtsModelRecord {
    model_token: model.model_token,
    tts_model_type: model.tts_model_type,
    text_pipeline_type: model.text_pipeline_type,
    maybe_default_pretrained_vocoder: maybe_vocoder,
    text_preprocessing_algorithm: model.text_preprocessing_algorithm,
    creator_user_token: model.creator_user_token,
    creator_username: model.creator_username,
    creator_display_name: model.creator_display_name,
    creator_gravatar_hash: model.creator_gravatar_hash,
    title: model.title,
    description_markdown: model.description_markdown,
    description_rendered_html: model.description_rendered_html,
    // NB: Fail open/public with creator_set_visibility since we're already looking at it
    ietf_language_tag: model.ietf_language_tag,
    ietf_primary_language_subtag: model.ietf_primary_language_subtag,
    is_front_page_featured: i8_to_bool(model.is_front_page_featured),
    is_twitch_featured: i8_to_bool(model.is_twitch_featured),
    maybe_suggested_unique_bot_command: model.maybe_suggested_unique_bot_command,
    creator_set_visibility: RecordVisibility::from_str(&model.creator_set_visibility)
        .unwrap_or(RecordVisibility::Public),
    is_locked_from_use: i8_to_bool(model.is_locked_from_use),
    is_locked_from_user_modification: i8_to_bool(model.is_locked_from_user_modification),
    created_at: model.created_at,
    updated_at: model.updated_at,
    maybe_moderator_fields: Some(TtsModelModeratorFields {
      creator_is_banned: i8_to_bool(model.creator_is_banned),
      creator_ip_address_creation: model.creator_ip_address_creation,
      creator_ip_address_last_update: model.creator_ip_address_last_update,
      user_deleted_at: model.user_deleted_at,
      mod_deleted_at: model.mod_deleted_at,
    }),
  };

  Ok(Some(model_for_response))
}

async fn select_including_deleted(
  tts_model_token: &str,
  mysql_pool: &MySqlPool
) -> Result<InternalTtsModelRecordRaw, sqlx::Error> {
  sqlx::query_as!(
      InternalTtsModelRecordRaw,
        r#"
SELECT
    tts.token as model_token,
    tts.tts_model_type,
    tts.text_pipeline_type,
    tts.text_preprocessing_algorithm,
    tts.maybe_default_pretrained_vocoder,

    tts.creator_user_token,
    users.username as creator_username,
    users.display_name as creator_display_name,
    users.email_gravatar_hash as creator_gravatar_hash,
    users.is_banned as creator_is_banned,

    tts.title,
    tts.description_markdown,
    tts.description_rendered_html,

    tts.ietf_language_tag,
    tts.ietf_primary_language_subtag,

    tts.is_front_page_featured,
    tts.is_twitch_featured,

    tts.maybe_suggested_unique_bot_command,

    tts.creator_set_visibility,

    tts.is_locked_from_use,
    tts.is_locked_from_user_modification,

    tts.created_at,
    tts.updated_at,

    tts.creator_ip_address_creation,
    tts.creator_ip_address_last_update,
    tts.mod_deleted_at,
    tts.user_deleted_at

FROM tts_models as tts
JOIN users
    ON users.token = tts.creator_user_token
WHERE tts.token = ?
        "#,
      tts_model_token
    )
    .fetch_one(mysql_pool)
    .await // TODO: This will return error if it doesn't exist
}

async fn select_without_deleted(
  tts_model_token: &str,
  mysql_pool: &MySqlPool
) -> Result<InternalTtsModelRecordRaw, sqlx::Error> {
  sqlx::query_as!(
      InternalTtsModelRecordRaw,
        r#"
SELECT
    tts.token as model_token,
    tts.tts_model_type,
    tts.text_pipeline_type,
    tts.text_preprocessing_algorithm,
    tts.maybe_default_pretrained_vocoder,

    tts.creator_user_token,
    users.username as creator_username,
    users.display_name as creator_display_name,
    users.email_gravatar_hash as creator_gravatar_hash,
    users.is_banned as creator_is_banned,

    tts.title,
    tts.description_markdown,
    tts.description_rendered_html,

    tts.ietf_language_tag,
    tts.ietf_primary_language_subtag,

    tts.is_front_page_featured,
    tts.is_twitch_featured,

    tts.maybe_suggested_unique_bot_command,

    tts.creator_set_visibility,

    tts.is_locked_from_use,
    tts.is_locked_from_user_modification,

    tts.created_at,
    tts.updated_at,

    tts.creator_ip_address_creation,
    tts.creator_ip_address_last_update,
    tts.mod_deleted_at,
    tts.user_deleted_at

FROM tts_models as tts
JOIN users
    ON users.token = tts.creator_user_token
WHERE
    tts.token = ?
    AND tts.user_deleted_at IS NULL
    AND tts.mod_deleted_at IS NULL
        "#,
      tts_model_token
    )
    .fetch_one(mysql_pool)
    .await // TODO: This will return error if it doesn't exist
}

#[derive(Serialize)]
struct InternalTtsModelRecordRaw {
  pub model_token: String,
  pub tts_model_type: String,
  pub text_pipeline_type: Option<String>,
  pub maybe_default_pretrained_vocoder: Option<String>,
  pub text_preprocessing_algorithm: String,

  pub creator_user_token: String,
  pub creator_username: String,
  pub creator_display_name: String,
  pub creator_gravatar_hash: String,
  pub creator_is_banned: i8,

  pub title: String,
  pub description_markdown: String,
  pub description_rendered_html: String,

  pub ietf_language_tag: String,
  pub ietf_primary_language_subtag: String,

  pub is_front_page_featured: i8,
  pub is_twitch_featured: i8,

  pub maybe_suggested_unique_bot_command: Option<String>,

  pub creator_set_visibility: String,

  pub is_locked_from_use: i8,
  pub is_locked_from_user_modification: i8,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,

  // Moderator fields
  pub creator_ip_address_creation: String,
  pub creator_ip_address_last_update: String,
  pub user_deleted_at: Option<DateTime<Utc>>,
  pub mod_deleted_at: Option<DateTime<Utc>>,
}
