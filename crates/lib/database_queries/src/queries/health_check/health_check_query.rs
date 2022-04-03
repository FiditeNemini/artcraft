use anyhow::anyhow;
use chrono::{Utc, DateTime, NaiveDateTime};
use container_common::anyhow_result::AnyhowResult;
use sqlx::MySqlPool;

/// This just queries for current time. If it fails, we know the connection pool is dead.
pub struct HealthCheckResult {
  pub present_time: NaiveDateTime,
}

/// Query the DB for time as a proxy for DB health
pub async fn health_check_db(
  pool: &MySqlPool,
) -> AnyhowResult<HealthCheckResult> {

  let maybe_record = sqlx::query_as!(
      HealthCheckResult,
        r#"
SELECT NOW() as present_time
        "#,
    )
      .fetch_one(pool)
      .await;

  match maybe_record {
    Ok(record) => Ok(record),
    Err(sqlx::Error::RowNotFound) => Err(anyhow!("query didn't return anything")),
    Err(ref err) => Err(anyhow!("database query error: {:?}", err)),
  }
}
