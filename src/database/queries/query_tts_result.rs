use anyhow::anyhow;
use chrono::{DateTime, Utc};
use crate::AnyhowResult;
use crate::database::helpers::boolean_converters::i8_to_bool;
use crate::database::helpers::boolean_converters::nullable_i8_to_optional_bool;
use derive_more::{Display, Error};
use log::{info, warn, log};
use regex::Regex;
use sqlx::MySqlPool;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::sync::Arc;
use crate::database::helpers::enums::CreatorSetVisibility;
use crate::database::enums::record_visibility::RecordVisibility;

#[derive(Serialize)]
pub struct TtsResultRecordForResponse {
  pub tts_result_token: String,
  pub raw_inference_text: String,

  pub tts_model_token: String,
  pub tts_model_title: Option<String>, // TODO: Shouldn't be Option.

  pub maybe_creator_user_token: Option<String>,
  pub maybe_creator_username: Option<String>,
  pub maybe_creator_display_name: Option<String>,
  pub maybe_creator_gravatar_hash: Option<String>,

  pub maybe_model_creator_user_token: Option<String>,
  pub maybe_model_creator_username: Option<String>,
  pub maybe_model_creator_display_name: Option<String>,
  pub maybe_model_creator_gravatar_hash: Option<String>,

  pub public_bucket_wav_audio_path: String,
  pub public_bucket_spectrogram_path: String,

  pub creator_set_visibility: RecordVisibility,

  pub file_size_bytes: u32,
  pub duration_millis: u32,

  //pub model_is_mod_approved: bool, // converted
  //pub maybe_mod_user_token: Option<String>,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,

  pub maybe_moderator_fields: Option<TtsResultModeratorFields>,
}

/// "Moderator-only fields" that we wouldn't want to expose to ordinary users.
/// It's the web endpoint controller's responsibility to clear these for non-mods.
#[derive(Serialize)]
pub struct TtsResultModeratorFields {
  pub creator_ip_address: String,
  pub user_deleted_at: Option<DateTime<Utc>>,
  pub mod_deleted_at: Option<DateTime<Utc>>,
}

#[derive(Serialize)]
pub struct TtsResultRecordRaw {
  pub tts_result_token: String, // from field `tts_results.token`
  pub raw_inference_text: String,

  pub tts_model_token: String,
  pub tts_model_title: Option<String>,

  pub maybe_creator_user_token: Option<String>,
  pub maybe_creator_username: Option<String>,
  pub maybe_creator_display_name: Option<String>,
  pub maybe_creator_gravatar_hash: Option<String>,

  pub maybe_model_creator_user_token: Option<String>,
  pub maybe_model_creator_username: Option<String>,
  pub maybe_model_creator_display_name: Option<String>,
  pub maybe_model_creator_gravatar_hash: Option<String>,

  pub public_bucket_wav_audio_path: String,
  pub public_bucket_spectrogram_path: String,

  pub creator_set_visibility: String,

  pub file_size_bytes: i32,
  pub duration_millis: i32,

  //pub model_is_mod_approved: i8, // needs convert
  //pub maybe_mod_user_token: Option<String>,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,

  // Moderator fields
  pub creator_ip_address: String,
  pub user_deleted_at: Option<DateTime<Utc>>,
  pub mod_deleted_at: Option<DateTime<Utc>>,
}

pub async fn select_tts_result_by_token(
  tts_result_token: &str,
  can_see_deleted: bool,
  mysql_pool: &MySqlPool
) -> AnyhowResult<Option<TtsResultRecordForResponse>> {

  let maybe_record = if can_see_deleted {
    select_including_deleted(tts_result_token, mysql_pool).await
  } else {
    select_without_deleted(tts_result_token, mysql_pool).await
  };

  let ir : TtsResultRecordRaw = match maybe_record {
    Ok(inference_result) => inference_result,
    Err(ref err) => {
      match err {
        RowNotFound => {
          warn!("tts result not found: {:?}", &err);
          return Ok(None);
        },
        _ => {
          warn!("tts result query error: {:?}", &err);
          return Err(anyhow!("database error"));
        }
      }
    }
  };

  let ir_for_response = TtsResultRecordForResponse {
    tts_result_token: ir.tts_result_token.clone(),

    raw_inference_text: ir.raw_inference_text.clone(),

    tts_model_token: ir.tts_model_token.clone(),
    tts_model_title: ir.tts_model_title.clone(),

    maybe_creator_user_token: ir.maybe_creator_user_token.clone(),
    maybe_creator_username: ir.maybe_creator_username.clone(),
    maybe_creator_display_name: ir.maybe_creator_display_name.clone(),
    maybe_creator_gravatar_hash: ir.maybe_creator_gravatar_hash.clone(),

    maybe_model_creator_user_token: ir.maybe_model_creator_user_token.clone(),
    maybe_model_creator_username: ir.maybe_model_creator_username.clone(),
    maybe_model_creator_display_name: ir.maybe_model_creator_display_name.clone(),
    maybe_model_creator_gravatar_hash: ir.maybe_model_creator_gravatar_hash.clone(),

    //model_is_mod_approved: if ir.model_is_mod_approved == 0 { false } else { true },

    public_bucket_wav_audio_path: ir.public_bucket_wav_audio_path.clone(),
    public_bucket_spectrogram_path: ir.public_bucket_spectrogram_path.clone(),

    // NB: Fail open/public since we're already looking at it
    creator_set_visibility: RecordVisibility::from_str(&ir.creator_set_visibility)
        .unwrap_or(RecordVisibility::Public),

    file_size_bytes: if ir.file_size_bytes > 0 { ir.file_size_bytes as u32 } else { 0 },
    duration_millis: if ir.duration_millis > 0 { ir.duration_millis as u32 } else { 0 },

    created_at: ir.created_at.clone(),
    updated_at: ir.updated_at.clone(),

    maybe_moderator_fields: Some(TtsResultModeratorFields {
      creator_ip_address: ir.creator_ip_address.clone(),
      user_deleted_at: ir.user_deleted_at.clone(),
      mod_deleted_at: ir.mod_deleted_at.clone(),
    }),
  };

  Ok(Some(ir_for_response))
}

async fn select_including_deleted(
  tts_result_token: &str,
  mysql_pool: &MySqlPool
) -> Result<TtsResultRecordRaw, sqlx::Error> {
  sqlx::query_as!(
      TtsResultRecordRaw,
        r#"
SELECT
    tts_results.token as tts_result_token,

    tts_results.raw_inference_text,

    tts_results.model_token as tts_model_token,
    tts_models.title as tts_model_title,

    users.token as maybe_creator_user_token,
    users.username as maybe_creator_username,
    users.display_name as maybe_creator_display_name,
    users.email_gravatar_hash as maybe_creator_gravatar_hash,

    model_users.token as maybe_model_creator_user_token,
    model_users.username as maybe_model_creator_username,
    model_users.display_name as maybe_model_creator_display_name,
    model_users.email_gravatar_hash as maybe_model_creator_gravatar_hash,

    tts_results.public_bucket_wav_audio_path,
    tts_results.public_bucket_spectrogram_path,

    tts_results.creator_set_visibility,

    tts_results.file_size_bytes,
    tts_results.duration_millis,
    tts_results.created_at,
    tts_results.updated_at,

    tts_results.creator_ip_address,
    tts_results.user_deleted_at,
    tts_results.mod_deleted_at

FROM tts_results
LEFT OUTER JOIN tts_models
  ON tts_results.model_token = tts_models.token
LEFT OUTER JOIN users
  ON tts_results.maybe_creator_user_token = users.token
LEFT OUTER JOIN users as model_users
  ON tts_models.creator_user_token = model_users.token
WHERE
    tts_results.token = ?
        "#,
      tts_result_token
    )
    .fetch_one(mysql_pool)
    .await // TODO: This will return error if it doesn't exist
}

async fn select_without_deleted(
  tts_result_token: &str,
  mysql_pool: &MySqlPool
) -> Result<TtsResultRecordRaw, sqlx::Error> {
  sqlx::query_as!(
      TtsResultRecordRaw,
        r#"
SELECT
    tts_results.token as tts_result_token,

    tts_results.raw_inference_text,

    tts_results.model_token as tts_model_token,
    tts_models.title as tts_model_title,

    users.token as maybe_creator_user_token,
    users.username as maybe_creator_username,
    users.display_name as maybe_creator_display_name,
    users.email_gravatar_hash as maybe_creator_gravatar_hash,

    model_users.token as maybe_model_creator_user_token,
    model_users.username as maybe_model_creator_username,
    model_users.display_name as maybe_model_creator_display_name,
    model_users.email_gravatar_hash as maybe_model_creator_gravatar_hash,

    tts_results.public_bucket_wav_audio_path,
    tts_results.public_bucket_spectrogram_path,

    tts_results.creator_set_visibility,

    tts_results.file_size_bytes,
    tts_results.duration_millis,
    tts_results.created_at,
    tts_results.updated_at,

    tts_results.creator_ip_address,
    tts_results.user_deleted_at,
    tts_results.mod_deleted_at

FROM tts_results
LEFT OUTER JOIN tts_models
  ON tts_results.model_token = tts_models.token
LEFT OUTER JOIN users
  ON tts_results.maybe_creator_user_token = users.token
LEFT OUTER JOIN users as model_users
  ON tts_models.creator_user_token = model_users.token
WHERE
    tts_results.token = ?
    AND tts_results.user_deleted_at IS NULL
    AND tts_results.mod_deleted_at IS NULL
        "#,
      tts_result_token
    )
    .fetch_one(mysql_pool)
    .await // TODO: This will return error if it doesn't exist
}
