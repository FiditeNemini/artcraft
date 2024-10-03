use log::info;
use crate::utils::transactor::Transactor;
use errors::AnyhowResult;
use sqlx::mysql::MySqlRow;
use sqlx::{FromRow, MySql, QueryBuilder, Row};
use tokens::tokens::tags::TagToken;

pub struct MatchingTag {
  pub token: TagToken,
  pub tag_value: String,
}

pub async fn select_matching_tags(
  tag_values: &[String],
  transactor: Transactor<'_, '_>,
) -> AnyhowResult<Vec<MatchingTag>> {
  if tag_values.is_empty() {
    return Ok(Vec::new()) // This prevents a SQL error when the IN clause is empty.
  }

  let tag_values = tag_values.iter()
      .map(|tag| tag.trim().to_lowercase())
      .collect::<Vec<_>>();

  let mut query_builder: QueryBuilder<MySql> = QueryBuilder::new(
        r#"
SELECT
    token,
    tag_value
FROM
    tags
WHERE
    tag_value IN (
        "#,
    );

  let mut separated = query_builder.separated(", ");

  for tag_value in tag_values.iter() {
    separated.push_bind(tag_value);
  }

  separated.push_unseparated(") ");

  let query = query_builder.build_query_as::<RawTag>();

  let results = match transactor {
    Transactor::Pool { pool } => {
      query.fetch_all(pool).await?
    },
    Transactor::Connection { connection } => {
      query.fetch_all(connection).await?
    },
    Transactor::Transaction { transaction } => {
      query.fetch_all(&mut **transaction).await?
    },
  };

  Ok(results.into_iter()
      .map(|record| MatchingTag {
        token: record.token,
        tag_value: record.tag_value,
      })
      .collect())
}

struct RawTag {
  token: TagToken,
  tag_value: String,
}

impl FromRow<'_, MySqlRow> for RawTag {
  fn from_row(row: &MySqlRow) -> Result<Self, sqlx::Error> {
    Ok(Self {
      token: TagToken::new(row.try_get("token")?),
      tag_value: row.try_get("tag_value")?,
    })
  }
}
