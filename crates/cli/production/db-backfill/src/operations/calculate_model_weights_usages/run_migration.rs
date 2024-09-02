use anyhow::anyhow;
use chrono::NaiveDate;
use log::info;
use sqlx::{MySql, Pool};

use errors::AnyhowResult;
use mysql_queries::queries::model_weight_usage_counts::upsert_model_weight_usage_count_for_date::{Args, upsert_model_weight_usage_count_for_date};
use mysql_queries::queries::model_weights::count::count_model_use_using_media_files_on_date::count_model_use_using_media_files_on_date;
use tokens::tokens::media_files::MediaFileToken;

use crate::operations::calculate_model_weights_usages::sub_args::parse_cli_sub_args;

pub async fn run_migration(mysql: Pool<MySql>) -> AnyhowResult<()> {
  let args = parse_cli_sub_args()?;

  info!("args: {:?}", args);

  let model_token = args.model_token
      .ok_or_else(|| anyhow!("no token provided"))?;

  let date = args.start_date
      .ok_or_else(|| anyhow!("invalid start date"))?;

  let count = count_model_use_using_media_files_on_date(&mysql, &model_token, date).await?;

  info!("count: {:?}", count.record_count);

  upsert_model_weight_usage_count_for_date(Args {
    model_token: &model_token,
    date,
    usage_count: count.record_count,
    mysql_executor: &mysql,
    phantom: Default::default(),
  }).await?;


  println!("calculate_model_weights_usages: run migration");

  Ok(())
}
