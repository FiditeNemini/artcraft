use chrono::NaiveDateTime;
use crate::helpers::numeric_converters::try_i64_to_u64_or_min;
use errors::AnyhowResult;
use sqlx::MySqlPool;

#[derive(Clone)]
pub struct UnifiedQueueStatsResult {
  pub generic_job_count: u64,
  pub legacy_tts_job_count: u64,
  pub present_time: NaiveDateTime,
}

struct QueryResultInternal {
  generic_job_count: Option<i64>,
  legacy_tts_job_count: Option<i64>,
  present_time: NaiveDateTime,
}

pub async fn get_unified_queue_stats(
  pool: &MySqlPool,
) -> AnyhowResult<UnifiedQueueStatsResult> {
  // NB (1): We query as a union since "started" jobs can get picked off mid-run and go stale
  // forever. We currently have no automated means of collecting those jobs.
  // NB (2): We query the server timestamp so we can cache the results.
  // The frontend can then monotonically adjust the count based on timestamp by ignoring
  // past times.
  let result : QueryResultInternal = sqlx::query_as!(
      QueryResultInternal,
        r#"
SELECT
  (
    SELECT
      COUNT(distinct token) as generic_job_count
    FROM
    (
      SELECT token
      FROM generic_inference_jobs
      WHERE status = "started"
      AND created_at > (CURDATE() - INTERVAL 5 MINUTE)
    UNION
      SELECT token
      FROM generic_inference_jobs
      WHERE status IN ("pending", "attempt_failed")
    ) as g
  ) as generic_job_count,
  (
    SELECT
      COUNT(distinct token) as legacy_tts_job_count
    FROM
    (
      SELECT token
      FROM tts_inference_jobs
      WHERE status = "started"
      AND created_at > (CURDATE() - INTERVAL 5 MINUTE)
    UNION
      SELECT token
      FROM tts_inference_jobs
      WHERE status IN ("pending", "attempt_failed")
    ) as t
  ) as legacy_tts_job_count,
  NOW() as present_time;
        "#,
    )
      .fetch_one(pool)
      .await?;

  Ok(UnifiedQueueStatsResult {
    generic_job_count: try_i64_to_u64_or_min(result.generic_job_count.unwrap_or(0)),
    legacy_tts_job_count: try_i64_to_u64_or_min(result.legacy_tts_job_count.unwrap_or(0)),
    present_time: result.present_time,
  })
}
