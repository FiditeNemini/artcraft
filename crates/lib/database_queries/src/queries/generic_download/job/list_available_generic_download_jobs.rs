use anyhow::anyhow;
use chrono::Utc;
use container_common::anyhow_result::AnyhowResult;
use crate::column_types::job_status::JobStatus;
use crate::queries::generic_download::job::_keys::GenericDownloadJobId;
use crate::tokens::Tokens;
use enums::core::visibility::Visibility;
use reusable_types::db::enums::generic_download_type::GenericDownloadType;
use sqlx::MySqlPool;
use std::path::Path;
use tokens::jobs::download::DownloadJobToken;

/// table: generic_download_jobs
#[derive(Debug)]
pub struct AvailableDownloadJob {
  pub id: GenericDownloadJobId,
  pub download_job_token: DownloadJobToken,

  pub creator_user_token: String,
  pub creator_ip_address: String,
  pub creator_set_visibility: Visibility,

  pub download_type: GenericDownloadType,
  pub download_url: String,
  pub title: String,

  pub status: JobStatus,
  pub attempt_count: i32,
  pub failure_reason: Option<String>,

  pub created_at: chrono::DateTime<Utc>,
  pub updated_at: chrono::DateTime<Utc>,
  pub retry_at: Option<chrono::DateTime<Utc>>,
}

pub async fn list_available_generic_download_jobs(pool: &MySqlPool, num_records: u32)
  -> AnyhowResult<Vec<AvailableDownloadJob>>
{
  let job_records = sqlx::query_as!(
      AvailableDownloadJobRawInternal,
        r#"
SELECT
  id,
  token AS `download_job_token: tokens::jobs::download::DownloadJobToken`,

  creator_user_token,
  creator_ip_address,
  creator_set_visibility as `creator_set_visibility: enums::core::visibility::Visibility`,

  download_type as `download_type: reusable_types::db::enums::generic_download_type::GenericDownloadType`,
  download_url,
  title,

  status as `status: crate::column_types::job_status::JobStatus`,
  attempt_count,
  failure_reason,

  created_at,
  updated_at,
  retry_at
FROM generic_download_jobs
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
  ORDER BY id ASC
  LIMIT ?
        "#,
      num_records,
    )
      .fetch_all(pool)
      .await?;

  let job_records = job_records.into_iter()
      .map(|record : AvailableDownloadJobRawInternal| {
        AvailableDownloadJob {
          id: GenericDownloadJobId(record.id),
          download_job_token: record.download_job_token,
          creator_ip_address: record.creator_ip_address,
          creator_user_token: record.creator_user_token,
          creator_set_visibility: record.creator_set_visibility,
          download_type: record.download_type,
          download_url: record.download_url,
          title: record.title,
          status: record.status,
          attempt_count: record.attempt_count,
          failure_reason: record.failure_reason,
          created_at: record.created_at,
          updated_at: record.updated_at,
          retry_at: record.retry_at,
        }
      })
      .collect::<Vec<AvailableDownloadJob>>();

  Ok(job_records)
}

#[derive(Debug)]
struct AvailableDownloadJobRawInternal {
  pub id: i64,
  pub download_job_token: DownloadJobToken,

  pub creator_user_token: String,
  pub creator_ip_address: String,
  pub creator_set_visibility: Visibility,

  pub download_type: GenericDownloadType,
  pub download_url: String,
  pub title: String,

  pub status: JobStatus,
  pub attempt_count: i32,
  pub failure_reason: Option<String>,

  pub created_at: chrono::DateTime<Utc>,
  pub updated_at: chrono::DateTime<Utc>,
  pub retry_at: Option<chrono::DateTime<Utc>>,
}
