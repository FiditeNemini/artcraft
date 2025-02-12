use chrono::NaiveDateTime;
use sqlx::MySqlPool;

use errors::AnyhowResult;

use crate::helpers::numeric_converters::try_i64_to_u64_or_min;

#[derive(Serialize, Deserialize, Clone)]
pub struct QueueStatsRow {
  pub queue_type: String,
  pub pending_job_count: u64,
  pub present_time: NaiveDateTime,
}

struct QueueStatsRowInternal {
  queue_type: Option<String>, // FIXME: Shouldn't be nullable
  pending_job_count: i64,
  present_time: NaiveDateTime,
}

// NB: Returning Option<T> is a hack to fit with outer Redis caching.
// I'm only doing this because I'm in a hurry. Don't do this.
pub async fn get_unified_queue_stats(
  pool: &MySqlPool,
) -> AnyhowResult<Vec<QueueStatsRow>> {
  // NB (1): We query as a union since "started" jobs can get picked off mid-run and go stale
  // forever. We currently have no automated means of collecting those jobs.
  // NB (2): We query the server timestamp so we can cache the results.
  // The frontend can then monotonically adjust the count based on timestamp by ignoring
  // past times.
  let rows : Vec<QueueStatsRowInternal> = sqlx::query_as!(
      QueueStatsRowInternal,
        r#"
SELECT
    job_type as queue_type,
    count(*) as pending_job_count,
    NOW() as present_time
 FROM (
    SELECT
        token,
        job_type
    FROM generic_inference_jobs
    WHERE status IN ("pending", "attempt_failed")
    AND job_type IS NOT NULL
    UNION
    SELECT
        token,
        job_type
    FROM generic_inference_jobs
    WHERE status IN ("started")
    AND created_at > (CURDATE() - INTERVAL 15 MINUTE)
    AND job_type IS NOT NULL
) as generic_inner
GROUP BY queue_type
        "#,
    )
      .fetch_all(pool)
      .await?;

  Ok(rows.into_iter().map(|row|
    QueueStatsRow {
      queue_type: row.queue_type.unwrap_or_else(|| "unknown".to_string()),
      pending_job_count: try_i64_to_u64_or_min(row.pending_job_count),
      present_time: row.present_time,
  }).collect::<Vec<_>>())
}
