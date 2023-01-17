// Never allow these
#![forbid(private_in_public)]
#![forbid(unused_must_use)] // NB: It's unsafe to not close/check some things

// Okay to toggle
#![forbid(unreachable_patterns)]
#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

// Always allow
#![allow(dead_code)]
#![allow(non_snake_case)]

// Strict
//#![forbid(warnings)]

pub mod job_state;
pub mod jobs;
pub mod main_loop;

use config::shared_constants::DEFAULT_MYSQL_CONNECTION_STRING;
use config::shared_constants::DEFAULT_RUST_LOG;
use crate::job_state::{JobState, SleepConfigs};
use crate::main_loop::main_loop;
use errors::AnyhowResult;
use log::info;
use sqlx::mysql::MySqlPoolOptions;

#[tokio::main]
async fn main() -> AnyhowResult<()> {
  easyenv::init_all_with_default_logging(Some(DEFAULT_RUST_LOG));

  let _ = dotenv::from_filename(".env-analytics-job").ok(); // NB: Specific to `analytics-job` app.
  let _ = dotenv::from_filename(".env-secrets").ok(); // NB: Secrets not to live in source control.

  info!("Obtaining hostname...");

  let server_hostname = hostname::get()
      .ok()
      .and_then(|h| h.into_string().ok())
      .unwrap_or("analytics-job".to_string());

  info!("Hostname: {}", &server_hostname);

  let db_connection_string =
      easyenv::get_env_string_or_default(
        "MYSQL_URL",
        DEFAULT_MYSQL_CONNECTION_STRING);

  info!("Connecting to database...");

  let mysql_pool = MySqlPoolOptions::new()
      .max_connections(5)
      .connect(&db_connection_string)
      .await?;

  let job_state = JobState {
    mysql_pool,
    sleep_config: SleepConfigs {
      between_job_wait_millis: easyenv::get_env_num("BETWEEN_JOB_WAIT_MILLIS", 100)?,
      between_job_batch_wait_millis: easyenv::get_env_num("BETWEEN_JOB_BATCH_WAIT_MILLIS", 5000)?,
      between_query_wait_millis: easyenv::get_env_num("BETWEEN_QUERY_WAIT_MILLIS", 100)?,
      between_error_wait_millis: easyenv::get_env_num("BETWEEN_ERROR_WAIT_MILLIS", 10_000)?,
    },
  };

  let _r = main_loop(job_state).await;

  Ok(())
}
