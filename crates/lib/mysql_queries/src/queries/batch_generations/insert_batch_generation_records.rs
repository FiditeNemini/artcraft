use anyhow::anyhow;
use log::error;
use sqlx::{Executor, MySql, QueryBuilder, Transaction};

use composite_identifiers::by_table::batch_generations::batch_generation_entity::BatchGenerationEntity;
use errors::AnyhowResult;
use tokens::tokens::batch_generations::BatchGenerationToken;

pub struct BatchEntry {
  pub batch_token: BatchGenerationToken,
  pub entity: BatchGenerationEntity,
}

pub struct InsertBatchArgs<'a> {
  pub entries: Vec<BatchEntry>,
  pub transaction: &'a mut Transaction<'a, MySql>,
}

/// NB: Caller is responsible for rolling back the transaction if this fails.
pub async fn insert_batch_generation_records(args: InsertBatchArgs<'_>) -> AnyhowResult<()> {
  let mut query_builder = QueryBuilder::new(r#"
    INSERT INTO batch_generations (token, entity_type, entity_token) VALUES
  "#);

  for (i, entry) in args.entries.iter().enumerate() {
    let (entity_type, entity_token) = entry.entity.get_composite_keys();

    query_builder.push("(");
    query_builder.push_bind(&entry.batch_token);
    query_builder.push(",");

    query_builder.push_bind(entity_type);
    query_builder.push(",");

    query_builder.push_bind(entity_token);
    query_builder.push(")");

    if i < args.entries.len() - 1 {
      query_builder.push(",");
    }
  }

  let query = query_builder.build();

  let query_result  = query.execute(&mut **args.transaction).await;

  match query_result {
    Ok(_) => Ok(()),
    Err(err) => {
      error!("Error with batch generation query: {:?}", &err);
      Err(anyhow!("model category creation error: {:?}", &err))
    },
  }
}
