#![forbid(private_in_public)]
#![forbid(unused_must_use)]
//#![forbid(warnings)]

#![allow(dead_code)]
#![allow(non_snake_case)]
#![allow(unused_imports)]
#![allow(unused_mut)]
#![allow(unused_variables)]

#[macro_use] extern crate serde_derive;

pub mod caching;
pub mod http_clients;
pub mod job_steps;
pub mod script_execution;

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
use crate::job_steps::job_args::JobArgs;
use crate::job_steps::job_args::JobWorkerDetails;
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

  // NB: Do not check this secrets-containing dotenv file into VCS.
  // This file should only contain *development* secrets, never production.
  let _ = dotenv::from_filename(".env-secrets").ok();

  let matches = App::new("tts-inference-job")
      .arg(Arg::with_name("sidecar_hostname")
          .long("sidecar_hostname")
          .value_name("HOSTNAME")
          .help("Hostname for the TTS inference sidecar")
          .takes_value(true)
          .required(false))
      .get_matches();

  info!("Obtaining worker hostname...");

  let server_hostname = hostname::get()
      .ok()
      .and_then(|h| h.into_string().ok())
      .unwrap_or("tts-inference-job".to_string());

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

  let private_bucket_client = BucketClient::create(
    &access_key,
    &secret_key,
    &region_name,
    &private_bucket_name,
    None,
  )?;

  let public_bucket_client = BucketClient::create(
    &access_key,
    &secret_key,
    &region_name,
    &public_bucket_name,
    None,
  )?;

  let py_code_directory = easyenv::get_env_string_required(ENV_CODE_DIRECTORY)?;
  let py_script_name = easyenv::get_env_string_required(ENV_INFERENCE_SCRIPT_NAME)?;

  let tts_inference_command = TacotronInferenceCommand::new(
    &py_code_directory,
    &py_script_name,
  );

  let mut sidecar_hostname =
      easyenv::get_env_string_required(ENV_TTS_INFERENCE_SIDECAR_HOSTNAME)?;

  if let Some(hostname) = matches.value_of("sidecar_hostname") {
    sidecar_hostname = hostname.to_string();
  }

  info!("Sidecar hostname: {:?}", sidecar_hostname);

  let tts_inference_sidecar_client =
      TtsInferenceSidecarClient::new(&sidecar_hostname);

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

  info!("Connecting to redis...");

  let redis_manager =
      RedisConnectionManager::new(common_env.redis_0_connection_string.deref())?;

  let redis_pool = r2d2::Pool::builder()
      .build(redis_manager)?;

  let persistent_cache_path = easyenv::get_env_string_or_default(
    ENV_SEMIPERSISTENT_CACHE_DIR,
    "/tmp");

  let semi_persistent_cache =
      SemiPersistentCacheDir::configured_root(&persistent_cache_path);

  info!("Creating pod semi-persistent cache dirs...");
  semi_persistent_cache.create_tts_synthesizer_model_path()?;
  semi_persistent_cache.create_tts_pretrained_vocoder_model_path()?;

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

  let virtual_lfu_cache = SyncVirtualLfuCache::new(sidecar_max_synthesizer_models)?;

  let cache_miss_strategizers = {
    let in_memory_strategizer = CacheMissStrategizer::new(
      chrono::Duration::milliseconds(
        easyenv::get_env_num("MEMORY_MAX_COLD_DURATION_MILLIS", 5_000)?,
      ),
      chrono::Duration::milliseconds(
        easyenv::get_env_num("MEMORY_CACHE_FORGET_DURATION_MILLIS", 60_000)?,
      ),
    );

    let on_disk_strategizer = CacheMissStrategizer::new(
      chrono::Duration::milliseconds(
        easyenv::get_env_num("DISK_MAX_COLD_DURATION_MILLIS", 20_000)?,
      ),
      chrono::Duration::milliseconds(
        easyenv::get_env_num("DISK_CACHE_FORGET_DURATION_MILLIS", 120_000)?,
      ),
    );

    SyncMultiCacheMissStrategizer::new(
      in_memory_strategizer,
      on_disk_strategizer,
    )
  };

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

  let inferencer = JobArgs {
    download_temp_directory: temp_directory,
    mysql_pool,
    redis_pool,
    public_bucket_client,
    private_bucket_client,
    tts_inference_command,
    tts_inference_sidecar_client,
    newrelic_client,
    newrelic_disabled,
    worker_details: JobWorkerDetails {
      is_on_prem,
      worker_hostname: server_hostname.clone(),
      is_debug_worker,
    },
    virtual_model_lfu: virtual_lfu_cache,
    cache_miss_strategizers,
    bucket_path_unifier: BucketPathUnifier::default_paths(),
    semi_persistent_cache,
    firehose_publisher,
    waveglow_vocoder_model_filename,
    hifigan_vocoder_model_filename,
    hifigan_superres_vocoder_model_filename,
    job_batch_wait_millis: common_env.job_batch_wait_millis,
    job_max_attempts: common_env.job_max_attempts as i32,
    job_batch_size: common_env.job_batch_size,
    no_op_logger_millis: common_env.no_op_logger_millis,
    sidecar_max_synthesizer_models,
    low_priority_starvation_prevention_every_nth,
    maybe_minimum_priority,
  };

  main_loop(inferencer).await;

  Ok(())
}

const START_TIMEOUT_MILLIS : u64 = 500;
const INCREASE_TIMEOUT_MILLIS : u64 = 1000;

async fn main_loop(inferencer: JobArgs) {
  let mut error_timeout_millis = START_TIMEOUT_MILLIS;

  let mut noop_logger = NoOpLogger::new(inferencer.no_op_logger_millis as i64);

  let mut span_batch = Vec::new();

  let mut sort_by_priority = true;
  let mut sort_by_priority_count = 0;

  loop {
    let num_records = inferencer.job_batch_size;

    // Don't completely starve low-priority jobs
    if sort_by_priority_count >= inferencer.low_priority_starvation_prevention_every_nth {
      sort_by_priority_count = 0;
      sort_by_priority = false;
    }

    let maybe_available_jobs =
        if let Some(minimum_priority) = inferencer.maybe_minimum_priority {
          // Special high-priority workers
          list_available_tts_inference_jobs_with_minimum_priority(
            &inferencer.mysql_pool,
            minimum_priority,
            num_records,
            inferencer.worker_details.is_debug_worker
          ).await
        } else {
          // Normal path
          list_available_tts_inference_jobs(
            &inferencer.mysql_pool,
            sort_by_priority,
            num_records,
            inferencer.worker_details.is_debug_worker
          ).await
        };

    sort_by_priority = true;
    sort_by_priority_count += 1;

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
      noop_logger.log_message_after_awhile("No TTS jobs picked up from database!");

      std::thread::sleep(Duration::from_millis(inferencer.job_batch_wait_millis));
      continue;
    }

    info!("Queried {} jobs from database", jobs.len());

    let batch_result = process_jobs(
      &inferencer,
      jobs,
    ).await;

    let mut spans = match batch_result {
      Ok(spans) => spans,
      Err(e) => {
        warn!("Error querying jobs: {:?}", e);
        std::thread::sleep(Duration::from_millis(error_timeout_millis));
        error_timeout_millis += INCREASE_TIMEOUT_MILLIS;
        continue;
      }
    };

    if !inferencer.newrelic_disabled {
      span_batch.append(&mut spans);

      if span_batch.len() > 50 {
        let spans_to_send = span_batch.split_off(0).into();
        inferencer.newrelic_client.send_spans(spans_to_send).await;
      }
    }

    error_timeout_millis = START_TIMEOUT_MILLIS; // reset

    std::thread::sleep(Duration::from_millis(inferencer.job_batch_wait_millis));
  }
}

/// Process a batch of jobs, returning the count of cold-cache skipped jobs.
async fn process_jobs(
  inferencer: &JobArgs,
  jobs: Vec<AvailableTtsInferenceJob>,
) -> AnyhowResult<Vec<Span>> {

  let mut batch_spans = Vec::new();

  for job in jobs.into_iter() {
    let model_state_result = ModelState::query_model_and_check_filesystem(
      &job,
      &inferencer.mysql_pool,
      &inferencer.semi_persistent_cache,
      &inferencer.virtual_model_lfu,
    ).await;

    let model_state = match model_state_result {
      Ok(model_state) => model_state,
      Err(e) => {
        error!("TTS model fetch and state check error: {}, reason: {:?}", &job.model_token, &e);

        let (failure_reason, permanent_failure) = match e {
          ModelStateError::ModelNotFound => ("model was not found", true),
          ModelStateError::ModelDeleted => ("model has been deleted", true),
          ModelStateError::CacheError { .. } => ("internal cache error", false),
          ModelStateError::DatabaseError { .. } => ("unknown database error", false),
        };

        let mut redis = inferencer.redis_pool.get()?;
        let mut redis_logger = RedisJobStatusLogger::new_tts_inference(
          &mut redis,
          &job.inference_job_token);

        redis_logger.log_status(failure_reason)?;

        if permanent_failure {
          warn!("Marking job permanently dead: {} because: {:?}", job.inference_job_token, &e);

          let _r = mark_tts_inference_job_permanently_dead(
            &inferencer.mysql_pool,
            job.id,
            failure_reason
          ).await;
        } else {
          let _r = mark_tts_inference_job_failure(
            &inferencer.mysql_pool,
            &job,
            failure_reason,
            inferencer.job_max_attempts
          ).await;
        }

        continue;
      }
    };

    if !model_state.is_downloaded_to_filesystem || !model_state.is_in_memory_cache {
      warn!("Model isn't ready: {} (downloaded = {}), (in memory = {})",
        &model_state.model_record.model_token,
        model_state.is_downloaded_to_filesystem,
        model_state.is_in_memory_cache);

      let maybe_strategy = if !model_state.is_downloaded_to_filesystem {
        inferencer.cache_miss_strategizers.disk_cache_miss(&model_state.model_record.model_token)
      } else {
        inferencer.cache_miss_strategizers.memory_cache_miss(&model_state.model_record.model_token)
      };

      match maybe_strategy {
        Err(err) => {
          warn!("Unable to process job: {:?}", err);
          let failure_reason = "";
          let _r = mark_tts_inference_job_failure(
            &inferencer.mysql_pool,
            &job,
            failure_reason,
            inferencer.job_max_attempts
          ).await;
          continue;
        },
        Ok(CacheMissStrategy::WaitOrSkip) => {
          // We're going to skip this for now.
          // Maybe another worker has a warm cache and can continue.
          warn!("Skipping TTS due to cold cache: {} ({})",
            model_state.model_record.model_token,
            model_state.model_record.title);
          continue;
        },
        Ok(CacheMissStrategy::Proceed) => {}, // We're going to go ahead...
      }
    }

    let result = process_single_job(inferencer, &job, &model_state.model_record).await;
    match result {
      Ok((span1, span2)) => {
        batch_spans.push(span1);
        batch_spans.push(span2);
      },
      Err(e) => {
        warn!("Failure to process job: {:?}", e);
        let failure_reason = "";
        let _r = mark_tts_inference_job_failure(
          &inferencer.mysql_pool,
          &job,
          failure_reason,
          inferencer.job_max_attempts
        ).await;

        match e {
          ProcessSingleJobError::Other(_) => {} // No-op
          ProcessSingleJobError::FilesystemFull => {
            // TODO: Refactor - we should stop processing all of these jobs as we'll lose out
            //  on this entire batch by attempting to clear the filesystem. This should be handled
            //  in the calling code.
            delete_tts_synthesizers_from_cache(&inferencer.semi_persistent_cache)?;
          }
        }
      }
    }
  }

  Ok(batch_spans)
}

/// Hack to delete locally cached TTS synthesizers to free up space from a full filesystem.
/// This is not intelligent and doesn't use any LRU/LFU mechanic.
/// This also relies on files not being read or written by concurrent workers while deleting.
fn delete_tts_synthesizers_from_cache(cache_dir: &SemiPersistentCacheDir) -> AnyhowResult<()> {
  warn!("Deleting cached TTS synthesizers to free up disk space.");

  let tts_synthesizer_dir = cache_dir.tts_synthesizer_model_directory();

  // TODO: When this is no longer sufficient, delete other types of locally-cached data.
  let mut paths = std::fs::read_dir(tts_synthesizer_dir)?
      .map(|res| res.map(|e| e.path()))
      .collect::<Result<Vec<_>, std::io::Error>>()?;

  let models_to_delete = multiple_random_from_vec(&paths, 35);

  for model_to_delete in models_to_delete {
    warn!("Deleting cached model file: {:?}", model_to_delete);

    let full_model_path = cache_dir.tts_synthesizer_model_path(model_to_delete);
    std::fs::remove_file(full_model_path)?;
  }

  Ok(())
}

/// We check both of these in one go so that we can reuse the ModelRecord later
/// without another DB query.
struct ModelState {
  pub model_record: TtsModelForInferenceRecord,
  pub is_downloaded_to_filesystem: bool,
  pub is_in_memory_cache: bool,
}

#[derive(Debug, Clone)]
enum ModelStateError {
  ModelNotFound,
  ModelDeleted,
  CacheError { reason: String },
  DatabaseError { reason: String },
}

impl std::fmt::Display for ModelStateError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    match self {
      ModelStateError::ModelNotFound => write!(f, "ModelNotFound"),
      ModelStateError::ModelDeleted => write!(f, "ModelDeleted"),
      ModelStateError::CacheError { reason} => write!(f, "Cache error: {:?}", reason),
      ModelStateError::DatabaseError { reason} => write!(f, "Database error: {:?}", reason),
    }
  }
}

impl From<TtsModelForInferenceError> for ModelStateError {
  fn from(error: TtsModelForInferenceError) -> Self {
    match error {
      TtsModelForInferenceError::ModelNotFound => ModelStateError::ModelNotFound,
      TtsModelForInferenceError::ModelDeleted => ModelStateError::ModelDeleted,
      TtsModelForInferenceError::DatabaseError { reason } => ModelStateError::DatabaseError { reason }
    }
  }
}

impl std::error::Error for ModelStateError {}

impl ModelState {
  /// Query the model details and see if the model file is on the filesystem in one go.
  pub async fn query_model_and_check_filesystem(
    job: &AvailableTtsInferenceJob,
    mysql_pool: &MySqlPool,
    semi_persistent_cache: &SemiPersistentCacheDir,
    virtual_cache: &SyncVirtualLfuCache,
  ) -> Result<Self, ModelStateError> {
    info!("Looking up TTS model by token: {}", &job.model_token);

    let tts_model = get_tts_model_for_inference(
      &mysql_pool,
      &job.model_token
    ).await?;

    let tts_synthesizer_fs_path = semi_persistent_cache.tts_synthesizer_model_path(
      &tts_model.model_token);

    let is_downloaded_to_filesystem = tts_synthesizer_fs_path.exists();

    let path = tts_synthesizer_fs_path
        .to_str()
        .ok_or(ModelStateError::CacheError { reason: "could not make path".to_string() })?
        .to_string();

    let is_in_memory_cache = virtual_cache.in_cache(&path)
        .map_err(|e| ModelStateError::CacheError { reason: format!("Model cache error: {:?}", e) })?;

    Ok(Self {
      model_record: tts_model,
      is_downloaded_to_filesystem,
      is_in_memory_cache,
    })
  }
}

