//! NB: This seems required for sqlx to generate the cached queries.
//! Sqlx's prepare needs a *single* binary to work against, so we need to
//! include these in the main binary to generate all the queries.

use chrono::Utc;
use crate::util::anyhow_result::AnyhowResult;
use sqlx::MySqlPool;

/// table: tts_model_upload_jobs
#[derive(Debug)]
pub struct TtsUploadJobRecord {
  pub id: i64,
  pub uuid_idempotency_token: String,
  pub creator_user_token: String,
  pub creator_ip_address: String,
  pub creator_set_visibility: String, // TODO
  pub title: String,
  pub tts_model_type: String, // TODO
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

pub async fn query_tts_upload_job_records(pool: &MySqlPool) -> AnyhowResult<Vec<TtsUploadJobRecord>> {
  let job_records = sqlx::query_as!(
      TtsUploadJobRecord,
        r#"
SELECT *
FROM tts_model_upload_jobs
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
  LIMIT 20
        "#,
    )
    .fetch_all(pool)
    .await?;

  Ok(job_records)
}
