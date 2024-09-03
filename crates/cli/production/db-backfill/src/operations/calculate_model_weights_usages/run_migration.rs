use std::thread;
use std::time::Duration;

use anyhow::anyhow;
use chrono::{DateTime, NaiveDate, Utc};
use log::{error, info};
use sqlx::{Error, MySql, Pool};
use sqlx::pool::PoolConnection;
use tokio::time::Instant;

use datetimes::CHRONO_DATETIME_UNIX_EPOCH;
use datetimes::generate_dates_inclusive::generate_dates_inclusive;
use errors::AnyhowResult;
use mysql_queries::queries::model_weight_usage_counts::upsert_model_weight_usage_count_for_date::{Args, upsert_model_weight_usage_count_for_date};
use mysql_queries::queries::model_weights::count::count_all_model_usages_on_date::count_all_model_usages_on_date;
use mysql_queries::queries::model_weights::count::count_model_use_using_media_files_on_date::count_model_use_using_media_files_on_date;
use mysql_queries::queries::model_weights::list::list_all_model_weight_tokens_for_backfill::list_all_model_weight_tokens_for_backfill;
use mysql_queries::queries::model_weights::list::list_model_weight_tokens_updated_since::list_model_weight_tokens_updated_since;
use tokens::tokens::media_files::MediaFileToken;
use tokens::tokens::model_weights::ModelWeightToken;

use crate::operations::calculate_model_weights_usages::sub_args::{parse_cli_sub_args, SubArgs};

pub async fn run_migration(mysql: Pool<MySql>) -> AnyhowResult<()> {
  let args = parse_cli_sub_args()?;

  info!("Backfill args: {:?}", args);

  let date = NaiveDate::from_ymd_opt(2024, 1, 1).ok_or(anyhow!("Invalid date"))?;

  info!("for date: {:?}", date);

  let usages = count_all_model_usages_on_date(&mysql, date).await?;

  info!("usage data length: {}", usages.counts.len());

  for usage in usages.counts {
    if usage.record_count == 0 {
      continue;
    }
    println!("Token: {} Count: {}", usage.token.as_str(), usage.record_count);

    upsert_model_weight_usage_count_for_date(Args {
      model_token: &usage.token,
      date,
      usage_count: usage.record_count,
      insert_on_zero: false,
      mysql_executor: &mysql,
      phantom: Default::default(),
    }).await?;
  }

  Ok(())
}
