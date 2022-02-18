use anyhow::anyhow;
use container_common::anyhow_result::AnyhowResult;
use crate::tts::tts_inference_jobs::_keys::TtsInferenceJobId;
use sqlx::MySqlPool;
use sqlx;

/// Mark a TTS job as dead ("do not ever retry").
pub async fn mark_tts_inference_job_permanently_dead(
  pool: &MySqlPool,
  job_id: TtsInferenceJobId,
  failure_reason: &str,
) -> AnyhowResult<()> {
  let query_result = sqlx::query!(
        r#"
UPDATE tts_inference_jobs
SET
  status = "dead",
  failure_reason = ?,
  retry_at = NULL
WHERE id = ?
        "#,
        failure_reason.to_string(),
        job_id.0,
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
