use anyhow::anyhow;
use chrono::{Days, NaiveDate};
use sqlx::MySqlPool;

use errors::AnyhowResult;
use tokens::tokens::media_files::MediaFileToken;

use crate::helpers::numeric_converters::try_i64_to_u64_or_min;

#[derive(Clone)]
pub struct ModelUseCount {
  pub record_count: u64,
}

struct RawResult {
  record_count: i64,
}

pub async fn count_model_use_using_media_files_on_date(
  pool: &MySqlPool,
  token: &MediaFileToken,
  date: NaiveDate,
) -> AnyhowResult<ModelUseCount> {
  let start_date = date;
  //let end_date = date.checked_add_days(Days::new(1))
  //    .ok_or_else(|| anyhow!("Failed to add days to date"))?;
  // Avoid full table scan on date-to-timestamp: https://stackoverflow.com/a/14769096
  //  AND f.created_at >= CURDATE()
  //  AND f.created_at < CURDATE() + INTERVAL 1 DAY
  // WHERE (w.token = ? OR w.maybe_migration_old_model_token = ?)
  let result = sqlx::query_as!(
      RawResult ,
        r#"
SELECT
  COUNT(*) as record_count
  FROM media_files as f
  left outer join model_weights as w
     on f.maybe_origin_model_token = w.token
  left outer join model_weights as w_old
     on f.maybe_origin_model_token = w_old.maybe_migration_old_model_token
  WHERE (w.token = ? OR w_old.token = ?)
  AND f.created_at >= ?
  AND f.created_at < ? + INTERVAL 1 DAY
        "#,
      token.as_str(),
      token.as_str(),
      start_date,
      start_date,
    )
      .fetch_one(pool)
      .await?;

  Ok(ModelUseCount {
    record_count: try_i64_to_u64_or_min(result.record_count),
  })
}
