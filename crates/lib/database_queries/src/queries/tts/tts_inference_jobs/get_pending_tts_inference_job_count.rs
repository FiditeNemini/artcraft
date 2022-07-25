use container_common::anyhow_result::AnyhowResult;
use crate::helpers::numeric_converters::try_i64_to_u64_or_min;
use sqlx::MySqlPool;

pub async fn get_pending_tts_inference_job_count(
  pool: &MySqlPool,
) -> AnyhowResult<u64> {
  let result : CountResult = sqlx::query_as!(
      CountResult,
        r#"
SELECT count(*) as record_count
FROM tts_inference_jobs
WHERE status IN ("pending", "started", "attempt_failed")
        "#,
    )
      .fetch_one(pool)
      .await?;

  Ok(try_i64_to_u64_or_min(result.record_count))
}

struct CountResult {
  record_count: i64,
}