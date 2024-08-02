use anyhow::anyhow;
use chrono::{DateTime, Utc};
use sqlx::MySqlPool;

use errors::AnyhowResult;

pub struct GetDatabaseTimeResult {
  pub database_time: DateTime<Utc>,
}

/// Query the DB for its current time
pub async fn get_database_time(
  pool: &MySqlPool,
) -> AnyhowResult<GetDatabaseTimeResult> {

  let maybe_record = sqlx::query_as!(
      GetDatabaseTimeResult,
        r#"
SELECT NOW() as `database_time: DateTime<Utc>`
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
