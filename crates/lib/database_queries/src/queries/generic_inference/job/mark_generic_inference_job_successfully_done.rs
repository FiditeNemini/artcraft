use anyhow::anyhow;
use container_common::anyhow_result::AnyhowResult;
use crate::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use sqlx::MySqlPool;

pub async fn mark_generic_inference_job_successfully_done(
  pool: &MySqlPool,
  job: &AvailableInferenceJob,
  maybe_entity_type: Option<&str>,
  maybe_entity_token: Option<&str>,
) -> AnyhowResult<()>
{
  let query_result = sqlx::query!(
        r#"
UPDATE generic_inference_jobs
SET
  status = "complete_success",
  on_success_result_entity_type = ?,
  on_success_result_entity_token = ?,
  failure_reason = NULL,
  internal_debugging_failure_reason = NULL,
  retry_at = NULL
WHERE id = ?
        "#,
        maybe_entity_type,
        maybe_entity_token,
        job.id.0,
    )
      .execute(pool)
      .await;

  match query_result {
    Err(err) => Err(anyhow!("error with query: {:?}", err)),
    Ok(_r) => Ok(()),
  }
}
