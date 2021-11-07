use anyhow::anyhow;
use chrono::{DateTime, Utc};
use crate::database::helpers::boolean_converters::i8_to_bool;
use crate::util::anyhow_result::AnyhowResult;
use log::{warn, info};
use sqlx::MySqlPool;

#[derive(Serialize)]
pub struct TtsModelRecordForList {
  pub model_token: String,
  pub tts_model_type: String,

  pub title: String,

  pub creator_user_token: String,
  pub creator_username: String,
  pub creator_display_name: String,
  pub creator_gravatar_hash: String,

  pub is_locked_from_use: bool, // converted

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

struct RawTtsModelRecordForList {
  pub model_token: String,
  pub tts_model_type: String,

  pub title: String,

  pub creator_user_token: String,
  pub creator_username: String,
  pub creator_display_name: String,
  pub creator_gravatar_hash: String,

  pub is_locked_from_use: i8, // NB: needs conversion

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

pub async fn list_tts_models(
  mysql_pool: &MySqlPool,
  scope_creator_username: Option<&str>,
  require_mod_approved: bool
) -> AnyhowResult<Vec<TtsModelRecordForList>> {

  let maybe_models = match scope_creator_username {
    Some(username) => {
      list_tts_models_creator_scoped(mysql_pool, username, require_mod_approved)
        .await
    },
    None => {
      list_tts_models_for_all_creators(mysql_pool, require_mod_approved)
        .await
    },
  };

  let models : Vec<RawTtsModelRecordForList> = match maybe_models {
    Ok(models) => models,
    Err(err) => {
      match err {
        RowNotFound => {
          return Ok(Vec::new());
        },
        _ => {
          warn!("tts model list query error: {:?}", err);
          return Err(anyhow!("tts model list query error"));
        }
      }
    }
  };

  Ok(models.into_iter()
    .map(|model| {
      TtsModelRecordForList {
        model_token: model.model_token.clone(),
        tts_model_type: model.tts_model_type.clone(),
        creator_user_token: model.creator_user_token.clone(),
        creator_username: model.creator_username.clone(),
        creator_display_name: model.creator_display_name.clone(),
        creator_gravatar_hash: model.creator_gravatar_hash.clone(),
        title: model.title.clone(),
        is_locked_from_use: i8_to_bool(model.is_locked_from_use),
        created_at: model.created_at.clone(),
        updated_at: model.updated_at.clone(),
      }
    })
    .collect::<Vec<TtsModelRecordForList>>())
}

async fn list_tts_models_for_all_creators(
  mysql_pool: &MySqlPool,
  allow_mod_disabled: bool
) -> AnyhowResult<Vec<RawTtsModelRecordForList>> {
  // TODO: There has to be a better way.
  //  Sqlx doesn't like anything except string literals.
  let maybe_models = if !allow_mod_disabled {
    info!("listing tts models for everyone; mod-approved only");
    sqlx::query_as!(
      RawTtsModelRecordForList,
        r#"
SELECT
    tts.token as model_token,
    tts.tts_model_type,
    tts.creator_user_token,
    users.username as creator_username,
    users.display_name as creator_display_name,
    users.email_gravatar_hash as creator_gravatar_hash,
    tts.title,
    tts.is_locked_from_use,
    tts.created_at,
    tts.updated_at
FROM tts_models as tts
JOIN users
    ON users.token = tts.creator_user_token
WHERE
    tts.is_locked_from_use IS FALSE
    AND tts.user_deleted_at IS NULL
    AND tts.mod_deleted_at IS NULL
        "#)
      .fetch_all(mysql_pool)
      .await?
  } else {
    info!("listing tts models for everyone; all");
    sqlx::query_as!(
      RawTtsModelRecordForList,
        r#"
SELECT
    tts.token as model_token,
    tts.tts_model_type,
    tts.creator_user_token,
    users.username as creator_username,
    users.display_name as creator_display_name,
    users.email_gravatar_hash as creator_gravatar_hash,
    tts.title,
    tts.is_locked_from_use,
    tts.created_at,
    tts.updated_at
FROM tts_models as tts
JOIN users
    ON users.token = tts.creator_user_token
WHERE
    tts.user_deleted_at IS NULL
    AND tts.mod_deleted_at IS NULL
        "#)
      .fetch_all(mysql_pool)
      .await?
  };

  Ok(maybe_models)
}

async fn list_tts_models_creator_scoped(
  mysql_pool: &MySqlPool,
  scope_creator_username: &str,
  allow_mod_disabled: bool
) -> AnyhowResult<Vec<RawTtsModelRecordForList>> {
  // TODO: There has to be a better way.
  //  Sqlx doesn't like anything except string literals.
  let maybe_models = if !allow_mod_disabled {
    info!("listing tts models for user; mod-approved only");
    sqlx::query_as!(
      RawTtsModelRecordForList,
        r#"
SELECT
    tts.token as model_token,
    tts.tts_model_type,
    tts.creator_user_token,
    users.username as creator_username,
    users.display_name as creator_display_name,
    users.email_gravatar_hash as creator_gravatar_hash,
    tts.title,
    tts.is_locked_from_use,
    tts.created_at,
    tts.updated_at
FROM tts_models as tts
JOIN users
ON
    users.token = tts.creator_user_token
WHERE
    users.username = ?
    AND tts.is_locked_from_use IS FALSE
    AND tts.user_deleted_at IS NULL
    AND tts.mod_deleted_at IS NULL
        "#,
      scope_creator_username)
      .fetch_all(mysql_pool)
      .await?
  } else {
    info!("listing tts models for user; all");
    sqlx::query_as!(
      RawTtsModelRecordForList,
        r#"
SELECT
    tts.token as model_token,
    tts.tts_model_type,
    tts.creator_user_token,
    users.username as creator_username,
    users.display_name as creator_display_name,
    users.email_gravatar_hash as creator_gravatar_hash,
    tts.title,
    tts.is_locked_from_use,
    tts.created_at,
    tts.updated_at
FROM tts_models as tts
JOIN users
ON
    users.token = tts.creator_user_token
WHERE
    users.username = ?
    AND tts.user_deleted_at IS NULL
    AND tts.mod_deleted_at IS NULL
        "#,
      scope_creator_username)
      .fetch_all(mysql_pool)
      .await?
  };

  Ok(maybe_models)
}
