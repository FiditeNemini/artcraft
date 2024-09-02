use anyhow::anyhow;
use chrono::{DateTime, NaiveDate, Utc};
use log::info;
use sqlx::{MySql, Pool};
use datetimes::CHRONO_DATETIME_UNIX_EPOCH;
use datetimes::generate_dates_inclusive::generate_dates_inclusive;
use errors::AnyhowResult;
use mysql_queries::queries::model_weight_usage_counts::upsert_model_weight_usage_count_for_date::{Args, upsert_model_weight_usage_count_for_date};
use mysql_queries::queries::model_weights::count::count_model_use_using_media_files_on_date::count_model_use_using_media_files_on_date;
use mysql_queries::queries::model_weights::list::list_all_model_weight_tokens_for_backfill::list_all_model_weight_tokens_for_backfill;
use mysql_queries::queries::model_weights::list::list_model_weight_tokens_updated_since::list_model_weight_tokens_updated_since;
use tokens::tokens::media_files::MediaFileToken;
use tokens::tokens::model_weights::ModelWeightToken;

use crate::operations::calculate_model_weights_usages::sub_args::{parse_cli_sub_args, SubArgs};

pub async fn run_migration(mysql: Pool<MySql>) -> AnyhowResult<()> {
  let args = parse_cli_sub_args()?;

  info!("Backfill args: {:?}", args);

  let models = match args.model_token.as_ref() {
    Some(model_token) => vec![ModelInfo {
      token: model_token.clone(),
      maybe_created_date: None,
    }],
    None => get_all_model_weight_tokens(mysql.clone()).await?,
  };

  info!("Model token count: {:?}", models.len());

  for model in models.iter() {
    let dates = get_all_dates(&args, model)?;
    for date in dates.into_iter() {
      backfill_token(&mysql, &model.token, date).await?;
    }
  }

  Ok(())
}

pub struct ModelInfo {
  pub token: ModelWeightToken,
  pub maybe_created_date: Option<NaiveDate>,
}

async fn get_all_model_weight_tokens(mysql: Pool<MySql>) -> AnyhowResult<Vec<ModelInfo>> {
  let epoch = *CHRONO_DATETIME_UNIX_EPOCH;
  let results = list_all_model_weight_tokens_for_backfill(&mysql, &epoch).await?;
  Ok(results.into_iter()
      .map(|result| ModelInfo {
        token: result.token,
        maybe_created_date: Some(result.created_at.date_naive()),
      })
      .collect())
}

fn get_all_dates(args: &SubArgs, model: &ModelInfo) -> AnyhowResult<Vec<NaiveDate>> {
  let start_date = model.maybe_created_date
      .or_else(|| args.start_date)
      .ok_or_else(|| anyhow!("no start date given"))?;
  let end_date = args.end_date
      .unwrap_or_else(|| Utc::today().naive_utc());
  Ok(generate_dates_inclusive(start_date, end_date))
}

async fn backfill_token(mysql: &Pool<MySql>, model_token: &ModelWeightToken, date: NaiveDate) -> AnyhowResult<()> {
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
