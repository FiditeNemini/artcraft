#![forbid(private_in_public)]
#![forbid(unused_must_use)]
//#![forbid(warnings)]

#![allow(dead_code)]
#![allow(non_snake_case)]
#![allow(unused_imports)]
#![allow(unused_mut)]
#![allow(unused_variables)]

#[macro_use] extern crate serde_derive;

pub mod buckets;
pub mod common_env;
pub mod common_queries;
pub mod database_helpers;
pub mod job_queries;
pub mod script_execution;
pub mod shared_constants;
pub mod util;

use anyhow::anyhow;
use chrono::Utc;
use crate::buckets::bucket_client::BucketClient;
use crate::buckets::bucket_path_unifier::BucketPathUnifier;
use crate::buckets::bucket_paths::hash_to_bucket_path;
use crate::common_env::CommonEnv;
use crate::common_queries::firehose_publisher::FirehosePublisher;
use crate::job_queries::tts_download_job_queries::TtsUploadJobRecord;
use crate::job_queries::tts_download_job_queries::grab_job_lock_and_mark_pending;
use crate::job_queries::tts_download_job_queries::insert_tts_model;
use crate::job_queries::tts_download_job_queries::mark_tts_upload_job_done;
use crate::job_queries::tts_download_job_queries::mark_tts_upload_job_failure;
use crate::job_queries::tts_download_job_queries::query_tts_upload_job_records;
use crate::script_execution::google_drive_download_command::GoogleDriveDownloadCommand;
use crate::script_execution::tacotron_model_check_command::TacotronModelCheckCommand;
use crate::util::anyhow_result::AnyhowResult;
use crate::util::filesystem::{check_directory_exists, check_file_exists};
use crate::util::hashing::hash_file_sha2::hash_file_sha2;
use crate::util::random_crockford_token::random_crockford_token;
use data_encoding::{HEXUPPER, HEXLOWER, HEXLOWER_PERMISSIVE};
use log::{warn, info};
use ring::digest::{Context, Digest, SHA256};
use shared_constants::DEFAULT_MYSQL_CONNECTION_STRING;
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

// Python code
const ENV_CODE_DIRECTORY : &'static str = "TTS_CODE_DIRECTORY";
const ENV_MODEL_CHECK_SCRIPT_NAME : &'static str = "TTS_MODEL_CHECK_SCRIPT_NAME";

struct Downloader {
  pub download_temp_directory: PathBuf,
  pub mysql_pool: MySqlPool,
  pub bucket_client: BucketClient,
  pub firehose_publisher: FirehosePublisher,
  pub google_drive_downloader: GoogleDriveDownloadCommand,

  pub bucket_path_unifier: BucketPathUnifier,

  pub tts_check: TacotronModelCheckCommand,

  // Command to run
  pub download_script: String,
  // Root to store TTS results
  pub bucket_root_tts_model_uploads: String,

  // Sleep between batches
  pub job_batch_wait_millis: u64,

  // Max job attempts before failure.
  // NB: This is an i32 so we don't need to convert to db column type.
  pub job_max_attempts: i32,
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
      DEFAULT_MYSQL_CONNECTION_STRING);

  info!("Connecting to database...");

  let mysql_pool = MySqlPoolOptions::new()
    .max_connections(5)
    .connect(&db_connection_string)
    .await?;

  let firehose_publisher = FirehosePublisher {
    mysql_pool: mysql_pool.clone(), // NB: Pool is sync/send/clone-safe
  };

  let py_code_directory = easyenv::get_env_string_required(ENV_CODE_DIRECTORY)?;
  let py_script_name = easyenv::get_env_string_required(ENV_MODEL_CHECK_SCRIPT_NAME)?;

  let tts_model_check_command= TacotronModelCheckCommand::new(
    &py_code_directory,
    &py_script_name,
  );

  let common_env = CommonEnv::read_from_env()?;

  let downloader = Downloader {
    download_temp_directory: temp_directory,
    mysql_pool,
    bucket_client,
    download_script,
    google_drive_downloader,
    bucket_path_unifier: BucketPathUnifier::default_paths(),
    bucket_root_tts_model_uploads: bucket_root.to_string(),
    firehose_publisher,
    tts_check: tts_model_check_command,
    job_batch_wait_millis: common_env.job_batch_wait_millis,
    job_max_attempts: common_env.job_max_attempts as i32,
  };

  main_loop(downloader).await;

  Ok(())
}

const START_TIMEOUT_MILLIS : u64 = 500;
const INCREASE_TIMEOUT_MILLIS : u64 = 1000;

async fn main_loop(downloader: Downloader) {
  let mut error_timeout_millis = START_TIMEOUT_MILLIS;

  loop {
    let num_records = 1;
    let query_result = query_tts_upload_job_records(&downloader.mysql_pool, num_records).await;

    let jobs = match query_result {
      Ok(jobs) => jobs,
      Err(e) => {
        warn!("Error querying jobs: {:?}", e);
        std::thread::sleep(Duration::from_millis(error_timeout_millis));
        error_timeout_millis += INCREASE_TIMEOUT_MILLIS;
        continue;
      }
    };

    if jobs.is_empty() {
      info!("No jobs!");
      std::thread::sleep(Duration::from_millis(downloader.job_batch_wait_millis));
      continue;
    }

    let result = process_jobs(&downloader, jobs).await;

    match result {
      Ok(_) => {},
      Err(e) => {
        warn!("Error querying jobs: {:?}", e);
        std::thread::sleep(Duration::from_millis(error_timeout_millis));
        error_timeout_millis += INCREASE_TIMEOUT_MILLIS;
        continue;
      }
    }

    error_timeout_millis = START_TIMEOUT_MILLIS; // reset

    std::thread::sleep(Duration::from_millis(downloader.job_batch_wait_millis));
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
        let _r = mark_tts_upload_job_failure(
          &downloader.mysql_pool,
          &job,
          failure_reason,
          downloader.job_max_attempts
        ).await;
      }
    }
  }

  Ok(())
}

#[derive(Deserialize)]
struct FileMetadata {
  pub file_size_bytes: u64,
}

fn read_metadata_file(filename: &PathBuf) -> AnyhowResult<FileMetadata> {
  let mut file = File::open(filename)?;
  let mut buffer = String::new();
  file.read_to_string(&mut buffer)?;
  Ok(serde_json::from_str(&buffer)?)
}

async fn process_job(downloader: &Downloader, job: &TtsUploadJobRecord) -> AnyhowResult<()> {
  // TODO: 1. Mark processing. (DONE)
  // TODO: 2. Download. (DONE)
  // TODO: 3. Upload. (DONE)
  // TODO: 4. Save record. (DONE)
  // TODO: 5. Mark job done. (DONE)

  // ==================== ATTEMPT TO GRAB JOB LOCK ==================== //

  let lock_acquired = grab_job_lock_and_mark_pending(&downloader.mysql_pool, job).await?;

  if !lock_acquired {
    warn!("Could not acquire job lock for: {}", &job.id);
    return Ok(())
  }

  // ==================== SETUP TEMP DIRS ==================== //

  let temp_dir = format!("temp_{}", job.id);
  let temp_dir = TempDir::new(&temp_dir)?;

  // ==================== DOWNLOAD MODEL FILE ==================== //

  let download_url = job.download_url.as_ref()
    .map(|c| c.to_string())
    .unwrap_or("".to_string());

  info!("Calling downloader...");
  let download_filename = downloader.google_drive_downloader
    .download_file(&download_url, &temp_dir).await?;

  let private_bucket_hash = hash_file_sha2(&download_filename)?;

  info!("File hash: {}", private_bucket_hash);

  let synthesizer_model_bucket_path = downloader.bucket_path_unifier.tts_synthesizer_path(
    &private_bucket_hash);

  info!("Destination bucket path: {:?}", &synthesizer_model_bucket_path);


  // ==================== RUN MODEL CHECK ==================== //

  info!("Checking that model is valid...");

  let file_path = PathBuf::from(download_filename);

  let output_metadata_fs_path = temp_dir.path().join("metadata.json");

  downloader.tts_check.execute(
    &file_path,
    &output_metadata_fs_path,
    false,
  )?;

  // ==================== CHECK ALL FILES EXIST AND GET METADATA ==================== //

  info!("Checking that metadata output file exists...");

  check_file_exists(&output_metadata_fs_path)?;

  let file_metadata = read_metadata_file(&output_metadata_fs_path)?;

  // ==================== UPLOAD MODEL FILE ==================== //

  info!("Uploading model to GCS...");

  downloader.bucket_client.upload_filename(&synthesizer_model_bucket_path, &file_path).await?;

  // ==================== SAVE RECORDS ==================== //

  info!("Saving model record...");
  let (id, model_token) = insert_tts_model(
    &downloader.mysql_pool,
    job,
    &private_bucket_hash,
    synthesizer_model_bucket_path,
    file_metadata.file_size_bytes)
    .await?;

  info!("Marking job complete...");
  mark_tts_upload_job_done(
    &downloader.mysql_pool,
    job,
    true,
    Some(&model_token)
  ).await?;

  info!("Saved model record: {}", id);

  downloader.firehose_publisher.publish_tts_model_upload_finished(&job.creator_user_token, &model_token)
      .await
      .map_err(|e| {
        warn!("error publishing event: {:?}", e);
        anyhow!("error publishing event")
      })?;

  info!("Job done: {}", job.id);

  Ok(())
}
