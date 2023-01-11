use anyhow::anyhow;
use container_common::anyhow_result::AnyhowResult;
use crate::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use sqlx::MySqlPool;

pub async fn mark_generic_inference_job_completely_failed(
  pool: &MySqlPool,
  job: &AvailableInferenceJob,
  maybe_public_failure_reason: Option<&str>,
  maybe_internal_debugging_failure_reason: Option<&str>,
) -> AnyhowResult<()>
{
  let query_result = sqlx::query!(
        r#"
UPDATE generic_inference_jobs
SET
  status = "complete_failure",
  failure_reason = ?,
  internal_debugging_failure_reason = ?,
  retry_at = NULL
WHERE id = ?
        "#,
        maybe_public_failure_reason,
        maybe_internal_debugging_failure_reason,
        job.id.0,
    )
      .execute(pool)
      .await;

  match query_result {
    Err(err) => Err(anyhow!("error with query: {:?}", err)),
    Ok(_r) => Ok(()),
  }
}
