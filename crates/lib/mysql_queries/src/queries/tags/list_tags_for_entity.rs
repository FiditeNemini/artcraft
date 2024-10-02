use composite_identifiers::by_table::tag_uses::tag_use_entity::TagUseEntity;
use errors::AnyhowResult;
use tokens::tokens::tags::TagToken;

use crate::utils::transactor::Transactor;

pub struct Tag {
  pub token: TagToken,
  pub tag_value: String,
}

pub async fn list_tags_for_entity(
  tag_entity: TagUseEntity,
  transactor: Transactor<'_, '_>,
) -> AnyhowResult<Vec<Tag>> {

  let (entity_type, entity_token) = tag_entity.get_composite_keys();

  let query = sqlx::query_as!(
      RawTag,
        r#"
SELECT
    t.token as `token: tokens::tokens::tags::TagToken`,
    t.tag_value

FROM
    tags AS t
JOIN tag_uses AS u
    ON t.token = u.tag_token
WHERE
    u.entity_type = ?
    AND u.entity_token = ?
    AND u.maybe_deleted_at IS NULL
ORDER BY t.id DESC
LIMIT 500
        "#,
      entity_type,
      entity_token
    );

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
      .map(|record| Tag {
        token: record.token,
        tag_value: record.tag_value,
      })
      .collect())
}

struct RawTag {
  token: TagToken,
  tag_value: String,
}
