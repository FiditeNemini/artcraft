#![deny(unused_must_use)]
#![allow(dead_code)]
#![allow(unused_mut)]
#![allow(unused_imports)]
#![warn(unused_must_use)]
//#![allow(warnings)]

pub mod job;
pub mod util;

use chrono::Utc;
use crate::job::job_queries::TtsUploadJobRecord;
use crate::job::job_queries::mark_tts_upload_job_done;
use crate::job::job_queries::mark_tts_upload_job_failure;
use crate::job::job_queries::query_tts_upload_job_records;
use crate::util::anyhow_result::AnyhowResult;
use log::{warn, info};
use sqlx::MySqlPool;
use sqlx::mysql::MySqlPoolOptions;
use std::time::Duration;

const DEFAULT_RUST_LOG: &'static str = "debug,actix_web=info";

#[async_std::main]
async fn main() -> AnyhowResult<()> {
  easyenv::init_all_with_default_logging(Some(DEFAULT_RUST_LOG));

  info!("Obtaining hostname...");

  let server_hostname = hostname::get()
    .ok()
    .and_then(|h| h.into_string().ok())
    .unwrap_or("storyteller-web-unknown".to_string());

  info!("Hostname: {}", &server_hostname);

  let db_connection_string =
    easyenv::get_env_string_or_default(
      "MYSQL_URL",
      "mysql://root:root@localhost/storyteller");

  info!("Connecting to database...");

  let pool = MySqlPoolOptions::new()
    .max_connections(5)
    .connect(&db_connection_string)
    .await?;

  main_loop(pool).await;

  Ok(())
}

const START_TIMEOUT_MILLIS : u64 = 500;
const INCREASE_TIMEOUT_MILLIS : u64 = 1000;

async fn main_loop(pool: MySqlPool) {
  let mut timeout_millis = START_TIMEOUT_MILLIS;

  loop {
    let num_records = 1;
    let query_result = query_tts_upload_job_records(&pool, num_records).await;

    let jobs = match query_result {
      Ok(jobs) => jobs,
      Err(e) => {
        warn!("Error querying jobs: {:?}", e);
        std::thread::sleep(Duration::from_millis(timeout_millis));
        timeout_millis += INCREASE_TIMEOUT_MILLIS;
        continue;
      }
    };

    if jobs.is_empty() {
      info!("No jobs!");
      std::thread::sleep(Duration::from_millis(1500));
      continue;
    }

    let result = process_jobs(&pool, jobs).await;

    match result {
      Ok(_) => {},
      Err(e) => {
        warn!("Error querying jobs: {:?}", e);
        std::thread::sleep(Duration::from_millis(timeout_millis));
        timeout_millis += INCREASE_TIMEOUT_MILLIS;
        continue;
      }
    }

    timeout_millis = START_TIMEOUT_MILLIS; // reset

    std::thread::sleep(Duration::from_millis(500));
  }
}

async fn process_jobs(pool: &MySqlPool, jobs: Vec<TtsUploadJobRecord>) -> AnyhowResult<()> {
  for job in jobs.into_iter() {
    let result = process_job(pool, &job).await;
    match result {
      Ok(_) => {},
      Err(e) => {
        warn!("Failure to process job: {:?}", e);
        let failure_reason = "";
        let _r = mark_tts_upload_job_failure(pool, &job, failure_reason).await;
      }
    }
  }

  Ok(())
}

async fn process_job(pool: &MySqlPool, job: &TtsUploadJobRecord) -> AnyhowResult<()> {
  // TODO: 1. Mark processing.
  // TODO: 2. Download.
  // TODO: 3. Upload.
  // TODO: 4. Save record.
  // TODO: 5. Mark job done.

  info!("Job done: {}", job.id);
  mark_tts_upload_job_done(pool, job, true).await?;

  Ok(())
}

