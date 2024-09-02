use anyhow::anyhow;
use chrono::NaiveDate;
use log::info;
use sqlx::{MySql, Pool};
use datetimes::CHRONO_DATETIME_UNIX_EPOCH;
use errors::AnyhowResult;
use mysql_queries::queries::model_weight_usage_counts::upsert_model_weight_usage_count_for_date::{Args, upsert_model_weight_usage_count_for_date};
use mysql_queries::queries::model_weights::count::count_model_use_using_media_files_on_date::count_model_use_using_media_files_on_date;
use mysql_queries::queries::model_weights::list::list_model_weight_tokens_updated_since::list_model_weight_tokens_updated_since;
use tokens::tokens::media_files::MediaFileToken;
use tokens::tokens::model_weights::ModelWeightToken;

use crate::operations::calculate_model_weights_usages::sub_args::{parse_cli_sub_args, SubArgs};

pub async fn run_migration(mysql: Pool<MySql>) -> AnyhowResult<()> {
  let args = parse_cli_sub_args()?;

  info!("Backfill args: {:?}", args);

  let model_tokens = match args.model_token.as_ref() {
    Some(model_token) => vec![model_token.clone()],
    None => get_all_model_weight_tokens(mysql.clone()).await?,
  };

  for token in model_tokens.iter() {
    backfill_token(&mysql, &args, &token).await?;
  }

  info!("Model token count: {:?}", model_tokens.len());
  Ok(())
}

async fn get_all_model_weight_tokens(mysql: Pool<MySql>) -> AnyhowResult<Vec<ModelWeightToken>> {
  let epoch = *CHRONO_DATETIME_UNIX_EPOCH;
  let results = list_model_weight_tokens_updated_since(&mysql, &epoch).await?;
  Ok(results.into_iter()
      .map(|result| result.token)
      .collect())
}

async fn backfill_token(mysql: &Pool<MySql>, args: &SubArgs, model_token: &ModelWeightToken) -> AnyhowResult<()> {
  let date = args.start_date
      .ok_or_else(|| anyhow!("invalid start date"))?;

  info!("Backfilling token: {:?} for date: {:?}", model_token, date);

  let count = count_model_use_using_media_files_on_date(
    mysql, &model_token, date).await?;

  if count.record_count == 0 {
    info!("Count: {:?} (skipping)", count.record_count);
    return Ok(());
  } else {
    info!("Count: {:?}", count.record_count);
  }

  upsert_model_weight_usage_count_for_date(Args {
    model_token: &model_token,
    date,
    usage_count: count.record_count,
    insert_on_zero: false,
    mysql_executor: mysql,
    phantom: Default::default(),
  }).await?;

  Ok(())
}
