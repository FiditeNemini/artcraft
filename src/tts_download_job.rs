#![deny(unused_must_use)]
#![allow(dead_code)]
#![allow(unused_imports)]
#![allow(unused_mut)]
#![allow(unused_variables)]
#![warn(unused_must_use)]
//#![allow(warnings)]

#[macro_use] extern crate serde_derive;

pub mod buckets;
pub mod common_queries;
pub mod job_queries;
pub mod script_execution;
pub mod shared_constants;
pub mod util;

use anyhow::anyhow;
use chrono::Utc;
use crate::buckets::bucket_client::BucketClient;
use crate::buckets::bucket_paths::hash_to_bucket_path;
use crate::buckets::file_hashing::get_file_hash;
use crate::common_queries::firehose_publisher::FirehosePublisher;
use crate::job_queries::tts_download_job_queries::TtsUploadJobRecord;
use crate::job_queries::tts_download_job_queries::insert_tts_model;
use crate::job_queries::tts_download_job_queries::mark_tts_upload_job_done;
use crate::job_queries::tts_download_job_queries::mark_tts_upload_job_failure;
use crate::job_queries::tts_download_job_queries::query_tts_upload_job_records;
use crate::script_execution::google_drive_download_command::GoogleDriveDownloadCommand;
use crate::util::anyhow_result::AnyhowResult;
use crate::util::filesystem::check_directory_exists;
use crate::util::random_crockford_token::random_crockford_token;
use data_encoding::{HEXUPPER, HEXLOWER, HEXLOWER_PERMISSIVE};
use log::{warn, info};
use ring::digest::{Context, Digest, SHA256};
use shared_constants::DEFAULT_MYSQL_PASSWORD;
use shared_constants::DEFAULT_RUST_LOG;
use sqlx::MySqlPool;
use sqlx::mysql::MySqlPoolOptions;
use std::fs::File;
use std::io::{BufReader, Read};
use std::path::{PathBuf, Path};
use std::process::Command;
use std::time::Duration;
use tempdir::TempDir;

// Buckets
const ENV_ACCESS_KEY : &'static str = "ACCESS_KEY";
const ENV_SECRET_KEY : &'static str = "SECRET_KEY";
const ENV_REGION_NAME : &'static str = "REGION_NAME";
const ENV_BUCKET_NAME : &'static str = "TTS_DOWNLOAD_BUCKET_NAME";
const ENV_BUCKET_ROOT : &'static str = "TTS_DOWNLOAD_BUCKET_ROOT";

const DEFAULT_TEMP_DIR: &'static str = "/tmp";

struct Downloader {
  pub download_temp_directory: PathBuf,
  pub mysql_pool: MySqlPool,
  pub bucket_client: BucketClient,
  pub firehose_publisher: FirehosePublisher,
  pub google_drive_downloader: GoogleDriveDownloadCommand,
  // Command to run
  pub download_script: String,
  // Root to store TTS results
  pub bucket_root_tts_model_uploads: String,
}

#[tokio::main]
async fn main() -> AnyhowResult<()> {
  easyenv::init_all_with_default_logging(Some(DEFAULT_RUST_LOG));

  let _ = dotenv::from_filename(".env-secrets").ok();

  info!("Obtaining hostname...");

  let server_hostname = hostname::get()
    .ok()
    .and_then(|h| h.into_string().ok())
    .unwrap_or("tts-download-job".to_string());

  info!("Hostname: {}", &server_hostname);

  // Bucket stuff
  let access_key = easyenv::get_env_string_required(ENV_ACCESS_KEY)?;
  let secret_key = easyenv::get_env_string_required(ENV_SECRET_KEY)?;
  let region_name = easyenv::get_env_string_required(ENV_REGION_NAME)?;
  let bucket_name = easyenv::get_env_string_required(ENV_BUCKET_NAME)?;
  let bucket_root = easyenv::get_env_string_required(ENV_BUCKET_ROOT)?;

  let bucket_client = BucketClient::create(
    &access_key,
    &secret_key,
    &region_name,
    &bucket_name,
    None,
  )?;

  let temp_directory = easyenv::get_env_string_or_default(
    "DOWNLOAD_TEMP_DIR",
    DEFAULT_TEMP_DIR);

  let download_script = easyenv::get_env_string_or_default(
    "DOWNLOAD_SCRIPT",
    "./scripts/download_internet_file.py");

  let google_drive_downloader = GoogleDriveDownloadCommand::new(&download_script);

  let temp_directory = PathBuf::from(temp_directory);

  check_directory_exists(&temp_directory)?;

  let db_connection_string =
    easyenv::get_env_string_or_default(
      "MYSQL_URL",
      DEFAULT_MYSQL_PASSWORD);

  info!("Connecting to database...");

  let mysql_pool = MySqlPoolOptions::new()
    .max_connections(5)
    .connect(&db_connection_string)
    .await?;

  let firehose_publisher = FirehosePublisher {
    mysql_pool: mysql_pool.clone(), // NB: Pool is sync/send/clone-safe
  };

  let downloader = Downloader {
    download_temp_directory: temp_directory,
    mysql_pool,
    bucket_client,
    download_script,
    google_drive_downloader,
    bucket_root_tts_model_uploads: bucket_root.to_string(),
    firehose_publisher,
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
  // TODO: 2. Download. (DONE)
  // TODO: 3. Upload. (DONE)
  // TODO: 4. Save record. (DONE)
  // TODO: 5. Mark job done. (DONE)

  let temp_dir = format!("temp_{}", job.id);
  let temp_dir = TempDir::new(&temp_dir)?;

  let download_url = job.download_url.as_ref()
    .map(|c| c.to_string())
    .unwrap_or("".to_string());

  info!("Calling downloader...");
  let download_filename = downloader.google_drive_downloader
    .download_file(&download_url, &temp_dir).await?;

  let private_bucket_hash = get_file_hash(&download_filename)?;

  info!("File hash: {}", private_bucket_hash);

  // NB: /.../a/b/c/d/abcdefg.bin
  let object_name = hash_to_bucket_path(
    &private_bucket_hash,
    Some(&downloader.bucket_root_tts_model_uploads))?;

  info!("Destination bucket path: {}", object_name);

  let file_path = PathBuf::from(download_filename);
  downloader.bucket_client.upload_filename(&object_name, &file_path).await?;

  info!("Saving model record...");
  let (id, model_token) = insert_tts_model(
    &downloader.mysql_pool,
    job,
    &private_bucket_hash,
    &object_name)
    .await?;

  info!("Saved model record: {}", id);

  downloader.firehose_publisher.publish_tts_model_upload_finished(&job.creator_user_token, &model_token)
      .await
      .map_err(|e| {
        warn!("error publishing event: {:?}", e);
        anyhow!("error publishing event")
      })?;

  info!("Job done: {}", job.id);
  mark_tts_upload_job_done(&downloader.mysql_pool, job, true).await?;

  Ok(())
}
