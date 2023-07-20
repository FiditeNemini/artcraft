use chrono::Utc;
use crate::column_types::job_status::JobStatus;
use crate::queries::generic_download::job::_keys::GenericDownloadJobId;
use enums::by_table::generic_download_jobs::generic_download_type::GenericDownloadType;
use enums::common::visibility::Visibility;
use errors::AnyhowResult;
use sqlx::MySqlPool;
use std::collections::BTreeSet;
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

pub async fn list_available_generic_download_jobs(pool: &MySqlPool, num_records: u32, download_types: &BTreeSet<GenericDownloadType>)
  -> AnyhowResult<Vec<AvailableDownloadJob>>
{

  let mut query = String::from(r#"
SELECT
  id,
  token AS `download_job_token: tokens::jobs::download::DownloadJobToken`,

  creator_user_token,
  creator_ip_address,
  creator_set_visibility as `creator_set_visibility: enums::common::visibility::Visibility`,

  download_type as `download_type: enums::by_table::generic_download_jobs::generic_download_type::GenericDownloadType`,
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
  "#);

  if let Some(clause) = download_type_clause(download_types) {
    query.push_str(" AND ");
    query.push_str(&clause);
    query.push_str(" ");
  }

  query.push_str(&format!(r#"
    ORDER BY id ASC
    LIMIT {}
  "#, num_records));

  let mut job_records = sqlx::query_as::<_, AvailableDownloadJobRawInternal>(&query)
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

fn download_type_clause(download_types: &BTreeSet<GenericDownloadType>) -> Option<String> {
  if download_types.is_empty() {
    return None;
  }

  let download_types = download_types.into_iter()
      .map(|download_type| download_type.to_str())
      .map(|download_type| format!("\"{}\"", download_type))
      .collect::<Vec<_>>()
      .join(", ");

  Some(format!("download_type IN ( {} )", download_types))
}

#[derive(Debug, sqlx::FromRow)]
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


#[cfg(test)]
mod tests {
  use std::collections::BTreeSet;
  use enums::by_table::generic_download_jobs::generic_download_type::GenericDownloadType;
  use crate::queries::generic_download::job::list_available_generic_download_jobs::download_type_clause;

  #[test]
  fn test_download_types_with_clause() {
    let clause = download_type_clause(&BTreeSet::from([GenericDownloadType::HifiGan, GenericDownloadType::RvcV2]));
    assert_eq!(clause.as_deref(), Some("download_type IN ( \"hifigan\", \"rvc_v2\" )"));
  }

  #[test]
  fn test_download_types_with_clause_absent() {
    let clause = download_type_clause(&BTreeSet::from([]));
    assert_eq!(clause, None);
  }
}
