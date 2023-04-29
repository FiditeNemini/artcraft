use anyhow::anyhow;
use errors::AnyhowResult;
use crate::queries::generic_download::job::list_available_generic_download_jobs::AvailableDownloadJob;
use sqlx::MySqlPool;

pub async fn mark_generic_download_job_done(
  pool: &MySqlPool,
  job: &AvailableDownloadJob,
  success: bool,
  maybe_entity_token: Option<&str>,
  maybe_entity_type: Option<&str>,
) -> AnyhowResult<()>
{
  let query_result = if success {
    sqlx::query!(
        r#"
UPDATE generic_download_jobs
SET
  status = "complete_success",
  on_success_downloaded_entity_token = ?,
  on_success_downloaded_entity_type = ?,
  failure_reason = NULL,
  retry_at = NULL,
  successfully_completed_at = NOW()
WHERE id = ?
        "#,
        maybe_entity_token,
        maybe_entity_type,
        job.id.0,
    )
        .execute(pool)
        .await
  } else {
    sqlx::query!(
        r#"
UPDATE generic_download_jobs
SET
  status = "complete_failure",
  on_success_downloaded_entity_token = ?,
  on_success_downloaded_entity_type = ?,
  failure_reason = NULL,
  retry_at = NULL
WHERE id = ?
        "#,
        maybe_entity_token,
        maybe_entity_type,
        job.id.0,
    )
        .execute(pool)
        .await
  };

  match query_result {
    Err(err) => Err(anyhow!("error with query: {:?}", err)),
    Ok(_r) => Ok(()),
  }
}
