#![forbid(private_in_public)]
#![forbid(unused_must_use)]
//#![forbid(warnings)]

#![allow(dead_code)]
#![allow(non_snake_case)]
#![allow(unused_imports)]
#![allow(unused_mut)]
#![allow(unused_variables)]

#[macro_use] extern crate serde_derive;

pub mod http_clients;
pub mod job_queries;
pub mod script_execution;
pub mod util;

use anyhow::{anyhow, Error};
use chrono::{Utc, DateTime, TimeZone};
use config::common_env::CommonEnv;
use config::shared_constants::DEFAULT_MYSQL_CONNECTION_STRING;
use config::shared_constants::DEFAULT_RUST_LOG;
use container_common::anyhow_result::AnyhowResult;
use container_common::collections::multiple_random_from_vec::multiple_random_from_vec;
use container_common::filesystem::check_directory_exists::check_directory_exists;
use container_common::filesystem::check_file_exists::check_file_exists;
use container_common::filesystem::safe_delete_temp_directory::safe_delete_temp_directory;
use container_common::filesystem::safe_delete_temp_file::safe_delete_temp_file;
use container_common::token::random_uuid::generate_random_uuid;

// buckets_common
use crate::util::buckets::bucket_client::BucketClient;
use crate::util::buckets::bucket_path_unifier::BucketPathUnifier;
use crate::util::buckets::bucket_paths::hash_to_bucket_path;
use crate::util::hashing::hash_file_sha2::hash_file_sha2;
use crate::util::hashing::hash_string_sha2::hash_string_sha2;

// tts job
use crate::http_clients::tts_inference_sidecar_client::TtsInferenceSidecarClient;
use crate::script_execution::tacotron_inference_command::TacotronInferenceCommand;
use crate::util::jobs::cache_miss_strategizer::CacheMissStrategizer;
use crate::util::jobs::cache_miss_strategizer::CacheMissStrategy;
use crate::util::jobs::cache_miss_strategizer_multi::SyncMultiCacheMissStrategizer;
use crate::util::jobs::virtual_lfu_cache::SyncVirtualLfuCache;

// jobs_common
use crate::util::noop_logger::NoOpLogger;
use crate::util::redis::redis_job_status_logger::RedisJobStatusLogger;
use crate::util::semi_persistent_cache_dir::SemiPersistentCacheDir;

use data_encoding::{HEXUPPER, HEXLOWER, HEXLOWER_PERMISSIVE};
use database_queries::column_types::vocoder_type::VocoderType;
use database_queries::mediators::firehose_publisher::FirehosePublisher;
use database_queries::queries::tts::tts_inference_jobs::list_available_tts_inference_jobs::{AvailableTtsInferenceJob, list_available_tts_inference_jobs, list_available_tts_inference_jobs_with_minimum_priority};
use database_queries::queries::tts::tts_inference_jobs::mark_tts_inference_job_done::mark_tts_inference_job_done;
use database_queries::queries::tts::tts_inference_jobs::mark_tts_inference_job_failure::mark_tts_inference_job_failure;
use database_queries::queries::tts::tts_inference_jobs::mark_tts_inference_job_pending_and_grab_lock::mark_tts_inference_job_pending_and_grab_lock;
use database_queries::queries::tts::tts_inference_jobs::mark_tts_inference_job_permanently_dead::mark_tts_inference_job_permanently_dead;
use database_queries::queries::tts::tts_models::get_tts_model_for_inference::{get_tts_model_for_inference, TtsModelForInferenceError, TtsModelForInferenceRecord};
use database_queries::queries::tts::tts_results::insert_tts_result::insert_tts_result;
use log::{warn, info, error};
use newrelic_telemetry::Client as NewRelicClient;
use newrelic_telemetry::ClientBuilder;
use newrelic_telemetry::Span;
use r2d2_redis::RedisConnectionManager;
use r2d2_redis::r2d2::PooledConnection;
use r2d2_redis::r2d2;
use r2d2_redis::redis::Commands;
use ring::digest::{Context, Digest, SHA256};
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

struct Inferencer {
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

  pub worker_details: InferencerWorkerDetails,

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

struct InferencerWorkerDetails {
  pub is_on_prem: bool,
  pub worker_hostname: String,
}

#[tokio::main]
async fn main() -> AnyhowResult<()> {
  easyenv::init_all_with_default_logging(Some(DEFAULT_RUST_LOG));

  // NB: Do not check this secrets-containing dotenv file into VCS.
  // This file should only contain *development* secrets, never production.
  let _ = dotenv::from_filename(".env-secrets").ok();

  info!("Obtaining hostname...");

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

  let sidecar_hostname =
      easyenv::get_env_string_required(ENV_TTS_INFERENCE_SIDECAR_HOSTNAME)?;

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

  let inferencer = Inferencer {
    download_temp_directory: temp_directory,
    mysql_pool,
    redis_pool,
    public_bucket_client,
    private_bucket_client,
    tts_inference_command,
    tts_inference_sidecar_client,
    newrelic_client,
    newrelic_disabled,
    worker_details: InferencerWorkerDetails {
      is_on_prem,
      worker_hostname: server_hostname.clone(),
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

async fn main_loop(inferencer: Inferencer) {
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
            num_records
          ).await
        } else {
          // Normal path
          list_available_tts_inference_jobs(
            &inferencer.mysql_pool,
            sort_by_priority,
            num_records
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
  inferencer: &Inferencer,
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

    let result = process_job(inferencer, &job, &model_state.model_record).await;
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
          ProcessJobError::Other(_) => {} // No-op
          ProcessJobError::FilesystemFull => {
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

#[derive(Deserialize, Default)]
struct FileMetadata {
  pub duration_millis: Option<u64>,
  pub mimetype: Option<String>,
  pub file_size_bytes: u64,
}

fn read_metadata_file(filename: &PathBuf) -> AnyhowResult<FileMetadata> {
  let mut file = File::open(filename)?;
  let mut buffer = String::new();
  file.read_to_string(&mut buffer)?;
  Ok(serde_json::from_str(&buffer)?)
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

/// Error from processing a single job
#[derive(Debug)]
enum ProcessJobError {
  /// The filesystem is out of space and we need to free it up.
  FilesystemFull,
  /// This is any other kind of error.
  /// It might be important, we just haven't special cased it yet.
  Other(anyhow::Error),
}

impl ProcessJobError {
  fn from_io_error(error: std::io::Error) -> Self {
    match error.raw_os_error() {
      // NB: We can't use err.kind() -> ErrorKind::StorageFull, because it's marked unstable:
      // `io_error_more` is unstable [E0658]
      Some(28) => ProcessJobError::FilesystemFull,
      _ => ProcessJobError::Other(anyhow!(error)),
    }
  }

  fn from_anyhow_error(error: anyhow::Error) -> Self {
    match error.downcast_ref::<std::io::Error>() {
      Some(e) => match e.raw_os_error() {
        // NB: We can't use err.kind() -> ErrorKind::StorageFull, because it's marked unstable:
        // `io_error_more` is unstable [E0658]
        Some(28) => ProcessJobError::FilesystemFull,
        _ => ProcessJobError::Other(anyhow!(error)),
      },
      None => ProcessJobError::Other(error),
    }
  }
}

async fn process_job(
  inferencer: &Inferencer,
  job: &AvailableTtsInferenceJob,
  model_record: &TtsModelForInferenceRecord,
) -> Result<(Span, Span), ProcessJobError> {

  // TODO 1. Mark processing (DONE)

  // TODO 2. Check if vocoder model is downloaded / download to stable location (DONE)

  // TODO 3. Query model by token. (DONE)
  // TODO 4. Check if model is downloaded, otherwise download to stable location (DONE)

  // TODO 5. Write text to file
  // TODO 6. Process Inference

  // TODO 7. Upload Result
  // TODO 8. Save record
  // TODO 9. Mark job done

  let start = Instant::now();

  let span_id = generate_random_uuid();
  let trace_id = generate_random_uuid();
  let maybe_user_token = job.maybe_creator_user_token.as_deref().unwrap_or("");

  let mut job_iteration_span = Span::new(&span_id, &trace_id, get_timestamp_millis())
      .name("single job execution")
      .attribute("user_token", maybe_user_token)
      .service_name("tts-inference-job");

  let span_id = generate_random_uuid();
  let trace_id = generate_random_uuid();

  let created_at_timestamp = (job.created_at.timestamp() as u64) * 1000;

  let mut since_creation_span = Span::new(&span_id, &trace_id, created_at_timestamp)
      .name("job since creation")
      .attribute("user_token", maybe_user_token)
      .service_name("tts-inference-job");

  let mut redis = inferencer.redis_pool.get()
      .map_err(|e| ProcessJobError::Other(anyhow!(e)))?;

  let mut redis_logger = RedisJobStatusLogger::new_tts_inference(
    &mut redis,
    &job.inference_job_token);

  // ==================== ATTEMPT TO GRAB JOB LOCK ==================== //

  info!("Attempting to grab lock for job: {}", job.inference_job_token);

  let lock_acquired =
      mark_tts_inference_job_pending_and_grab_lock(&inferencer.mysql_pool, job.id)
          .await
          .map_err(|e| ProcessJobError::Other(e))?;

  if !lock_acquired {
    warn!("Could not acquire job lock for: {:?}", &job.id);
    let duration = start.elapsed();

    since_creation_span.set_attribute("status", "failure");
    since_creation_span.set_duration(duration);

    job_iteration_span.set_attribute("status", "failure");
    job_iteration_span.set_duration(duration);

    return Ok((since_creation_span, job_iteration_span));
  }

  info!("Lock acquired for job: {}", job.inference_job_token);

  // ==================== CONFIRM OR DOWNLOAD WAVEGLOW VOCODER MODEL ==================== //

  let waveglow_vocoder_model_filename = inferencer.waveglow_vocoder_model_filename.clone();
  let waveglow_vocoder_model_fs_path = inferencer.semi_persistent_cache.tts_pretrained_vocoder_model_path(&waveglow_vocoder_model_filename);

  if !waveglow_vocoder_model_fs_path.exists() {
    warn!("Waveglow vocoder model file does not exist: {:?}", &waveglow_vocoder_model_fs_path);

    redis_logger.log_status("downloading vocoder (1 of 3)")
        .map_err(|e| ProcessJobError::Other(e))?;

    let waveglow_vocoder_model_object_path = inferencer.bucket_path_unifier
        .tts_pretrained_vocoders_path(&waveglow_vocoder_model_filename);

    info!("Download waveglow vocoder from bucket path: {:?}", &waveglow_vocoder_model_object_path);

    inferencer.private_bucket_client.download_file_to_disk(
      &waveglow_vocoder_model_object_path,
      &waveglow_vocoder_model_fs_path)
        .await
        .map_err(|e| ProcessJobError::Other(e))?;

    info!("Downloaded waveglow vocoder model from bucket!");
  }

  // ==================== CONFIRM OR DOWNLOAD HIFIGAN (NORMAL) VOCODER MODEL ==================== //

  let hifigan_vocoder_model_filename = inferencer.hifigan_vocoder_model_filename.clone();
  let hifigan_vocoder_model_fs_path = inferencer.semi_persistent_cache.tts_pretrained_vocoder_model_path(&hifigan_vocoder_model_filename);

  if !hifigan_vocoder_model_fs_path.exists() {
    warn!("Hifigan vocoder model file does not exist: {:?}", &hifigan_vocoder_model_fs_path);

    redis_logger.log_status("downloading vocoder (2 of 3)")
        .map_err(|e| ProcessJobError::Other(e))?;

    let hifigan_vocoder_model_object_path = inferencer.bucket_path_unifier
        .tts_pretrained_vocoders_path(&hifigan_vocoder_model_filename);

    info!("Download hifigan vocoder from bucket path: {:?}", &hifigan_vocoder_model_object_path);

    inferencer.private_bucket_client.download_file_to_disk(
      &hifigan_vocoder_model_object_path,
      &hifigan_vocoder_model_fs_path)
        .await
        .map_err(|e| ProcessJobError::Other(e))?;

    info!("Downloaded hifigan vocoder model from bucket!");
  }

  // ==================== CONFIRM OR DOWNLOAD HIFIGAN (SUPERRES) VOCODER MODEL ==================== //

  let hifigan_superres_vocoder_model_filename = inferencer.hifigan_superres_vocoder_model_filename.clone();
  let hifigan_superres_vocoder_model_fs_path = inferencer.semi_persistent_cache.tts_pretrained_vocoder_model_path(&hifigan_superres_vocoder_model_filename);

  if !hifigan_superres_vocoder_model_fs_path.exists() {
    warn!("Hifigan superres vocoder model file does not exist: {:?}", &hifigan_superres_vocoder_model_fs_path);

    redis_logger.log_status("downloading vocoder (3 of 3)")
        .map_err(|e| ProcessJobError::Other(e))?;

    let hifigan_superres_vocoder_model_object_path = inferencer.bucket_path_unifier
        .tts_pretrained_vocoders_path(&hifigan_superres_vocoder_model_filename);

    info!("Download hifigan superres vocoder from bucket path: {:?}", &hifigan_superres_vocoder_model_object_path);

    inferencer.private_bucket_client.download_file_to_disk(
      &hifigan_superres_vocoder_model_object_path,
      &hifigan_superres_vocoder_model_fs_path)
        .await
        .map_err(|e| ProcessJobError::Other(e))?;

    info!("Downloaded hifigan superres vocoder model from bucket!");
  }

//  // ==================== LOOK UP TTS SYNTHESIZER RECORD (WHICH CONTAINS ITS BUCKET PATH) ==================== //
//
//  info!("Looking up TTS model by token: {}", &job.model_token);
//
//  let query_result = get_tts_model_by_token(
//    &inferencer.mysql_pool,
//    &job.model_token).await?;
//
//  let tts_model = match query_result {
//    Some(model) => model,
//    None => {
//      warn!("TTS model not found: {}", &job.model_token);
//      return Err(anyhow!("Model not found!"))
//    },
//  };

  // ==================== CONFIRM OR DOWNLOAD TTS SYNTHESIZER MODEL ==================== //

  // TODO: Let's just put paths in the db
  // TODO: We'll probably need to LRU cache these.

  let tts_synthesizer_fs_path = inferencer.semi_persistent_cache.tts_synthesizer_model_path(
    &model_record.model_token);

  if !tts_synthesizer_fs_path.exists() {
    info!("TTS synthesizer model file does not exist: {:?}", &tts_synthesizer_fs_path);

    redis_logger.log_status("downloading synthesizer")
        .map_err(|e| ProcessJobError::Other(e))?;

    let tts_synthesizer_object_path  = inferencer.bucket_path_unifier
        .tts_synthesizer_path(&model_record.private_bucket_hash);

    info!("Download from template media path: {:?}", &tts_synthesizer_object_path);

    inferencer.private_bucket_client.download_file_to_disk(
      &tts_synthesizer_object_path,
      &tts_synthesizer_fs_path)
        .await
        .map_err(|e| ProcessJobError::from_anyhow_error(e))?;

    info!("Downloaded template media from bucket!");
  }

  // ==================== Preprocess text ==================== //

  let cleaned_inference_text = clean_symbols(&job.raw_inference_text);

  // ==================== WRITE TEXT TO FILE ==================== //

  info!("Creating tempdir for inference results.");

  let temp_dir = format!("temp_tts_inference_{}", job.id.0);

  // NB: TempDir exists until it goes out of scope, at which point it should delete from filesystem.
  let temp_dir = TempDir::new(&temp_dir)
      .map_err(|e| ProcessJobError::from_io_error(e))?;

  let text_input_fs_path = temp_dir.path().join("inference_input.txt");

  std::fs::write(&text_input_fs_path, &cleaned_inference_text)
      .map_err(|e| ProcessJobError::from_io_error(e))?;

  // ==================== RUN INFERENCE ==================== //

  redis_logger.log_status("running inference")
      .map_err(|e| ProcessJobError::Other(e))?;

  // TODO: Fix this.
  let maybe_unload_model_path = inferencer
      .virtual_model_lfu
      .insert_returning_replaced(tts_synthesizer_fs_path.to_str().unwrap_or(""))
      .map_err(|e| ProcessJobError::Other(e))?;

  if let Some(model_path) = maybe_unload_model_path.as_deref() {
    warn!("Remove model from LFU cache: {:?}", model_path);
  }

  let output_audio_fs_path = temp_dir.path().join("output.wav");
  let output_metadata_fs_path = temp_dir.path().join("metadata.json");
  let output_spectrogram_fs_path = temp_dir.path().join("spectrogram.json");

  info!("Running TTS inference...");

  info!("Expected output audio filename: {:?}", &output_audio_fs_path);
  info!("Expected output spectrogram filename: {:?}", &output_spectrogram_fs_path);
  info!("Expected output metadata filename: {:?}", &output_metadata_fs_path);

  if let Some(model_path) = maybe_unload_model_path.as_deref() {
    warn!("Unload model from sidecar: {:?}", &model_path);
  }

  //inferencer.tts_inference_command.execute(
  //  &tts_synthesizer_fs_path,
  //  &tts_vocoder_model_fs_path,
  //  &text_input_fs_path,
  //  &output_audio_fs_path,
  //  &output_spectrogram_fs_path,
  //  &output_metadata_fs_path,
  //  false,
  //)?;

  let mut pretrained_vocoder = VocoderType::HifiGanSuperResolution;
  if let Some(default_vocoder) = model_record.maybe_default_pretrained_vocoder.as_deref() {
    pretrained_vocoder = VocoderType::from_str(default_vocoder)
        .map_err(|e| ProcessJobError::Other(e))?;
  }

  info!("With pretrained vocoder: {:?}", pretrained_vocoder);

  inferencer.tts_inference_sidecar_client.request_inference(
    &cleaned_inference_text,
    &tts_synthesizer_fs_path,
    pretrained_vocoder,
    &hifigan_vocoder_model_fs_path,
    &hifigan_superres_vocoder_model_fs_path,
    &waveglow_vocoder_model_fs_path,
    &output_audio_fs_path,
    &output_spectrogram_fs_path,
    &output_metadata_fs_path,
    maybe_unload_model_path)
      .await
      .map_err(|e| ProcessJobError::Other(e))?;

  // ==================== CHECK ALL FILES EXIST AND GET METADATA ==================== //

  info!("Checking that output files exist...");

  check_file_exists(&output_audio_fs_path).map_err(|e| ProcessJobError::Other(e))?;
  check_file_exists(&output_spectrogram_fs_path).map_err(|e| ProcessJobError::Other(e))?;
  check_file_exists(&output_metadata_fs_path).map_err(|e| ProcessJobError::Other(e))?;

  let file_metadata = read_metadata_file(&output_metadata_fs_path)
      .map_err(|e| ProcessJobError::Other(e))?;

  safe_delete_temp_file(&output_metadata_fs_path);

  // ==================== UPLOAD AUDIO TO BUCKET ==================== //

  redis_logger.log_status("uploading result")
      .map_err(|e| ProcessJobError::Other(e))?;

  let audio_result_object_path = inferencer.bucket_path_unifier.tts_inference_wav_audio_output_path(
    &job.uuid_idempotency_token); // TODO: Don't use this!

  info!("Audio destination bucket path: {:?}", &audio_result_object_path);

  info!("Uploading audio...");

  inferencer.public_bucket_client.upload_filename_with_content_type(
    &audio_result_object_path,
    &output_audio_fs_path,
    "audio/wav")
      .await
      .map_err(|e| ProcessJobError::Other(e))?;

  safe_delete_temp_file(&output_audio_fs_path);

  // ==================== UPLOAD SPECTROGRAM TO BUCKETS ==================== //

  let spectrogram_result_object_path = inferencer.bucket_path_unifier.tts_inference_spectrogram_output_path(
    &job.uuid_idempotency_token); // TODO: Don't use this!

  info!("Spectrogram destination bucket path: {:?}", &spectrogram_result_object_path);

  info!("Uploading spectrogram...");

  inferencer.public_bucket_client.upload_filename_with_content_type(
    &spectrogram_result_object_path,
    &output_spectrogram_fs_path,
    "application/json")
      .await
      .map_err(|e| ProcessJobError::Other(e))?;

  safe_delete_temp_file(&output_spectrogram_fs_path);

  // ==================== DELETE DOWNLOADED FILE ==================== //

  // NB: We should be using a tempdir, but to make absolutely certain we don't overflow the disk...
  safe_delete_temp_directory(&temp_dir);

  // ==================== SAVE RECORDS ==================== //

  let text_hash = hash_string_sha2(&cleaned_inference_text)
      .map_err(|e| ProcessJobError::Other(e))?;

  info!("Saving tts inference record...");
  let (id, inference_result_token) = insert_tts_result(
    &inferencer.mysql_pool,
    job,
    &text_hash,
    pretrained_vocoder,
    &audio_result_object_path,
    &spectrogram_result_object_path,
    file_metadata.file_size_bytes,
    file_metadata.duration_millis.unwrap_or(0),
    inferencer.worker_details.is_on_prem,
    &inferencer.worker_details.worker_hostname)
      .await
      .map_err(|e| ProcessJobError::Other(e))?;

  info!("Marking job complete...");
  mark_tts_inference_job_done(
    &inferencer.mysql_pool,
    job.id,
    true,
    Some(&inference_result_token))
      .await
      .map_err(|e| ProcessJobError::Other(e))?;

  info!("TTS Done. Original text was: {}", &job.raw_inference_text);

  inferencer.firehose_publisher.tts_inference_finished(
    job.maybe_creator_user_token.as_deref(),
    &model_record.model_token,
    &inference_result_token)
      .await
      .map_err(|e| {
        error!("error publishing event: {:?}", e);
        ProcessJobError::Other(anyhow!("error publishing event"))
      })?;

  redis_logger.log_status("done")
      .map_err(|e| ProcessJobError::Other(e))?;

  info!("Job {:?} complete success! Downloaded, ran inference, and uploaded. Saved model record: {}, Result Token: {}",
        job.id, id, &inference_result_token);

  let duration = start.elapsed();

  since_creation_span.set_attribute("status", "success");
  since_creation_span.set_duration(duration);

  job_iteration_span.set_attribute("status", "success");
  job_iteration_span.set_duration(duration);

  Ok((since_creation_span, job_iteration_span))
}

fn get_timestamp_millis() -> u64 {
  SystemTime::now()
      .duration_since(UNIX_EPOCH)
      .map(|d| d.as_millis() as u64)
      .unwrap_or(0)
}
