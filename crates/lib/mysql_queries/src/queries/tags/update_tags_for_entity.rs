use composite_identifiers::by_table::tag_uses::tag_use_entity::TagUseEntity;
use errors::AnyhowResult;
use sqlx::pool::PoolConnection;
use sqlx::{Acquire, Executor, FromRow, MySql, QueryBuilder, Transaction};
use sqlx::mysql::MySqlRow;
use enums::by_table::media_files::media_file_animation_type::MediaFileAnimationType;
use enums::by_table::media_files::media_file_class::MediaFileClass;
use enums::by_table::media_files::media_file_engine_category::MediaFileEngineCategory;
use enums::by_table::media_files::media_file_origin_category::MediaFileOriginCategory;
use enums::by_table::media_files::media_file_origin_model_type::MediaFileOriginModelType;
use enums::by_table::media_files::media_file_origin_product_category::MediaFileOriginProductCategory;
use enums::by_table::media_files::media_file_type::MediaFileType;
use enums::common::visibility::Visibility;
use tokens::tokens::media_files::MediaFileToken;
use tokens::tokens::tags::TagToken;
use crate::queries::beta_keys::get_beta_key_by_value::RawRecord;

pub async fn update_tags_for_entity(
  entity: TagUseEntity,
  tags: &[TagToken],
  mysql_connection: &mut PoolConnection<MySql>,
) -> AnyhowResult<()>
{
  if tags.is_empty() {
    return Ok(()) // This prevents a SQL error when the IN clause is empty.
  }

  let mut transaction = mysql_connection.begin().await?;

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

  query_builder.push(" WHERE entity_type = ? ");;
  query_builder.push_bind(entity.get_entity_type().to_str());

  query_builder.push(" AND entity_token = ? ");;
  query_builder.push_bind(entity.get_entity_token_str());

  query_builder.push(" AND tag_token IN ( ");

  let mut separated = query_builder.separated(", ");

  for tag in tags.iter() {
    separated.push_bind(tag.as_str());
  }

  separated.push_unseparated(") ");

  let query = query_builder.build();

  transaction.execute(query).await?;

  Ok(())
}

async fn insert_query(
  entity: &TagUseEntity,
  tags: &[TagToken],
  transaction: &mut Transaction<'_, MySql>,
) -> AnyhowResult<()> {
  // NB: Insert ignore will insert non-duplicate rows and silently ignore duplicates
  let mut query_builder: QueryBuilder<MySql> = QueryBuilder::new("INSERT IGNORE INTO tag_uses ");

  query_builder.push(" (entity_type, entity_token, tag_token) VALUES ");

  for tag in tags.iter() {
    query_builder.push(" ( ?, ");;
    query_builder.push_bind(entity.get_entity_type().to_str());
    query_builder.push(" ?, ");;
    query_builder.push_bind(entity.get_entity_token_str());
    query_builder.push(" ? )");;
    query_builder.push_bind(tag.as_str());
  }

  let query = query_builder.build();

  transaction.execute(query).await?;

  Ok(())
}
