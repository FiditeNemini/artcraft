use itertools::Itertools;
use sqlx::{FromRow, MySqlPool, QueryBuilder, Row};
use sqlx::mysql::MySqlRow;

use errors::AnyhowResult;

/// Super simple and lazy migration pattern: run the count query to see if we need
/// to migrate, then run the migrate query. Do this in a loop.
pub struct QueryPair {
  pub count_query: String,
  pub migrate_query: String,
}

impl QueryPair {

  pub async fn run_count_query(&self, mysql_pool: &MySqlPool) -> AnyhowResult<i64> {
    let mut query_builder = QueryBuilder::new(&self.count_query);
    let query = query_builder.build_query_as::<CountRecord>();
    let record = query.fetch_one(mysql_pool).await?;
    Ok(record.record_count)
  }

  pub async fn run_migrate_query(&self, mysql_pool: &MySqlPool) -> AnyhowResult<()> {
    let mut query_builder = QueryBuilder::new(&self.migrate_query);
    let query = query_builder.build();
    let record = query.execute(mysql_pool).await?;
    Ok(())
  }

  pub fn count_query(&self) -> String {
    Self::single_line_query(&self.count_query)
  }

  pub fn migrate_query(&self) -> String {
    Self::single_line_query(&self.migrate_query)
  }

  fn single_line_query(query: &str) -> String {
    query.split("\n")
        .map(|s| s.trim())
        .join(" ")
        .trim()
        .to_string()
  }
}

pub struct CountRecord {
  pub record_count: i64
}

impl FromRow<'_, MySqlRow> for CountRecord {
  fn from_row(row: &MySqlRow) -> Result<Self, sqlx::Error> {
    Ok(Self {
      record_count: row.try_get("record_count")?,
    })
  }
}
