use anyhow::{anyhow, Error};
use chrono::{Utc, DateTime, TimeZone};
use clap::{App, Arg};
use config::common_env::CommonEnv;
use config::shared_constants::DEFAULT_MYSQL_CONNECTION_STRING;
use config::shared_constants::DEFAULT_RUST_LOG;
use container_common::anyhow_result::AnyhowResult;
use container_common::collections::multiple_random_from_vec::multiple_random_from_vec;
use container_common::filesystem::check_directory_exists::check_directory_exists;
use container_common::filesystem::check_file_exists::check_file_exists;
use container_common::filesystem::safe_delete_temp_directory::safe_delete_temp_directory;
use container_common::filesystem::safe_delete_temp_file::safe_delete_temp_file;
use container_common::hashing::hash_string_sha2::hash_string_sha2;
use container_common::token::random_uuid::generate_random_uuid;
use crate::caching::cache_miss_strategizer::CacheMissStrategizer;
use crate::caching::cache_miss_strategizer::CacheMissStrategy;
use crate::caching::cache_miss_strategizer_multi::SyncMultiCacheMissStrategizer;
use crate::caching::virtual_lfu_cache::SyncVirtualLfuCache;
use crate::http_clients::tts_inference_sidecar_client::TtsInferenceSidecarClient;
use crate::job_steps::process_single_job::process_single_job;
use crate::job_steps::process_single_job_error::ProcessSingleJobError;
use crate::script_execution::tacotron_inference_command::TacotronInferenceCommand;
use database_queries::column_types::vocoder_type::VocoderType;
use database_queries::mediators::firehose_publisher::FirehosePublisher;
use database_queries::queries::tts::tts_inference_jobs::list_available_tts_inference_jobs::{AvailableTtsInferenceJob, list_available_tts_inference_jobs, list_available_tts_inference_jobs_with_minimum_priority};
use database_queries::queries::tts::tts_inference_jobs::mark_tts_inference_job_done::mark_tts_inference_job_done;
use database_queries::queries::tts::tts_inference_jobs::mark_tts_inference_job_failure::mark_tts_inference_job_failure;
use database_queries::queries::tts::tts_inference_jobs::mark_tts_inference_job_pending_and_grab_lock::mark_tts_inference_job_pending_and_grab_lock;
use database_queries::queries::tts::tts_inference_jobs::mark_tts_inference_job_permanently_dead::mark_tts_inference_job_permanently_dead;
use database_queries::queries::tts::tts_models::get_tts_model_for_inference::{get_tts_model_for_inference, TtsModelForInferenceError, TtsModelForInferenceRecord};
use database_queries::queries::tts::tts_results::insert_tts_result::insert_tts_result;
use jobs_common::noop_logger::NoOpLogger;
use jobs_common::redis_job_status_logger::RedisJobStatusLogger;
use jobs_common::semi_persistent_cache_dir::SemiPersistentCacheDir;
use log::{warn, info, error};
use newrelic_telemetry::Client as NewRelicClient;
use newrelic_telemetry::ClientBuilder;
use newrelic_telemetry::Span;
use r2d2_redis::RedisConnectionManager;
use r2d2_redis::r2d2::PooledConnection;
use r2d2_redis::r2d2;
use r2d2_redis::redis::Commands;
use sqlx::MySqlPool;
use sqlx::mysql::MySqlPoolOptions;
use std::collections::HashMap;
use std::fs::{File, metadata};
use std::io::{BufReader, Read, ErrorKind};
use std::ops::Deref;
use std::path::{PathBuf, Path};
use std::process::Command;
use std::thread;
use std::time::{Duration, SystemTime, UNIX_EPOCH, Instant};
use storage_buckets_common::bucket_client::BucketClient;
use storage_buckets_common::bucket_path_unifier::BucketPathUnifier;
use tempdir::TempDir;
use tts_common::clean_symbols::clean_symbols;

pub struct JobArgs {
  pub download_temp_directory: PathBuf,
  pub mysql_pool: MySqlPool,

  pub redis_pool: r2d2::Pool<RedisConnectionManager>,

  pub private_bucket_client: BucketClient,
  pub public_bucket_client: BucketClient,

  pub firehose_publisher: FirehosePublisher,

  pub bucket_path_unifier: BucketPathUnifier,
  pub semi_persistent_cache: SemiPersistentCacheDir,

  pub tts_inference_command: TacotronInferenceCommand,
  pub tts_inference_sidecar_client: TtsInferenceSidecarClient,

  pub newrelic_client: NewRelicClient,

  pub newrelic_disabled: bool,

  pub worker_details: JobWorkerDetails,

  // Keep tabs of which models to hold in the sidecar memory with this virtual LRU cache
  pub virtual_model_lfu: SyncVirtualLfuCache,
  pub cache_miss_strategizers: SyncMultiCacheMissStrategizer,

  // Waveglow vocoder filename
  pub waveglow_vocoder_model_filename: String,

  // Hifigan vocoder filename
  pub hifigan_vocoder_model_filename: String,

  // Hifigan super resolution vocoder filename
  pub hifigan_superres_vocoder_model_filename: String,

  // Sleep between batches
  pub job_batch_wait_millis: u64,

  // Max job attempts before failure.
  // NB: This is an i32 so we don't need to convert to db column type.
  pub job_max_attempts: i32,

  // Number of jobs to dequeue at once.
  pub job_batch_size: u32,

  // How long to wait between log lines
  pub no_op_logger_millis: u64,

  // Maximum number of synthesizer models to hold in memory.
  pub sidecar_max_synthesizer_models: usize,

  // Typically we'll sort jobs by priority. Occasionally we introduce a chance for low
  // priority jobs to run in the order they were enqueued.
  // If this is set to "0", we no longer consider priority
  pub low_priority_starvation_prevention_every_nth: usize,

  // A worker can be configured to only run jobs of a certain priority.
  // This finds jobs of equal or greater priority.
  pub maybe_minimum_priority: Option<u8>,
}

pub struct JobWorkerDetails {
  // Debug workers only process special debug requests. They're silent otherwise.
  // Non-debug workers ignore debug requests. This is so we can deploy special code
  // to debug nodes (typically just one, perhaps even ephemerally).
  pub is_debug_worker: bool,

  // The worker is "on-premises".
  pub is_on_prem: bool,

  // Hostname of the worker.
  pub worker_hostname: String,
}
