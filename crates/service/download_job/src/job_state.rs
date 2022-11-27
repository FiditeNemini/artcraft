use crate::job_types::hifigan::hifigan_model_check_command::HifiGanModelCheckCommand;
use database_queries::mediators::badge_granter::BadgeGranter;
use database_queries::mediators::firehose_publisher::FirehosePublisher;
use google_drive_common::google_drive_download_command::GoogleDriveDownloadCommand;
use r2d2_redis::RedisConnectionManager;
use r2d2_redis::r2d2;
use sqlx::MySqlPool;
use std::path::PathBuf;
use storage_buckets_common::bucket_client::BucketClient;
use storage_buckets_common::bucket_path_unifier::BucketPathUnifier;

pub struct JobState {
  pub download_temp_directory: PathBuf,
  pub mysql_pool: MySqlPool,

  pub redis_pool: r2d2::Pool<RedisConnectionManager>,

  pub bucket_client: BucketClient,
  pub firehose_publisher: FirehosePublisher,
  pub badge_granter: BadgeGranter,
  pub google_drive_downloader: GoogleDriveDownloadCommand,

  pub bucket_path_unifier: BucketPathUnifier,

  pub hifigan_model_check_command: HifiGanModelCheckCommand,

  // Command to run
  pub download_script: String,
  // Root to store TTS results
  pub bucket_root_tts_model_uploads: String,

  // Sleep between batches
  pub job_batch_wait_millis: u64,

  // How long to wait between log lines
  pub no_op_logger_millis: u64,

  // Max job attempts before failure.
  // NB: This is an i32 so we don't need to convert to db column type.
  pub job_max_attempts: i32,
}
