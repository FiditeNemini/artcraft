use std::io::Write;

use chrono::Local;
use log::{info, LevelFilter};
use sqlx::{MySql, Pool};
use sqlx::mysql::MySqlPoolOptions;

use easyenv::env_logger::Builder;
use easyenv::init_all_with_default_logging;
use errors::AnyhowResult;

use crate::args::{Command, parse_cli_args};
use crate::operations::calculate_model_weights_usages::run_migration::run_migration;

pub mod args;
pub mod operations;

//#[tokio::main]
#[tokio::main(flavor = "multi_thread", worker_threads = 16)]
async fn main() -> AnyhowResult<()> {
  println!("db-backfill: run backfill or migration operations");

  // init_all_with_default_logging(None);
  Builder::new()
      .format(|buf, record| {
        writeln!(
          buf,
          "{} [{}] {}",
          Local::now().format("%Y-%m-%dT%H:%M:%S"),
          record.level(),
          record.args()
        )
      })
      .filter(None, LevelFilter::Info)
      .init();

  let command = parse_cli_args()?;

  // NB: This secrets file differs from the rest because we might want to backfill production from local dev.
  // (Hopefully this isn't getting out of hand at this point.)
  easyenv::from_filename(".env-db-backfill-secrets")?;

  let mysql = get_mysql("MYSQL_PRODUCTION_URL").await?;

  info!("dispatching command: {:?}", command);

  match command.sub_command {
    Command::CalculateModelWeightsUsages => run_migration(mysql).await?,
    Command::CalculateTtsResultsUsages => {}
  }

  Ok(())
}

async fn get_mysql(env_var_name: &str) -> AnyhowResult<Pool<MySql>> {
  info!("Connecting to MySQL {env_var_name}...");

  let pool = MySqlPoolOptions::new()
      .max_connections(easyenv::get_env_num("MYSQL_MAX_CONNECTIONS", 20)?)
      .connect(&easyenv::get_env_string_required(env_var_name)?)
      .await?;

  Ok(pool)
}
