use chrono::NaiveDateTime;
use container_common::anyhow_result::AnyhowResult;
use crate::helpers::numeric_converters::try_i64_to_u64_or_min;
use sqlx::MySqlPool;

#[derive(Clone)]
pub struct TtsQueueLengthResult {
  pub record_count: u64,
  pub present_time: NaiveDateTime,
}

struct QueryResultInternal {
  record_count: i64,
  present_time: NaiveDateTime,
}

pub async fn get_pending_tts_inference_job_count(
  pool: &MySqlPool,
) -> AnyhowResult<TtsQueueLengthResult> {
  // NB: We query the server timestamp so we can cache the results.
  // The frontend can then monotonically adjust the count based on timestamp by ignoring
  // past times.
  let result : QueryResultInternal = sqlx::query_as!(
      QueryResultInternal,
        r#"
SELECT
  count(*) as record_count,
  NOW() as present_time
FROM tts_inference_jobs
WHERE status IN ("pending", "started", "attempt_failed")
        "#,
    )
      .fetch_one(pool)
      .await?;

  Ok(TtsQueueLengthResult {
    record_count: try_i64_to_u64_or_min(result.record_count),
    present_time: result.present_time,
  })
}
