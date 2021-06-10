use anyhow::anyhow;
use chrono::{DateTime, Utc};
use crate::AnyhowResult;
use crate::database_helpers::boolean_converters::i8_to_bool;
use crate::database_helpers::boolean_converters::nullable_i8_to_optional_bool;
use derive_more::{Display, Error};
use log::{info, warn, log};
use regex::Regex;
use sqlx::MySqlPool;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::sync::Arc;

#[derive(Serialize)]
pub struct TtsModelRecordForResponse {
  pub model_token: String,
  pub tts_model_type: String,
  pub creator_user_token: String,
  pub creator_username: String,
  pub creator_display_name: String,
  pub updatable_slug: String,
  pub title: String,
  pub description_markdown: String,
  pub description_rendered_html: String,
  pub is_mod_disabled: bool,
  pub is_locked_from_user_modification: bool,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
  pub user_deleted_at: Option<DateTime<Utc>>,
  pub mod_deleted_at: Option<DateTime<Utc>>,
}

#[derive(Serialize)]
pub struct TtsModelRecordRaw {
  pub model_token: String,
  pub tts_model_type: String,
  pub creator_user_token: String,
  pub creator_username: String,
  pub creator_display_name: String,
  pub updatable_slug: String,
  pub title: String,
  pub description_markdown: String,
  pub description_rendered_html: String,
  pub is_mod_disabled: i8,
  pub is_locked_from_user_modification: i8,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
  pub user_deleted_at: Option<DateTime<Utc>>,
  pub mod_deleted_at: Option<DateTime<Utc>>,
}

pub async fn select_tts_model_by_token(
  tts_model_token: &str,
  can_see_deleted: bool,
  mysql_pool: &MySqlPool
) -> AnyhowResult<Option<TtsModelRecordForResponse>> {

  let maybe_record = if can_see_deleted {
    select_including_deleted(tts_model_token, mysql_pool).await
  } else {
    select_without_deleted(tts_model_token, mysql_pool).await
  };

  let model : TtsModelRecordRaw = match maybe_record {
    Ok(model) => model,
    Err(ref err) => {
      match err {
        RowNotFound => {
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

  let model_for_response = TtsModelRecordForResponse {
    model_token: model.model_token.clone(),
    tts_model_type: model.tts_model_type.clone(),
    creator_user_token: model.creator_user_token.clone(),
    creator_username: model.creator_username.clone(),
    creator_display_name: model.creator_display_name.clone(),
    updatable_slug: model.updatable_slug.clone(),
    title: model.title.clone(),
    description_markdown: model.description_markdown.clone(),
    description_rendered_html: model.description_rendered_html.clone(),
    is_mod_disabled: i8_to_bool(model.is_mod_disabled),
    is_locked_from_user_modification: i8_to_bool(model.is_locked_from_user_modification),
    created_at: model.created_at.clone(),
    updated_at: model.updated_at.clone(),
    user_deleted_at: model.user_deleted_at.clone(),
    mod_deleted_at: model.mod_deleted_at.clone(),
  };

  Ok(Some(model_for_response))
}

async fn select_including_deleted(
  tts_model_token: &str,
  mysql_pool: &MySqlPool
) -> Result<TtsModelRecordRaw, sqlx::Error> {
  sqlx::query_as!(
      TtsModelRecordRaw,
        r#"
SELECT
    tts.token as model_token,
    tts.tts_model_type,
    tts.creator_user_token,
    users.username as creator_username,
    users.display_name as creator_display_name,
    tts.updatable_slug,
    tts.title,
    tts.description_markdown,
    tts.description_rendered_html,
    tts.is_mod_disabled,
    tts.is_locked_from_user_modification,
    tts.created_at,
    tts.updated_at,
    tts.user_deleted_at,
    tts.mod_deleted_at
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
) -> Result<TtsModelRecordRaw, sqlx::Error> {
  sqlx::query_as!(
      TtsModelRecordRaw,
        r#"
SELECT
    tts.token as model_token,
    tts.tts_model_type,
    tts.creator_user_token,
    users.username as creator_username,
    users.display_name as creator_display_name,
    tts.updatable_slug,
    tts.title,
    tts.description_markdown,
    tts.description_rendered_html,
    tts.is_mod_disabled,
    tts.is_locked_from_user_modification,
    tts.created_at,
    tts.updated_at,
    tts.user_deleted_at,
    tts.mod_deleted_at
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
