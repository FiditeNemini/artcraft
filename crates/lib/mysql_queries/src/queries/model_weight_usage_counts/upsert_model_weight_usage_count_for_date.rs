use std::marker::PhantomData;

use chrono::NaiveDate;
use sqlx::{Executor, MySql};

use errors::AnyhowResult;
use tokens::tokens::model_weights::ModelWeightToken;

pub struct Args<'e, 'c, E>
where E: 'e + Executor<'c, Database = MySql>
{
  pub model_token: &'e ModelWeightToken,
  pub date: NaiveDate,
  pub usage_count: u64,

  pub mysql_executor: E,

  // TODO: Not sure if this works to tell the compiler we need the lifetime annotation.
  //  See: https://doc.rust-lang.org/std/marker/struct.PhantomData.html#unused-lifetime-parameters
  pub phantom: PhantomData<&'c E>,
}

pub async fn upsert_model_weight_usage_count_for_date<'e, 'c : 'e, E>(
  args: Args<'e, 'c, E>,
) -> AnyhowResult<()>
where E: 'e + Executor<'c, Database = MySql>
{

  let query = sqlx::query!(
        r#"
INSERT INTO model_weight_usage_counts
SET
  token = ?,
  on_date = ?,
  usage_count = ?


ON DUPLICATE KEY UPDATE
  usage_count = ?
        "#,
      // Insert
      args.model_token.as_str(),
      args.date,
      args.usage_count,
      args.usage_count,
    );

  let _r = query.execute(args.mysql_executor).await?;

  Ok(())
}
