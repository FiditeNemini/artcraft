use anyhow::anyhow;
use container_common::anyhow_result::AnyhowResult;
use crate::tts::tts_inference_jobs::list_available_tts_inference_jobs::AvailableTtsInferenceJob;
use sqlx::MySqlPool;
use sqlx;

// TODO: Rerun time shouldn't be 1-minute!

/// Mark a single inference failure. The job may be re-run.
pub async fn mark_tts_inference_job_failure(
  pool: &MySqlPool,
  job: &AvailableTtsInferenceJob,
  failure_reason: &str,
  max_attempts: i32
) -> AnyhowResult<()> {

  // statuses: "attempt_failed", "complete_failure", "dead"
  let mut next_status = "attempt_failed";

  if job.attempt_count >= max_attempts {
    // NB: Job attempt count is incremented at start
    next_status = "dead";
  }

  let query_result = sqlx::query!(
        r#"
UPDATE tts_inference_jobs
SET
  status = ?,
  failure_reason = ?,
  retry_at = NOW() + interval 1 minute
WHERE id = ?
        "#,
        next_status,
        failure_reason.to_string(),
        job.id.0,
    )
      .execute(pool)
      .await;

  match query_result {
    Err(err) => {
      Err(anyhow!("error with query: {:?}", err))
    },
    Ok(_r) => Ok(()),
  }
}
