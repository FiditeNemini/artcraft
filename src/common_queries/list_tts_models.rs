use anyhow::anyhow;
use chrono::{DateTime, Utc};
use crate::util::anyhow_result::AnyhowResult;
use log::{warn, info};
use sqlx::MySqlPool;

#[derive(Serialize)]
pub struct TtsModelRecordForList {
  pub model_token: String,
  pub model_type: String,
  pub creator_user_token: String,
  pub creator_username: String,
  pub creator_display_name: String,
  pub updatable_slug: String,
  pub title: String,
  pub frame_width: u32,
  pub frame_height: u32,
  pub duration_millis: u32,
  pub maybe_image_object_name: Option<String>,
  pub maybe_video_object_name: Option<String>,
  pub is_mod_approved: bool, // converted
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

struct RawTtsModelRecordForList {
  pub model_token: String,
  pub model_type: String,
  pub creator_user_token: String,
  pub creator_username: String,
  pub creator_display_name: String,
  pub updatable_slug: String,
  pub title: String,
  pub frame_width: i32,
  pub frame_height: i32,
  pub duration_millis: i32,
  pub maybe_public_bucket_preview_image_object_name: Option<String>,
  pub maybe_public_bucket_preview_video_object_name: Option<String>,
  pub is_mod_approved: i8, // NB: needs conversion
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
    Ok(models) => {
      info!("Model length: {}", models.len());
      models
    },
    Err(err) => {
      warn!("Error: {:?}", err);

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
        model_type: model.model_type.clone(),
        creator_user_token: model.creator_user_token.clone(),
        creator_username: model.creator_username.clone(),
        creator_display_name: model.creator_display_name.clone(),
        updatable_slug: model.updatable_slug.clone(),
        title: model.title.clone(),
        frame_width: if model.frame_width > 0 { model.frame_width as u32 } else { 0 },
        frame_height: if model.frame_height  > 0 { model.frame_height as u32 } else { 0 },
        duration_millis: if model.duration_millis > 0 { model.duration_millis as u32 } else { 0 },
        maybe_image_object_name: model.maybe_public_bucket_preview_image_object_name.clone(),
        maybe_video_object_name: model.maybe_public_bucket_preview_video_object_name.clone(),
        is_mod_approved: if model.is_mod_approved == 0 { false } else { true },
        created_at: model.created_at.clone(),
        updated_at: model.updated_at.clone(),
      }
    })
    .collect::<Vec<TtsModelRecordForList>>())
}

async fn list_tts_models_for_all_creators(
  mysql_pool: &MySqlPool,
  require_mod_approved: bool
) -> AnyhowResult<Vec<RawTtsModelRecordForList>> {
  // TODO: There has to be a better way.
  //  Sqlx doesn't like anything except string literals.
  let maybe_models = if require_mod_approved {
    info!("listing tts models for everyone; mod-approved only");
    sqlx::query_as!(
      RawTtsModelRecordForList,
        r#"
SELECT
    tts.token as model_token,
    tts.model_type,
    tts.creator_user_token,
    users.username as creator_username,
    users.display_name as creator_display_name,
    tts.updatable_slug,
    tts.title,
    tts.frame_width,
    tts.frame_height,
    tts.duration_millis,
    tts.maybe_public_bucket_preview_image_object_name,
    tts.maybe_public_bucket_preview_video_object_name,
    tts.is_mod_approved,
    tts.created_at,
    tts.updated_at
FROM tts_models as tts
JOIN users
ON users.token = tts.creator_user_token
WHERE
    tts.deleted_at IS NULL
    AND tts.is_mod_approved IS TRUE
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
    tts.model_type,
    tts.creator_user_token,
    users.username as creator_username,
    users.display_name as creator_display_name,
    tts.updatable_slug,
    tts.title,
    tts.frame_width,
    tts.frame_height,
    tts.duration_millis,
    tts.maybe_public_bucket_preview_image_object_name,
    tts.maybe_public_bucket_preview_video_object_name,
    tts.is_mod_approved,
    tts.created_at,
    tts.updated_at
FROM tts_models as tts
JOIN users
ON users.token = tts.creator_user_token
WHERE
    tts.deleted_at IS NULL
        "#)
      .fetch_all(mysql_pool)
      .await?
  };

  Ok(maybe_models)
}

async fn list_tts_models_creator_scoped(
  mysql_pool: &MySqlPool,
  scope_creator_username: &str,
  require_mod_approved: bool
) -> AnyhowResult<Vec<RawTtsModelRecordForList>> {
  // TODO: There has to be a better way.
  //  Sqlx doesn't like anything except string literals.
  let maybe_models = if require_mod_approved {
    info!("listing tts models for user; mod-approved only");
    sqlx::query_as!(
      RawTtsModelRecordForList,
        r#"
SELECT
    tts.token as model_token,
    tts.model_type,
    tts.creator_user_token,
    users.username as creator_username,
    users.display_name as creator_display_name,
    tts.updatable_slug,
    tts.title,
    tts.frame_width,
    tts.frame_height,
    tts.duration_millis,
    tts.maybe_public_bucket_preview_image_object_name,
    tts.maybe_public_bucket_preview_video_object_name,
    tts.is_mod_approved,
    tts.created_at,
    tts.updated_at
FROM tts_models as tts
JOIN users
ON
    users.token = tts.creator_user_token
WHERE
    tts.deleted_at IS NULL
    AND tts.is_mod_approved IS TRUE
    AND users.username = ?
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
    tts.model_type,
    tts.creator_user_token,
    users.username as creator_username,
    users.display_name as creator_display_name,
    tts.updatable_slug,
    tts.title,
    tts.frame_width,
    tts.frame_height,
    tts.duration_millis,
    tts.maybe_public_bucket_preview_image_object_name,
    tts.maybe_public_bucket_preview_video_object_name,
    tts.is_mod_approved,
    tts.created_at,
    tts.updated_at
FROM tts_models as tts
JOIN users
ON
    users.token = tts.creator_user_token
WHERE
    tts.deleted_at IS NULL
    AND users.username = ?
        "#,
      scope_creator_username)
      .fetch_all(mysql_pool)
      .await?
  };

  Ok(maybe_models)
}
