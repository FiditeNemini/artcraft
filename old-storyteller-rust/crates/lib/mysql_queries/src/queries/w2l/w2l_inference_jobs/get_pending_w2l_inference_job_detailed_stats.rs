use anyhow::anyhow;
use sqlx::MySqlPool;

use errors::AnyhowResult;

#[derive(Debug)]
pub struct PendingCountResult {
  pub pending_count: Option<i64>,
  pub seconds_since_first: i64,
}

pub async fn get_pending_w2l_inference_job_detailed_stats(mysql_pool: &MySqlPool) -> AnyhowResult<Option<PendingCountResult>> {
  // NB: Lookup failure is Err(RowNotFound).
  let maybe_result = sqlx::query_as!(
      PendingCountResult,
        r#"
SELECT
  NOW() - t2.created_at AS seconds_since_first,
  (
    SELECT
      count(t1.id) as pending_count
    FROM w2l_inference_jobs AS t1
    WHERE t1.status = "pending"
  ) as pending_count
FROM w2l_inference_jobs AS t2
WHERE t2.status = "pending"
ORDER BY t2.id ASC
LIMIT 1
        "#,
    )
      .fetch_one(mysql_pool)
      .await;

  match maybe_result {
    Ok(result) => Ok(Some(result)),
    Err(ref err) => match err {
      sqlx::Error::RowNotFound => {
        // NB: Not Found for null results means nothing is pending in the queue (not an error!)
        Ok(None)
      },
      _ => {
        Err(anyhow!("get w2l pending count error: {:?}", err))
      }
    }
  }
}
