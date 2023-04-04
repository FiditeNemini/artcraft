//   // Never allow these
//   #![forbid(private_in_public)]
//   #![forbid(unused_must_use)] // NB: It's unsafe to not close/check some things
//
//   // Okay to toggle
//   //#![forbid(warnings)]
//   //#![forbid(unreachable_patterns)]
//   #![forbid(unused_imports)]
//   #![forbid(unused_mut)]
//   #![forbid(unused_variables)]
//
//   // Always allow
//   #![allow(dead_code)]
//   #![allow(non_snake_case)]

#[macro_use] extern crate serde_derive;

pub mod job;
pub mod util;
pub mod job_dependencies;

use clap::{App, Arg};
use cloud_storage::bucket_client::BucketClient;
use cloud_storage::bucket_path_unifier::BucketPathUnifier;
use config::common_env::CommonEnv;
use config::shared_constants::DEFAULT_MYSQL_CONNECTION_STRING;
use config::shared_constants::DEFAULT_RUST_LOG;
use container_common::anyhow_result::AnyhowResult;
use container_common::filesystem::check_directory_exists::check_directory_exists;
use crate::job::job_loop::job_stats::JobStats;
use crate::job::job_loop::main_loop::main_loop;
use crate::job::job_types::tts::tacotron2_v2_early_fakeyou::tacotron_inference_command::TacotronInferenceCommand;
use crate::job_dependencies::{JobCaches, JobDependencies, JobTypeDetails, JobWorkerDetails, Tacotron2VocodesDetails};
use crate::util::scoped_temp_dir_creator::ScopedTempDirCreator;
use jobs_common::job_progress_reporter::job_progress_reporter::JobProgressReporterBuilder;
use jobs_common::job_progress_reporter::noop_job_progress_reporter::NoOpJobProgressReporterBuilder;
use jobs_common::job_progress_reporter::redis_job_progress_reporter::RedisJobProgressReporterBuilder;
use jobs_common::semi_persistent_cache_dir::SemiPersistentCacheDir;
use log::{error, info, warn};
use memory_caching::multi_item_ttl_cache::MultiItemTtlCache;
use mysql_queries::mediators::firehose_publisher::FirehosePublisher;
use newrelic_telemetry::ClientBuilder;
use r2d2_redis::RedisConnectionManager;
use r2d2_redis::r2d2;
use sqlx::mysql::MySqlPoolOptions;
use std::path::PathBuf;
use std::time::Duration;

// Buckets (shared config)
const ENV_ACCESS_KEY : &'static str = "ACCESS_KEY";
const ENV_SECRET_KEY : &'static str = "SECRET_KEY";
const ENV_REGION_NAME : &'static str = "REGION_NAME";

// Bucket names
const ENV_PRIVATE_BUCKET_NAME : &'static str = "PRIVATE_BUCKET_NAME";
const ENV_PUBLIC_BUCKET_NAME : &'static str = "PUBLIC_BUCKET_NAME";

// Where models and other assets get downloaded to.
const ENV_SEMIPERSISTENT_CACHE_DIR : &'static str = "SEMIPERSISTENT_CACHE_DIR";

// Python code
const ENV_CODE_DIRECTORY : &'static str = "TTS_CODE_DIRECTORY";
const ENV_INFERENCE_SCRIPT_NAME : &'static str = "TTS_INFERENCE_SCRIPT_NAME";

// HTTP sidecar
const ENV_TTS_INFERENCE_SIDECAR_HOSTNAME: &'static str = "TTS_INFERENCE_SIDECAR_HOSTNAME";

const DEFAULT_TEMP_DIR: &'static str = "/tmp";

#[tokio::main]
async fn main() -> AnyhowResult<()> {
  easyenv::init_all_with_default_logging(Some(DEFAULT_RUST_LOG));

  // TODO: Deprecate
  // NB: Do not check this secrets-containing dotenv file into VCS.
  // This file should only contain *development* secrets, never production.
  let _ = dotenv::from_filename(".env-secrets").ok();

  let _ = envvar::read_from_filename_and_paths(
    "inference-job.env",
    &[".", "crates/service/job/inference_job"])?;

  let _ = envvar::read_from_filename_and_paths(
    "inference-job-secrets.env",
    &[".", "crates/service/job/inference_job"]
  ).map_err(|err| {
    // NB: Fail open.
    warn!("Could not load app-specific secrets from env file (this might be fine, eg. provided by k8s): {:?}", err);
  });

  info!("Obtaining worker hostname...");

  let server_hostname = hostname::get()
      .ok()
      .and_then(|h| h.into_string().ok())
      .unwrap_or("inference-job".to_string());

  // NB: These are non-standard env vars we're injecting ourselves.
  let k8s_node_name = easyenv::get_env_string_optional("K8S_NODE_NAME");
  let k8s_pod_name = easyenv::get_env_string_optional("K8S_POD_NAME");

  // NB: It'll be worthwhile to see how much compute is happening at our local on-premises cluster
  // Only our local workers will set this to true.
  let is_on_prem = easyenv::get_env_bool_or_default("IS_ON_PREM", false);

  info!("Hostname: {}", &server_hostname);
  info!("Is on-premises: {}", is_on_prem);

  // Bucket stuff (shared)
  let access_key = easyenv::get_env_string_required(ENV_ACCESS_KEY)?;
  let secret_key = easyenv::get_env_string_required(ENV_SECRET_KEY)?;
  let region_name = easyenv::get_env_string_required(ENV_REGION_NAME)?;

  // Private and Public Buckets
  let private_bucket_name = easyenv::get_env_string_required(ENV_PRIVATE_BUCKET_NAME)?;
  let public_bucket_name = easyenv::get_env_string_required(ENV_PUBLIC_BUCKET_NAME)?;

  let bucket_timeout = easyenv::get_env_duration_seconds_or_default("BUCKET_TIMEOUT_SECONDS",
    Duration::from_secs(60 * 5));

  let private_bucket_client = BucketClient::create(
    &access_key,
    &secret_key,
    &region_name,
    &private_bucket_name,
    None,
    Some(bucket_timeout),
  )?;

  let public_bucket_client = BucketClient::create(
    &access_key,
    &secret_key,
    &region_name,
    &public_bucket_name,
    None,
    Some(bucket_timeout),
  )?;

  let py_code_directory = easyenv::get_env_string_required(ENV_CODE_DIRECTORY)?;
  let py_script_name = easyenv::get_env_string_required(ENV_INFERENCE_SCRIPT_NAME)?;

  let tts_inference_command = TacotronInferenceCommand::new(
    &py_code_directory,
    &py_script_name,
  );

  let temp_directory = easyenv::get_env_string_or_default(
    "DOWNLOAD_TEMP_DIR",
    DEFAULT_TEMP_DIR);

  let temp_directory = PathBuf::from(temp_directory);

  check_directory_exists(&temp_directory)?;

  let db_connection_string =
      easyenv::get_env_string_or_default(
        "MYSQL_URL",
        DEFAULT_MYSQL_CONNECTION_STRING);

  info!("Connecting to database...");

  let mysql_pool = MySqlPoolOptions::new()
      .max_connections(2)
      .connect(&db_connection_string)
      .await?;

  let common_env = CommonEnv::read_from_env()?;

  let persistent_cache_path = easyenv::get_env_string_or_default(
    ENV_SEMIPERSISTENT_CACHE_DIR,
    "/tmp");

  let semi_persistent_cache =
      SemiPersistentCacheDir::configured_root(&persistent_cache_path);

  info!("Creating pod semi-persistent cache dirs...");
  semi_persistent_cache.create_tts_synthesizer_model_path()?;
  semi_persistent_cache.create_tts_pretrained_vocoder_model_path()?;
  semi_persistent_cache.create_custom_vocoder_model_path()?;

  let waveglow_vocoder_model_filename = easyenv::get_env_string_or_default(
    "TTS_WAVEGLOW_VOCODER_MODEL_FILENAME", "waveglow.pth");

  let hifigan_vocoder_model_filename = easyenv::get_env_string_or_default(
    "TTS_HIFIGAN_VOCODER_MODEL_FILENAME", "hifigan.pth");

  let hifigan_superres_vocoder_model_filename = easyenv::get_env_string_or_default(
    "TTS_HIFIGAN_SUPERRES_VOCODER_MODEL_FILENAME", "hifigan_superres.pth");

  let sidecar_max_synthesizer_models = easyenv::get_env_num(
    "SIDECAR_MAX_SYNTHESIZER_MODELS", 3)?;

  // Set to "0" to always treat low priority the same as high priority
  let low_priority_starvation_prevention_every_nth= easyenv::get_env_num(
    "LOW_PRIORITY_STARVATION_PREVENTION_EVERY_NTH", 3)?;

  let firehose_publisher = FirehosePublisher {
    mysql_pool: mysql_pool.clone(), // NB: MySqlPool is clone/send/sync safe
  };

  let model_cache_duration = std::time::Duration::from_millis(
    easyenv::get_env_num("TTS_MODEL_RECORD_CACHE_MILLIS", 300_000)?, // Five minutes
  );

  let license_key = easyenv::get_env_string_required("NEWRELIC_API_KEY")?;

  let newrelic_disabled = easyenv::get_env_bool_or_default("IS_NEWRELIC_DISABLED", false);

  let newrelic_client = ClientBuilder::new(&license_key).build().unwrap();

  let maybe_minimum_priority = easyenv::get_env_string_optional("MAYBE_MINIMUM_PRIORITY")
      .map(|priority_string| {
        priority_string.parse::<u8>()
      })
      .transpose()?;

  info!("Using 'MAYBE_MINIMUM_PRIORITY' of {:?}", maybe_minimum_priority);

  let is_debug_worker = easyenv::get_env_bool_or_default("IS_DEBUG_WORKER", false);

  info!("Is debug worker? {}", is_debug_worker);

  // Optionally report job progress to the user via Redis (for now)
  // We want to turn this off in the on-premises workers since we're not tunneling to the production Redis.
  let job_progress_reporter : Box<dyn JobProgressReporterBuilder>;

  job_progress_reporter = match easyenv::get_env_string_optional("REDIS_FOR_JOB_PROGRESS") {
    None => {
      warn!("Redis for job progress status reports is DISABLED! Users will not see in-flight details of inference progress.");
      Box::new(NoOpJobProgressReporterBuilder {})
    },
    Some(redis_connection_string) => {
      info!("Connecting to Redis to use for reporting job progress... {}", redis_connection_string);
      let redis_manager = RedisConnectionManager::new(redis_connection_string)?;
      let redis_pool = r2d2::Pool::builder().build(redis_manager)?;

      Box::new(RedisJobProgressReporterBuilder::from_redis_pool(redis_pool))
    }
  };

  let job_dependencies = JobDependencies {
    scoped_temp_dir_creator: ScopedTempDirCreator::for_directory(&temp_directory),
    download_temp_directory: temp_directory,
    mysql_pool,
    maybe_redis_pool: None, // TODO(bt, 2023-01-11): See note in JobDependencies
    job_progress_reporter,
    public_bucket_client,
    private_bucket_client,
    tts_inference_command,
    job_stats: JobStats::new(),
    newrelic_client,
    newrelic_disabled,
    worker_details: JobWorkerDetails {
      is_on_prem,
      worker_hostname: server_hostname.clone(),
      k8s_node_name,
      k8s_pod_name,
      is_debug_worker,
    },
    caches: JobCaches {
      tts_model_record_cache: MultiItemTtlCache::create_with_duration(model_cache_duration),
    },
    bucket_path_unifier: BucketPathUnifier::default_paths(),
    semi_persistent_cache,
    firehose_publisher,
    waveglow_vocoder_model_filename,
    hifigan_vocoder_model_filename,
    hifigan_superres_vocoder_model_filename,
    job_batch_wait_millis: common_env.job_batch_wait_millis,
    job_max_attempts: common_env.job_max_attempts as u16,
    job_batch_size: common_env.job_batch_size,
    no_op_logger_millis: common_env.no_op_logger_millis,
    sidecar_max_synthesizer_models,
    low_priority_starvation_prevention_every_nth,
    maybe_minimum_priority,
    job_type_details: JobTypeDetails {
      tacotron2_old_vocodes: Tacotron2VocodesDetails {
        maybe_docker_image_sha: easyenv::get_env_string_optional("TACOTRON2_VOCODES_DOCKER_IMAGE_SHA"),
      },
    },
  };

  main_loop(job_dependencies).await;

  Ok(())
}
