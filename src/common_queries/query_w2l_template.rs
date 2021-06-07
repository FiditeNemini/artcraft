use anyhow::anyhow;
use chrono::{DateTime, Utc};
use crate::AnyhowResult;
use crate::database_helpers::boolean_converters::nullable_i8_to_optional_bool;
use crate::database_helpers::boolean_converters::i8_to_bool;
use derive_more::{Display, Error};
use log::{info, warn, log};
use regex::Regex;
use sqlx::MySqlPool;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::sync::Arc;

// TODO: This duplicates the get_w2l_template_handler.

#[derive(Serialize)]
pub struct W2lTemplateRecordForResponse {
  pub template_token: String,
  pub template_type: String,
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
  pub is_mod_public_listing_approved: Option<bool>,
  pub is_mod_disabled: bool,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
  pub deleted_at: Option<DateTime<Utc>>,
}

#[derive(Serialize)]
pub struct W2lTemplateRecordRaw {
  pub template_token: String,
  pub template_type: String,
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
  pub is_mod_public_listing_approved: Option<i8>,
  pub is_mod_disabled: i8,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
  pub deleted_at: Option<DateTime<Utc>>,
}


pub async fn select_w2l_template_by_token(
  w2l_template_token: &str,
  can_see_deleted: bool,
  mysql_pool: &MySqlPool
) -> AnyhowResult<Option<W2lTemplateRecordForResponse>> {

  let maybe_record = if can_see_deleted {
    select_including_deleted(w2l_template_token, mysql_pool).await
  } else {
    select_without_deleted(w2l_template_token, mysql_pool).await
  };

  let template : W2lTemplateRecordRaw = match maybe_record {
    Ok(template) => template,
    Err(ref err) => {
      match err {
        RowNotFound => {
          warn!("w2l template not found: {:?}", &err);
          return Ok(None);
        },
        _ => {
          warn!("w2l template query error: {:?}", &err);
          return Err(anyhow!("database error"));
        }
      }
    }
  };

  let template_for_response = W2lTemplateRecordForResponse {
    template_token: template.template_token.clone(),
    template_type: template.template_type.clone(),
    creator_user_token: template.creator_user_token.clone(),
    creator_username: template.creator_username.clone(),
    creator_display_name: template.creator_display_name.clone(),
    updatable_slug: template.updatable_slug.clone(),
    title: template.title.clone(),
    frame_width: if template.frame_width > 0 { template.frame_width as u32 } else { 0 },
    frame_height: if template.frame_height  > 0 { template.frame_height as u32 } else { 0 },
    duration_millis: if template.duration_millis > 0 { template.duration_millis as u32 } else { 0 },
    maybe_image_object_name: template.maybe_public_bucket_preview_image_object_name.clone(),
    maybe_video_object_name: template.maybe_public_bucket_preview_video_object_name.clone(),
    is_mod_public_listing_approved: nullable_i8_to_optional_bool(template.is_mod_public_listing_approved),
    is_mod_disabled: i8_to_bool(template.is_mod_disabled),
    created_at: template.created_at.clone(),
    updated_at: template.updated_at.clone(),
    deleted_at: template.deleted_at.clone(),
  };

  Ok(Some(template_for_response))
}

async fn select_including_deleted(
  w2l_template_token: &str,
  mysql_pool: &MySqlPool
) -> Result<W2lTemplateRecordRaw, sqlx::Error> {
  sqlx::query_as!(
      W2lTemplateRecordRaw,
        r#"
SELECT
    w2l.token as template_token,
    w2l.template_type,
    w2l.creator_user_token,
    users.username as creator_username,
    users.display_name as creator_display_name,
    w2l.updatable_slug,
    w2l.title,
    w2l.frame_width,
    w2l.frame_height,
    w2l.duration_millis,
    w2l.maybe_public_bucket_preview_image_object_name,
    w2l.maybe_public_bucket_preview_video_object_name,
    w2l.is_mod_approved as is_mod_public_listing_approved,
    w2l.is_mod_disabled,
    w2l.created_at,
    w2l.updated_at,
    w2l.deleted_at
FROM w2l_templates as w2l
JOIN users
ON users.token = w2l.creator_user_token
WHERE w2l.token = ?
        "#,
      w2l_template_token
    )
    .fetch_one(mysql_pool)
    .await // TODO: This will return error if it doesn't exist
}

async fn select_without_deleted(
  w2l_template_token: &str,
  mysql_pool: &MySqlPool
) -> Result<W2lTemplateRecordRaw, sqlx::Error> {
  sqlx::query_as!(
      W2lTemplateRecordRaw,
        r#"
SELECT
    w2l.token as template_token,
    w2l.template_type,
    w2l.creator_user_token,
    users.username as creator_username,
    users.display_name as creator_display_name,
    w2l.updatable_slug,
    w2l.title,
    w2l.frame_width,
    w2l.frame_height,
    w2l.duration_millis,
    w2l.maybe_public_bucket_preview_image_object_name,
    w2l.maybe_public_bucket_preview_video_object_name,
    w2l.is_mod_approved as is_mod_public_listing_approved,
    w2l.is_mod_disabled,
    w2l.created_at,
    w2l.updated_at,
    w2l.deleted_at
FROM w2l_templates as w2l
JOIN users
ON users.token = w2l.creator_user_token
WHERE w2l.token = ?
AND w2l.deleted_at IS NULL
        "#,
      w2l_template_token
    )
    .fetch_one(mysql_pool)
    .await // TODO: This will return error if it doesn't exist
}
