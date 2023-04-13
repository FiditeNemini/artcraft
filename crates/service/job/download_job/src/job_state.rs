use cloud_storage::bucket_client::BucketClient;
use cloud_storage::bucket_path_unifier::BucketPathUnifier;
use crate::job_types::tts::tacotron::tacotron_model_check_command::TacotronModelCheckCommand;
use crate::job_types::tts::vits::vits_model_check_command::VitsModelCheckCommand;
use crate::job_types::vocoder::hifigan_softvc::hifigan_softvc_model_check_command::HifiGanSoftVcModelCheckCommand;
use crate::job_types::vocoder::hifigan_tacotron::hifigan_model_check_command::HifiGanModelCheckCommand;
use crate::job_types::voice_conversion::softvc::softvc_model_check_command::SoftVcModelCheckCommand;
use google_drive_common::google_drive_download_command::GoogleDriveDownloadCommand;
use mysql_queries::mediators::badge_granter::BadgeGranter;
use mysql_queries::mediators::firehose_publisher::FirehosePublisher;
use r2d2_redis::RedisConnectionManager;
use r2d2_redis::r2d2;
use sqlx::MySqlPool;
use std::path::PathBuf;
use crate::job_types::voice_conversion::so_vits_svc::so_vits_svc_model_check_command::SoVitsSvcModelCheckCommand;

pub struct JobState {
  pub download_temp_directory: PathBuf,
  pub mysql_pool: MySqlPool,

  pub redis_pool: r2d2::Pool<RedisConnectionManager>,

  pub bucket_client: BucketClient,
  pub firehose_publisher: FirehosePublisher,
  pub badge_granter: BadgeGranter,

  pub bucket_path_unifier: BucketPathUnifier,

  pub sidecar_configs: SidecarConfigs,

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

/// Configurations and interfaces to code deployed as sidecars or container mounts.
pub struct SidecarConfigs {
  pub google_drive_downloader: GoogleDriveDownloadCommand,
  pub softvc_model_check_command: SoftVcModelCheckCommand,
  pub so_vits_svc_model_check_command: SoVitsSvcModelCheckCommand,
  pub tacotron_model_check_command: TacotronModelCheckCommand,
  pub hifigan_model_check_command: HifiGanModelCheckCommand,
  pub hifigan_softvc_model_check_command: HifiGanSoftVcModelCheckCommand,
  pub vits_model_check_command: VitsModelCheckCommand,
}