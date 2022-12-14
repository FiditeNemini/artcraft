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

#[macro_use] extern crate serde_derive;

pub mod job_state;
pub mod job_steps;
pub mod job_types;

use config::common_env::CommonEnv;
use config::shared_constants::DEFAULT_MYSQL_CONNECTION_STRING;
use config::shared_constants::DEFAULT_RUST_LOG;
use container_common::anyhow_result::AnyhowResult;
use container_common::filesystem::check_directory_exists::check_directory_exists;
use crate::job_state::{JobState, SidecarConfigs};
use crate::job_steps::main_loop::main_loop;
use crate::job_types::hifigan::hifigan_model_check_command::HifiGanModelCheckCommand;
use crate::job_types::tacotron::tacotron_model_check_command::TacotronModelCheckCommand;
use database_queries::mediators::badge_granter::BadgeGranter;
use database_queries::mediators::firehose_publisher::FirehosePublisher;
use google_drive_common::google_drive_download_command::GoogleDriveDownloadCommand;
use log::info;
use r2d2_redis::RedisConnectionManager;
use r2d2_redis::r2d2;
use sqlx::mysql::MySqlPoolOptions;
use std::ops::Deref;
use std::path::PathBuf;
use std::time::Duration;
use storage_buckets_common::bucket_client::BucketClient;
use storage_buckets_common::bucket_path_unifier::BucketPathUnifier;
use subprocess_common::docker_options::{DockerFilesystemMount, DockerGpu, DockerOptions};

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

  let _ = dotenv::from_filename(".env-download-job").ok(); // NB: Specific to `download-job` app.
  let _ = dotenv::from_filename(".env-secrets").ok(); // NB: Secrets not to live in source control.

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

  let bucket_timeout = easyenv::get_env_duration_seconds_or_default("BUCKET_TIMEOUT_SECONDS",
    Duration::from_secs(60 * 5));

  let bucket_client = BucketClient::create(
    &access_key,
    &secret_key,
    &region_name,
    &bucket_name,
    None,
    Some(bucket_timeout),
  )?;

  let temp_directory = easyenv::get_env_string_or_default(
    "DOWNLOAD_TEMP_DIR",
    DEFAULT_TEMP_DIR);

  // =============== Configure Python "Sidecars" ===============

  let google_drive_downloader = {
    let maybe_root_directory = easyenv::get_env_string_optional(
      "WEB_DOWNLOADER_MAYBE_ROOT_DIRECTORY");

    let downloader_command= easyenv::get_env_string_or_default(
      "WEB_DOWNLOADER_COMMAND", // TODO: Was "DOWNLOAD_SCRIPT" in old apps
      "./download_internet_file.py");

    let maybe_downloader_venv_script = easyenv::get_env_string_optional(
      "WEB_DOWNLOADER_MAYBE_VENV_SCRIPT");

    let docker_options = easyenv::get_env_string_optional(
      "WEB_DOWNLOADER_MAYBE_DOCKER_IMAGE")
        .map(|image_name| {
            DockerOptions {
              image_name,
              maybe_bind_mount: Some(DockerFilesystemMount::tmp_to_tmp()),
              maybe_gpu: None,
            }
          });

    GoogleDriveDownloadCommand::new(
      &downloader_command,
      maybe_root_directory.as_deref(),
      maybe_downloader_venv_script.as_deref(),
      docker_options,
    )
  };

  let tacotron_model_check_command = {
    let root_directory = easyenv::get_env_string_required(
      "TACOTRON_MODEL_CHECK_ROOT_DIRECTORY")?;

    let python_command = easyenv::get_env_string_or_default(
      "TACOTRON_MODEL_CHECK_COMMAND",
      "./vocodes_model_check_tacotron.py");

    let maybe_venv_command = easyenv::get_env_string_optional(
      "TACOTRON_MODEL_CHECK_MAYBE_VENV_COMMAND");

    let maybe_docker_options = easyenv::get_env_string_optional(
      "TACOTRON_MODEL_CHECK_MAYBE_DOCKER_IMAGE")
        .map(|image_name| {
          DockerOptions {
            image_name,
            maybe_bind_mount: Some(DockerFilesystemMount::tmp_to_tmp()),
            maybe_gpu: Some(DockerGpu::All),
          }
        });

    TacotronModelCheckCommand::new(
      &root_directory,
      maybe_venv_command.as_deref(),
      &python_command,
      maybe_docker_options,
    )
  };

  let hifigan_model_check_command= {
    let root_directory = easyenv::get_env_string_required(
      "HIFIGAN_MODEL_CHECK_ROOT_DIRECTORY")?;

    let python_command = easyenv::get_env_string_or_default(
      "HIFIGAN_MODEL_CHECK_COMMAND",
      "./vocodes_model_check_tacotron.py");

    let maybe_venv_command = easyenv::get_env_string_optional(
      "HIFIGAN_MODEL_CHECK_MAYBE_VENV_COMMAND");

    let maybe_docker_options = easyenv::get_env_string_optional(
      "HIFIGAN_MODEL_CHECK_MAYBE_DOCKER_IMAGE")
        .map(|image_name| {
          DockerOptions {
            image_name,
            maybe_bind_mount: Some(DockerFilesystemMount::tmp_to_tmp()),
            maybe_gpu: Some(DockerGpu::All),
          }
        });

    HifiGanModelCheckCommand::new(
      &root_directory,
      maybe_venv_command.as_deref(),
      &python_command,
      maybe_docker_options,
    )
  };

  // =============== End Configure Python "Sidecars" ===============

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


  let job_state = JobState {
    download_temp_directory: temp_directory,
    mysql_pool,
    redis_pool,
    bucket_client,
    bucket_path_unifier: BucketPathUnifier::default_paths(),
    bucket_root_tts_model_uploads: bucket_root.to_string(),
    firehose_publisher,
    badge_granter,
    sidecar_configs: SidecarConfigs {
      google_drive_downloader,
      tacotron_model_check_command,
      hifigan_model_check_command,
    },
    job_batch_wait_millis: common_env.job_batch_wait_millis,
    job_max_attempts: common_env.job_max_attempts as i32,
    no_op_logger_millis: common_env.no_op_logger_millis,
  };

  main_loop(job_state).await;

  Ok(())
}
