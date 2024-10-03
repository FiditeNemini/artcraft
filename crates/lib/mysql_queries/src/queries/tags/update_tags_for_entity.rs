use log::info;
use composite_identifiers::by_table::tag_uses::tag_use_entity::TagUseEntity;
use errors::AnyhowResult;
use sqlx::pool::PoolConnection;
use sqlx::{Acquire, Executor, MySql, QueryBuilder, Transaction};
use tokens::tokens::tags::TagToken;

pub async fn update_tags_for_entity(
  entity: TagUseEntity,
  tags: &[TagToken],
  mysql_connection: &mut PoolConnection<MySql>,
) -> AnyhowResult<()>
{
  let mut transaction = mysql_connection.begin().await?;

  if tags.is_empty() {
    delete_all_query(&entity, tags, &mut transaction).await?;
    transaction.commit().await?;
    return Ok(());
  }

  delete_query(&entity, tags, &mut transaction).await?;
  insert_query(&entity, tags, &mut transaction).await?;

  transaction.commit().await?;

  Ok(())
}

async fn delete_query(
  entity: &TagUseEntity,
  tags: &[TagToken],
  transaction: &mut Transaction<'_, MySql>,
) -> AnyhowResult<()> {
  let mut query_builder: QueryBuilder<MySql> = QueryBuilder::new("DELETE FROM tag_uses ");

  query_builder.push(" WHERE entity_type = ");;
  query_builder.push_bind(entity.get_entity_type().to_str());

  query_builder.push(" AND entity_token = ");;
  query_builder.push_bind(entity.get_entity_token_str());

  query_builder.push(" AND tag_token NOT IN ( ");

  let mut separated = query_builder.separated(", ");

  for tag in tags.iter() {
    separated.push_bind(tag.as_str());
  }

  separated.push_unseparated(") ");

  info!("delete_query: {}", query_builder.sql());

  let query = query_builder.build();

  transaction.execute(query).await?;

  Ok(())
}

async fn delete_all_query(
  entity: &TagUseEntity,
  tags: &[TagToken],
  transaction: &mut Transaction<'_, MySql>,
) -> AnyhowResult<()> {
  let mut query_builder: QueryBuilder<MySql> = QueryBuilder::new("DELETE FROM tag_uses ");

  query_builder.push(" WHERE entity_type = ");;
  query_builder.push_bind(entity.get_entity_type().to_str());

  query_builder.push(" AND entity_token = ");;
  query_builder.push_bind(entity.get_entity_token_str());

  info!("delete_query: {}", query_builder.sql());

  let query = query_builder.build();

  transaction.execute(query).await?;

  Ok(())
}

async fn insert_query(
  entity: &TagUseEntity,
  tags: &[TagToken],
  transaction: &mut Transaction<'_, MySql>,
) -> AnyhowResult<()> {
  if tags.is_empty() {
    return Ok(()) // This prevents a SQL error when the IN clause is empty.
  }

  // NB: Insert ignore will insert non-duplicate rows and silently ignore duplicates
  let mut query_builder: QueryBuilder<MySql> = QueryBuilder::new("INSERT IGNORE INTO tag_uses ");

  query_builder.push(" (entity_type, entity_token, tag_token) VALUES ");

  for (i, tag) in tags.iter().enumerate() {
    query_builder.push(" ( ");;
    query_builder.push_bind(entity.get_entity_type().to_str());
    query_builder.push(", ");;
    query_builder.push_bind(entity.get_entity_token_str());
    query_builder.push(", ");;
    query_builder.push_bind(tag.as_str());
    query_builder.push(" ) ");

    if i < tags.len() - 1 {
      query_builder.push(", ");
    }
  }

  let query = query_builder.build();

  transaction.execute(query).await?;

  Ok(())
}
