//! NB: This seems required for sqlx to generate the cached queries.
//! Sqlx's prepare needs a *single* binary to work against, so we need to
//! include these in the main binary to generate all the queries.

use anyhow::anyhow;
use chrono::Utc;
use crate::util::anyhow_result::AnyhowResult;
use crate::util::random_token::random_token;
use sqlx::MySqlPool;

/// table: w2l_template_upload_jobs
#[derive(Debug)]
pub struct W2lTemplateUploadJobRecord {
  pub id: i64,
  pub uuid_idempotency_token: String,
  pub creator_user_token: String,
  pub creator_ip_address: String,
  pub creator_set_visibility: String, // TODO
  pub title: String,
  pub template_type: String, // TODO
  pub maybe_subject_token: Option<String>,
  pub maybe_actor_subject_token: Option<String>,
  pub download_url: Option<String>,
  pub download_url_type: String, // TODO
  pub status: String, // TODO
  pub attempt_count: i32,
  pub failure_reason: Option<String>,
  pub created_at: chrono::DateTime<Utc>,
  pub updated_at: chrono::DateTime<Utc>,
  pub retry_at: Option<chrono::DateTime<Utc>>,
}

pub async fn query_w2l_template_upload_job_records(pool: &MySqlPool, num_records: u32)
  -> AnyhowResult<Vec<W2lTemplateUploadJobRecord>>
{
  let job_records = sqlx::query_as!(
      W2lTemplateUploadJobRecord,
        r#"
SELECT *
FROM w2l_template_upload_jobs
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

pub async fn mark_w2l_template_upload_job_failure(pool: &MySqlPool,
                                                  job: &W2lTemplateUploadJobRecord,
                                                  failure_reason: &str)
  -> AnyhowResult<()>
{
  // statuses: "attempt_failed", "complete_failure", "dead"
  let status = "attempt_failed";

  let query_result = sqlx::query!(
        r#"
UPDATE w2l_template_upload_jobs
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
pub async fn mark_w2l_template_upload_job_done(pool: &MySqlPool,
                                               job: &W2lTemplateUploadJobRecord,
                                               success: bool)
  -> AnyhowResult<()>
{
  let status = if success { "complete_success" } else { "complete_failure" };

  let query_result = sqlx::query!(
        r#"
UPDATE w2l_template_upload_jobs
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

pub async fn insert_w2l_template(pool: &MySqlPool,
                                 template_type: &str, // TODO: ENUM!
                                 job: &W2lTemplateUploadJobRecord,
                                 private_bucket_hash: &str,
                                 private_bucket_object_name: &str,
                                 private_bucket_cached_faces_object_name: &str,
                                 maybe_image_preview_object_name: Option<&str>,
                                 maybe_video_preview_object_name: Option<&str>,
                                 frame_width: u32,
                                 frame_height: u32,
                                 frame_count: u64,
                                 fps: f32,
                                 duration_millis: u64)
  -> AnyhowResult<u64>
{
  let model_token = random_token(32);
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
  public_bucket_hash = 'TODO',
  public_bucket_object_name = 'TODO',
  maybe_private_bucket_preview_image_object_name = ?,
  maybe_private_bucket_preview_video_object_name = ?,
  frame_width = ?,
  frame_height = ?,
  frame_count = ?,
  fps = ?,
  duration_millis = ?
        "#,
      model_token,
      template_type,
      updatable_slug,
      job.title.to_string(),
      job.creator_user_token.clone(),
      job.creator_ip_address.clone(),
      job.download_url.clone(),
      private_bucket_hash.to_string(),
      private_bucket_object_name.to_string(),
      private_bucket_cached_faces_object_name.to_string(),
      maybe_image_preview_object_name,
      maybe_video_preview_object_name,
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

  Ok(record_id)
}
