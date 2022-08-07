#![forbid(private_in_public)]
#![forbid(unused_must_use)]
//#![forbid(warnings)]

#![allow(dead_code)]
#![allow(non_snake_case)]
#![allow(unused_imports)]
#![allow(unused_mut)]
#![allow(unused_variables)]

#[macro_use] extern crate serde_derive;

pub mod job_state;
pub mod job_steps;
pub mod script_execution;

use anyhow::anyhow;
use chrono::Utc;
use config::bad_urls::is_bad_tts_model_download_url;
use config::common_env::CommonEnv;
use config::shared_constants::DEFAULT_MYSQL_CONNECTION_STRING;
use config::shared_constants::DEFAULT_RUST_LOG;
use container_common::anyhow_result::AnyhowResult;
use container_common::filesystem::check_directory_exists::check_directory_exists;
use container_common::filesystem::check_file_exists::check_file_exists;
use container_common::filesystem::safe_delete_temp_directory::safe_delete_temp_directory;
use container_common::filesystem::safe_delete_temp_file::safe_delete_temp_file;
use container_common::hashing::hash_file_sha2::hash_file_sha2;
use crate::job_state::JobState;
use crate::job_steps::process_single_job::process_single_job;
use crate::script_execution::hifigan_model_check_command::HifiGanModelCheckCommand;
use crate::script_execution::tacotron_model_check_command::TacotronModelCheckCommand;
use crate::script_execution::talknet_model_check_command::TalknetModelCheckCommand;
use database_queries::column_types::tts_model_type::TtsModelType;
use database_queries::mediators::badge_granter::BadgeGranter;
use database_queries::mediators::firehose_publisher::FirehosePublisher;
use database_queries::queries::generic_download::job::list_available_generic_download_jobs::{AvailableDownloadJob, list_available_generic_download_jobs};
use database_queries::queries::generic_download::job::mark_generic_download_job_failure::mark_generic_download_job_failure;
use database_queries::queries::tts::tts_download_jobs::tts_download_job_queries::TtsUploadJobRecord;
use database_queries::queries::tts::tts_download_jobs::tts_download_job_queries::grab_job_lock_and_mark_pending;
use database_queries::queries::tts::tts_download_jobs::tts_download_job_queries::insert_tts_model;
use database_queries::queries::tts::tts_download_jobs::tts_download_job_queries::mark_tts_upload_job_done;
use database_queries::queries::tts::tts_download_jobs::tts_download_job_queries::query_tts_upload_job_records;
use google_drive_common::google_drive_download_command::GoogleDriveDownloadCommand;
use jobs_common::noop_logger::NoOpLogger;
use jobs_common::redis_job_status_logger::RedisJobStatusLogger;
use log::{warn, info};
use r2d2_redis::RedisConnectionManager;
use r2d2_redis::r2d2;
use sqlx::MySqlPool;
use sqlx::mysql::MySqlPoolOptions;
use std::fs::File;
use std::fs;
use std::io::{BufReader, Read, Error};
use std::ops::Deref;
use std::path::{PathBuf, Path};
use std::process::Command;
use std::time::Duration;
use storage_buckets_common::bucket_client::BucketClient;
use storage_buckets_common::bucket_path_unifier::BucketPathUnifier;
use tempdir::TempDir;

// Buckets
const ENV_ACCESS_KEY : &'static str = "ACCESS_KEY";
const ENV_SECRET_KEY : &'static str = "SECRET_KEY";
const ENV_REGION_NAME : &'static str = "REGION_NAME";
const ENV_BUCKET_NAME : &'static str = "TTS_DOWNLOAD_BUCKET_NAME";
const ENV_BUCKET_ROOT : &'static str = "TTS_DOWNLOAD_BUCKET_ROOT";

const DEFAULT_TEMP_DIR: &'static str = "/tmp";

#[tokio::main]
async fn main() -> AnyhowResult<()> {
  easyenv::init_all_with_default_logging(Some(DEFAULT_RUST_LOG));

  let _ = dotenv::from_filename(".env-secrets").ok();

  info!("Obtaining hostname...");

  let server_hostname = hostname::get()
    .ok()
    .and_then(|h| h.into_string().ok())
    .unwrap_or("generic-download-job".to_string());

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

  let common_env = CommonEnv::read_from_env()?;

  info!("Connecting to redis...");

  let redis_manager =
      RedisConnectionManager::new(common_env.redis_0_connection_string.deref())?;

  let redis_pool = r2d2::Pool::builder()
      .build(redis_manager)?;

  let firehose_publisher = FirehosePublisher {
    mysql_pool: mysql_pool.clone(), // NB: Pool is sync/send/clone-safe
  };

  let badge_granter = BadgeGranter {
    mysql_pool: mysql_pool.clone(), // NB: Pool is sync/send/clone-safe
    firehose_publisher: firehose_publisher.clone(), // NB: Also safe
  };

  let hifigan_model_check_command= HifiGanModelCheckCommand::new(
    &easyenv::get_env_string_required("HIFIGAN_ROOT_CODE_DIRECTORY")?,
    &easyenv::get_env_string_or_default(
    "HIFIGAN_VIRTUAL_ENV_ACTIVATION_COMMAND",
    "source python-tacotron/bin/activate"),
  &easyenv::get_env_string_or_default(
    "HIFIGAN_MODEL_CHECK_SCRIPT_NAME",
    "vocodes_model_check_hifigan.py"),
  );

  let job_state = JobState {
    download_temp_directory: temp_directory,
    mysql_pool,
    redis_pool,
    bucket_client,
    download_script,
    google_drive_downloader,
    bucket_path_unifier: BucketPathUnifier::default_paths(),
    bucket_root_tts_model_uploads: bucket_root.to_string(),
    firehose_publisher,
    badge_granter,
    hifigan_model_check_command,
    job_batch_wait_millis: common_env.job_batch_wait_millis,
    job_max_attempts: common_env.job_max_attempts as i32,
    no_op_logger_millis: common_env.no_op_logger_millis,
  };

  main_loop(job_state).await;

  Ok(())
}

const START_TIMEOUT_MILLIS : u64 = 500;
const INCREASE_TIMEOUT_MILLIS : u64 = 1000;

async fn main_loop(job_state: JobState) {
  let mut error_timeout_millis = START_TIMEOUT_MILLIS;

  let mut noop_logger = NoOpLogger::new(job_state.no_op_logger_millis as i64);

  loop {
    let num_records = 1;
    let maybe_available_jobs = list_available_generic_download_jobs(&job_state.mysql_pool, num_records).await;

    let jobs = match maybe_available_jobs {
      Ok(jobs) => jobs,
      Err(e) => {
        warn!("Error querying jobs: {:?}", e);
        std::thread::sleep(Duration::from_millis(error_timeout_millis));
        error_timeout_millis += INCREASE_TIMEOUT_MILLIS;
        continue;
      }
    };

    if jobs.is_empty() {
      noop_logger.log_after_awhile();

      std::thread::sleep(Duration::from_millis(job_state.job_batch_wait_millis));
      continue;
    }

    let result = process_jobs(&job_state, jobs).await;

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

    std::thread::sleep(Duration::from_millis(job_state.job_batch_wait_millis));
  }
}

async fn process_jobs(job_state: &JobState, jobs: Vec<AvailableDownloadJob>) -> AnyhowResult<()> {
  for job in jobs.into_iter() {
    let result = process_single_job(job_state, &job).await;
    match result {
      Ok(_) => {},
      Err(e) => {
        warn!("Failure to process job: {:?}", e);
        let failure_reason = "";
        let _r = mark_generic_download_job_failure(
          &job_state.mysql_pool,
          &job,
          failure_reason,
          job_state.job_max_attempts
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

