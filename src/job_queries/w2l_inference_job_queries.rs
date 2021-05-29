//! NB: This seems required for sqlx to generate the cached queries.
//! Sqlx's prepare needs a *single* binary to work against, so we need to
//! include these in the main binary to generate all the queries.

use anyhow::anyhow;
use chrono::{Utc, DateTime};
use crate::util::anyhow_result::AnyhowResult;
use crate::util::random_crockford_token::random_crockford_token;
use crate::util::random_prefix_crockford_token::random_prefix_crockford_token;
use log::{warn, info};
use sqlx::MySqlPool;

/// table: w2l_template_upload_jobs
#[derive(Debug)]
pub struct W2lInferenceJobRecord {
  pub id: i64,
  pub inference_job_token: String,
  pub uuid_idempotency_token: String,

  // ===== FACE TEMPLATE OPTIONS =====
  pub maybe_w2l_template_token: Option<String>,
  pub maybe_public_image_bucket_location: Option<String>,

  // ===== AUDIO SOURCE OPTIONS =====
  pub maybe_tts_inference_result_token: Option<String>,
  pub maybe_public_audio_bucket_location: Option<String>,

  pub maybe_original_audio_filename: Option<String>,
  pub maybe_original_audio_download_url: Option<String>,
  pub maybe_audio_mime_type: Option<String>,

  pub creator_ip_address: String,
  pub maybe_creator_user_token: Option<String>,

  pub creator_set_visibility: String, // TODO
  pub disable_end_bump: i8, // bool
  pub disable_watermark: i8, // bool

  //pub maybe_subject_token: Option<String>,
  //pub maybe_actor_subject_token: Option<String>,
  pub status: String, // TODO
  pub attempt_count: i32,
  pub failure_reason: Option<String>,
  pub created_at: chrono::DateTime<Utc>,
  pub updated_at: chrono::DateTime<Utc>,
  pub retry_at: Option<chrono::DateTime<Utc>>,
}

pub async fn query_w2l_inference_job_records(pool: &MySqlPool, num_records: u32)
                                                   -> AnyhowResult<Vec<W2lInferenceJobRecord>>
{
  let job_records = sqlx::query_as!(
      W2lInferenceJobRecord,
        r#"
SELECT
  id,
  token AS inference_job_token,
  uuid_idempotency_token,

  maybe_w2l_template_token,
  maybe_public_image_bucket_location,
  maybe_tts_inference_result_token,
  maybe_public_audio_bucket_location,

  maybe_original_audio_filename,
  maybe_original_audio_download_url,
  maybe_audio_mime_type,

  creator_ip_address,
  maybe_creator_user_token,

  creator_set_visibility,
  disable_end_bump,
  disable_watermark,

  status,
  attempt_count,
  failure_reason,
  created_at,
  updated_at,
  retry_at
FROM w2l_inference_jobs
WHERE
  (
    status IN ("pending", "attempt_failed")
  )
  AND
  (
    retry_at IS NULL
    OR
    retry_at < CURRENT_TIMESTAMP
  )
  LIMIT ?
        "#,
      num_records,
    )
    .fetch_all(pool)
    .await?;

  Ok(job_records)
}

pub async fn mark_w2l_inference_job_failure(pool: &MySqlPool,
                                                  job: &W2lInferenceJobRecord,
                                                  failure_reason: &str)
                                                  -> AnyhowResult<()>
{
  // statuses: "attempt_failed", "complete_failure", "dead"
  let status = "attempt_failed";

  let query_result = sqlx::query!(
        r#"
UPDATE w2l_inference_jobs
SET
  status = ?,
  failure_reason = ?,
  retry_at = NOW() + interval 2 minute
WHERE id = ?
        "#,
        status,
        failure_reason.to_string(),
        job.id,
    )
    .execute(pool)
    .await?;

  Ok(())
}
pub async fn mark_w2l_inference_job_done(pool: &MySqlPool,
                                               job: &W2lInferenceJobRecord,
                                               success: bool)
                                               -> AnyhowResult<()>
{
  let status = if success { "complete_success" } else { "complete_failure" };

  let query_result = sqlx::query!(
        r#"
UPDATE w2l_inference_jobs
SET
  status = ?,
  failure_reason = NULL,
  retry_at = NULL
WHERE id = ?
        "#,
        status,
        job.id,
    )
    .execute(pool)
    .await?;

  Ok(())
}

pub async fn insert_w2l_result(pool: &MySqlPool,
                               template_type: &str, // TODO: ENUM!
                               job: &W2lInferenceJobRecord,
                               private_bucket_hash: &str,
                               private_bucket_object_name: &str,
                               private_bucket_cached_faces_object_name: &str,
                               maybe_image_preview_object_name: Option<&str>,
                               maybe_video_preview_object_name: Option<&str>,
                               file_size_bytes: u64,
                               maybe_mime_type: Option<&str>,
                               frame_width: u32,
                               frame_height: u32,
                               frame_count: u64,
                               fps: f32,
                               duration_millis: u64)
                               -> AnyhowResult<u64>
{
  /*let model_token = random_prefix_crockford_token("W2L_TPL:", 32)?;
  let updatable_slug = model_token.clone();

  let query_result = sqlx::query!(
        r#"
INSERT INTO w2l_templates
SET
  token = ?,
  template_type = ?,
  updatable_slug = ?,
  title = ?,
  description_markdown = '',
  description_rendered_html = '',
  creator_user_token = ?,
  creator_ip_address = ?,
  original_download_url = ?,
  private_bucket_hash = ?,
  private_bucket_object_name = ?,
  private_bucket_cached_faces_object_name = ?,
  maybe_public_bucket_preview_image_object_name = ?,
  maybe_public_bucket_preview_video_object_name = ?,
  file_size_bytes = ?,
  mime_type = ?,
  frame_width = ?,
  frame_height = ?,
  frame_count = ?,
  fps = ?,
  duration_millis = ?
        "#,
      model_token,
      template_type,
      updatable_slug,
      job.creator_ip_address.clone(),
      private_bucket_hash.to_string(),
      private_bucket_object_name.to_string(),
      private_bucket_cached_faces_object_name.to_string(),
      maybe_image_preview_object_name,
      maybe_video_preview_object_name,
      file_size_bytes,
      maybe_mime_type.unwrap_or(""),
      frame_width,
      frame_height,
      frame_count,
      fps,
      duration_millis
    )
    .execute(pool)
    .await;

  let record_id = match query_result {
    Ok(res) => {
      res.last_insert_id()
    },
    Err(err) => {
      // TODO: handle better
      return Err(anyhow!("Mysql error: {:?}", err));
    }
  };

  Ok(record_id)*/
  return Err(anyhow!("TODO"));
}

#[derive(Serialize)]
pub struct W2lTemplateRecord2 {
  pub template_token: String,
  pub template_type: String,
  pub creator_user_token: String,
  pub creator_username: String,
  pub private_bucket_hash: String,
  pub creator_display_name: String,
  pub updatable_slug: String,
  pub title: String,
  pub frame_width: i32,
  pub frame_height: i32,
  pub duration_millis: i32,
  pub maybe_public_bucket_preview_image_object_name: Option<String>,
  pub maybe_public_bucket_preview_video_object_name: Option<String>,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

pub async fn get_w2l_template_by_token(pool: &MySqlPool, template_token: &str)
  -> AnyhowResult<Option<W2lTemplateRecord2>>
{

  // NB: Lookup failure is Err(RowNotFound).
  // NB: Since this is publicly exposed, we don't query sensitive data.
  let maybe_template = sqlx::query_as!(
      W2lTemplateRecord2,
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
    w2l.private_bucket_hash,
    w2l.maybe_public_bucket_preview_image_object_name,
    w2l.maybe_public_bucket_preview_video_object_name,
    w2l.created_at,
    w2l.updated_at
FROM w2l_templates as w2l
JOIN users
ON users.token = w2l.creator_user_token
WHERE w2l.token = ?
AND w2l.deleted_at IS NULL
        "#,
      &template_token
    )
    .fetch_one(pool)
    .await; // TODO: This will return error if it doesn't exist

  match maybe_template {
    Ok(template) => Ok(Some(template)),
    Err(err) => {
      match err {
        RowNotFound => {
          Ok(None)
        },
        _ => {
          warn!("w2l template query error: {:?}", err);
          Err(anyhow!("Mysql error: {:?}", err))
        }
      }
    }
  }
}
