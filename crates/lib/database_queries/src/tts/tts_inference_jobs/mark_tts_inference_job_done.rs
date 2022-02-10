use container_common::anyhow_result::AnyhowResult;
use crate::tts::tts_inference_jobs::_keys::TtsInferenceJobId;
use sqlx::MySqlPool;
use sqlx;

pub async fn mark_tts_inference_job_done(
  pool: &MySqlPool,
  job_id: TtsInferenceJobId,
  success: bool,
  maybe_result_token: Option<&str>
) -> AnyhowResult<()> {
  let status = if success { "complete_success" } else { "complete_failure" };

  let query_result = sqlx::query!(
        r#"
UPDATE tts_inference_jobs
SET
  status = ?,
  on_success_result_token = ?,
  failure_reason = NULL,
  retry_at = NULL
WHERE id = ?
        "#,
        status,
        maybe_result_token,
        job_id.0
    )
      .execute(pool)
      .await?;

  Ok(())
}

