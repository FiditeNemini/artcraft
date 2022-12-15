use anyhow::anyhow;
use container_common::anyhow_result::AnyhowResult;
use crate::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use sqlx::MySqlPool;
use sqlx;

/// Mark a single inference job failure. The job may be re-run.
pub async fn mark_generic_inference_job_failure(
  pool: &MySqlPool,
  job: &AvailableInferenceJob,
  failure_reason: &str,
  internal_debugging_failure_reason: &str,
  max_attempts: u16
) -> AnyhowResult<()> {

  // statuses: "attempt_failed", "complete_failure", "dead"
  let mut next_status = "attempt_failed";

  if job.attempt_count >= max_attempts {
    // NB: Job attempt count is incremented at start
    next_status = "dead";
  }

  let query_result = sqlx::query!(
        r#"
UPDATE generic_inference_jobs
SET
  status = ?,
  failure_reason = ?,
  internal_debugging_failure_reason = ?,
  retry_at = NOW() + interval 2 minute
WHERE id = ?
        "#,
        next_status,
        failure_reason,
        internal_debugging_failure_reason,
        job.id.0,
    )
      .execute(pool)
      .await;

  match query_result {
    Err(err) => Err(anyhow!("error with query: {:?}", err)),
    Ok(_r) => Ok(()),
  }
}
