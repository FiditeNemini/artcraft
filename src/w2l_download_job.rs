#![deny(unused_must_use)]
#![allow(dead_code)]
#![allow(unused_mut)]
#![allow(unused_imports)]
#![warn(unused_must_use)]
//#![allow(warnings)]

pub mod buckets;
pub mod job_queries;
pub mod script_execution;
pub mod util;

use anyhow::anyhow;
use chrono::Utc;
use crate::buckets::bucket_client::BucketClient;
use crate::buckets::bucket_paths::hash_to_bucket_path;
use crate::buckets::file_hashing::get_file_hash;
use crate::job_queries::w2l_download_job_queries::W2lTemplateUploadJobRecord;
use crate::job_queries::w2l_download_job_queries::insert_w2l_template;
use crate::job_queries::w2l_download_job_queries::mark_w2l_template_upload_job_done;
use crate::job_queries::w2l_download_job_queries::mark_w2l_template_upload_job_failure;
use crate::job_queries::w2l_download_job_queries::query_w2l_template_upload_job_records;
use crate::script_execution::google_drive_download_command::GoogleDriveDownloadCommand;
use crate::util::anyhow_result::AnyhowResult;
use crate::util::filesystem::check_directory_exists;
use crate::util::random_token::random_token;
use data_encoding::{HEXUPPER, HEXLOWER, HEXLOWER_PERMISSIVE};
use log::{warn, info};
use ring::digest::{Context, Digest, SHA256};
use sqlx::MySqlPool;
use sqlx::mysql::MySqlPoolOptions;
use std::fs::File;
use std::io::{BufReader, Read};
use std::path::{PathBuf, Path};
use std::process::Command;
use std::time::Duration;
use tempdir::TempDir;
use crate::script_execution::wav2lip_process_upload_command::Wav2LipPreprocessClient;

// Buckets
const ENV_ACCESS_KEY : &'static str = "ACCESS_KEY";
const ENV_SECRET_KEY : &'static str = "SECRET_KEY";
const ENV_REGION_NAME : &'static str = "REGION_NAME";
const ENV_BUCKET_NAME : &'static str = "W2L_DOWNLOAD_BUCKET_NAME";
const ENV_BUCKET_ROOT : &'static str = "W2L_DOWNLOAD_BUCKET_ROOT";

// Python code
const ENV_CODE_DIRECTORY : &'static str = "W2L_CODE_DIRECTORY";
const ENV_MODEL_CHECKPOINT : &'static str = "W2L_MODEL_CHECKPOINT";
const ENV_SCRIPT_NAME : &'static str = "W2L_SCRIPT_NAME";

const DEFAULT_RUST_LOG: &'static str = "debug,actix_web=info";
const DEFAULT_TEMP_DIR: &'static str = "/tmp";

struct Downloader {
  pub download_temp_directory: PathBuf,
  pub mysql_pool: MySqlPool,
  pub bucket_client: BucketClient,
  pub google_drive_downloader: GoogleDriveDownloadCommand,
  pub w2l_processor: Wav2LipPreprocessClient,
  // Command to run
  pub download_script: String,
  // Root to store W2L templates
  pub bucket_root_w2l_template_uploads: String,
}

#[tokio::main]
async fn main() -> AnyhowResult<()> {
  easyenv::init_all_with_default_logging(Some(DEFAULT_RUST_LOG));

  let _ = dotenv::from_filename(".env-secrets").ok();

  info!("Obtaining hostname...");

  let server_hostname = hostname::get()
    .ok()
    .and_then(|h| h.into_string().ok())
    .unwrap_or("w2l-download-job".to_string());

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

  let py_code_directory = easyenv::get_env_string_required(ENV_CODE_DIRECTORY)?;
  let py_script_name = easyenv::get_env_string_required(ENV_SCRIPT_NAME)?;
  let py_model_checkpoint = easyenv::get_env_string_required(ENV_MODEL_CHECKPOINT)?;

  let w2l_preprecess_command = Wav2LipPreprocessClient::new(
    &py_code_directory,
    &py_script_name,
    &py_model_checkpoint,
  );

  let temp_directory = easyenv::get_env_string_or_default(
    "DOWNLOAD_TEMP_DIR",
    DEFAULT_TEMP_DIR);

  let download_script = easyenv::get_env_string_or_default(
    "DOWNLOAD_SCRIPT",
    "./scripts/download_gdrive.py");

  let google_drive_downloader = GoogleDriveDownloadCommand::new(&download_script);

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
    bucket_client,
    download_script,
    google_drive_downloader,
    w2l_processor: w2l_preprecess_command,
    bucket_root_w2l_template_uploads: bucket_root.to_string(),
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

    let query_result = query_w2l_template_upload_job_records(
      &downloader.mysql_pool,
      num_records)
      .await;

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

async fn process_jobs(downloader: &Downloader, jobs: Vec<W2lTemplateUploadJobRecord>) -> AnyhowResult<()> {
  for job in jobs.into_iter() {
    let result = process_job(downloader, &job).await;
    match result {
      Ok(_) => {},
      Err(e) => {
        warn!("Failure to process job: {:?}", e);
        let failure_reason = "";
        let _r = mark_w2l_template_upload_job_failure(
          &downloader.mysql_pool,
          &job,
          failure_reason)
          .await;
      }
    }
  }

  Ok(())
}

async fn process_job(downloader: &Downloader, job: &W2lTemplateUploadJobRecord) -> AnyhowResult<()> {
  // TODO: 1. Mark processing.
  // TODO: 2. Download. (DONE)
  // TODO: 3. Process template with face detection
  // TODO: 4. Take a screenshot/gif
  // TODO: 5. Upload all (partially done).
  // TODO: 6. Save record. (DONE)
  // TODO: 7. Mark job done. (DONE)

  let temp_dir = format!("temp_{}", job.id);
  let temp_dir = TempDir::new(&temp_dir)?;

  let download_url = job.download_url.as_ref()
    .map(|c| c.to_string())
    .unwrap_or("".to_string());

  // ==================== DOWNLOAD FILE ==================== //

  info!("Calling downloader...");
  let download_filename = downloader.google_drive_downloader
    .download_file(&download_url, &temp_dir).await?;

  let file_path = PathBuf::from(&download_filename);

  // ==================== PROCESS FACES ==================== //

  let cached_faces_filename = format!("{}_detected_faces.pickle", &download_filename);
  let is_image = false; // TODO: Don't always treat as video.
  let spawn_process = true;

  downloader.w2l_processor.execute(
    &download_filename,
    &cached_faces_filename,
    is_image,
    spawn_process)?;


  // ==================== UPLOAD TO BUCKET ==================== //

  let private_bucket_hash = get_file_hash(&download_filename)?;

  info!("File hash: {}", private_bucket_hash);

  // Full path to video/image
  let full_object_path = hash_to_bucket_path(
    &private_bucket_hash,
    Some(&downloader.bucket_root_w2l_template_uploads))?;

  info!("Image/video destination bucket path: {}", full_object_path);

  // Full path to cached faces
  let full_object_path_cached_faces = format!("{}_detected_faces.pickle", full_object_path);

  info!("Cached faces destination bucket path: {}", full_object_path_cached_faces);

  info!("Uploading image/video...");
  downloader.bucket_client.upload_filename(&full_object_path, &file_path).await?;

  let cached_faces_path = PathBuf::from(&cached_faces_filename);

  info!("Uploading cached faces...");
  downloader.bucket_client.upload_filename(&full_object_path_cached_faces, &cached_faces_path).await?;

  // TODO:
  let template_type = "image";

  info!("Saving model record...");
  let id = insert_w2l_template(
    &downloader.mysql_pool,
    template_type,
    job,
    &private_bucket_hash,
    &full_object_path,
    &full_object_path_cached_faces)
    .await?;

  info!("Saved model record: {}", id);

  info!("Job done: {}", job.id);
  mark_w2l_template_upload_job_done(&downloader.mysql_pool, job, true).await?;

  Ok(())
}
