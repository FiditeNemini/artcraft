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
use crate::job::job_queries::insert_tts_model;
use crate::job::job_queries::mark_tts_upload_job_done;
use crate::job::job_queries::mark_tts_upload_job_failure;
use crate::job::job_queries::query_tts_upload_job_records;
use crate::util::anyhow_result::AnyhowResult;
use crate::util::filesystem::check_directory_exists;
use crate::util::random_token::random_token;
use log::{warn, info};
use sqlx::MySqlPool;
use sqlx::mysql::MySqlPoolOptions;
use std::path::PathBuf;
use std::time::Duration;

const DEFAULT_RUST_LOG: &'static str = "debug,actix_web=info";

struct Downloader {
  pub download_temp_directory: PathBuf,
  pub mysql_pool: MySqlPool,
}

#[async_std::main]
async fn main() -> AnyhowResult<()> {
  easyenv::init_all_with_default_logging(Some(DEFAULT_RUST_LOG));

  info!("Obtaining hostname...");

  let server_hostname = hostname::get()
    .ok()
    .and_then(|h| h.into_string().ok())
    .unwrap_or("storyteller-web-unknown".to_string());

  info!("Hostname: {}", &server_hostname);

  let temp_directory = easyenv::get_env_string_or_default(
    "DOWNLOAD_TEMP_DIR",
    "/tmp");

  let temp_directory = PathBuf::from(temp_directory);

  check_directory_exists(&temp_directory)?;

  let db_connection_string =
    easyenv::get_env_string_or_default(
      "MYSQL_URL",
      "mysql://root:root@localhost/storyteller");

  info!("Connecting to database...");

  let mysql_pool = MySqlPoolOptions::new()
    .max_connections(5)
    .connect(&db_connection_string)
    .await?;

  let downloader = Downloader {
    download_temp_directory: temp_directory,
    mysql_pool,
  };

  main_loop(downloader).await;

  Ok(())
}

const START_TIMEOUT_MILLIS : u64 = 500;
const INCREASE_TIMEOUT_MILLIS : u64 = 1000;

async fn main_loop(downloader: Downloader) {
  let mut timeout_millis = START_TIMEOUT_MILLIS;

  loop {
    let num_records = 1;
    let query_result = query_tts_upload_job_records(&downloader.mysql_pool, num_records).await;

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

    let result = process_jobs(&downloader, jobs).await;

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

async fn process_jobs(downloader: &Downloader, jobs: Vec<TtsUploadJobRecord>) -> AnyhowResult<()> {
  for job in jobs.into_iter() {
    let result = process_job(downloader, &job).await;
    match result {
      Ok(_) => {},
      Err(e) => {
        warn!("Failure to process job: {:?}", e);
        let failure_reason = "";
        let _r = mark_tts_upload_job_failure(&downloader.mysql_pool, &job, failure_reason).await;
      }
    }
  }

  Ok(())
}

async fn process_job(downloader: &Downloader, job: &TtsUploadJobRecord) -> AnyhowResult<()> {
  // TODO: 1. Mark processing.
  // TODO: 2. Download.
  // TODO: 3. Upload.
  // TODO: 4. Save record. (DONE)
  // TODO: 5. Mark job done. (DONE)

  let private_bucket_hash = random_token(32); // TODO: Use sha2/sha256 instead.

  info!("Saving model record...");
  let id = insert_tts_model(&downloader.mysql_pool, job, &private_bucket_hash).await?;

  info!("Saved model record: {}", id);

  info!("Job done: {}", job.id);
  mark_tts_upload_job_done(&downloader.mysql_pool, job, true).await?;

  Ok(())
}

