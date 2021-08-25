#![forbid(private_in_public)]
#![forbid(unused_must_use)]
//#![forbid(warnings)]

#![allow(dead_code)]
#![allow(non_snake_case)]
#![allow(unused_imports)]
#![allow(unused_mut)]
#![allow(unused_variables)]

#[macro_use] extern crate serde_derive;

pub mod clients;
pub mod common_env;
pub mod database;
pub mod job_queries;
pub mod script_execution;
pub mod shared_constants;
pub mod util;

use anyhow::{anyhow, Error};
use chrono::{Utc, DateTime, TimeZone};
use crate::clients::tts_inference_sidecar_client::TtsInferenceSidecarClient;
use crate::common_env::CommonEnv;
use crate::database::enums::vocoder_type::VocoderType;
use crate::database::mediators::firehose_publisher::FirehosePublisher;
use crate::job_queries::tts_inference_job_queries::get_tts_model_by_token;
use crate::job_queries::tts_inference_job_queries::grab_job_lock_and_mark_pending;
use crate::job_queries::tts_inference_job_queries::insert_tts_result;
use crate::job_queries::tts_inference_job_queries::mark_tts_inference_job_done;
use crate::job_queries::tts_inference_job_queries::mark_tts_inference_job_failure;
use crate::job_queries::tts_inference_job_queries::query_tts_inference_job_records;
use crate::job_queries::tts_inference_job_queries::{TtsInferenceJobRecord, TtsModelRecord2};
use crate::script_execution::tacotron_inference_command::TacotronInferenceCommand;
use crate::shared_constants::DEFAULT_MYSQL_CONNECTION_STRING;
use crate::shared_constants::DEFAULT_RUST_LOG;
use crate::util::anyhow_result::AnyhowResult;
use crate::util::buckets::bucket_client::BucketClient;
use crate::util::buckets::bucket_path_unifier::BucketPathUnifier;
use crate::util::buckets::bucket_paths::hash_to_bucket_path;
use crate::util::filesystem::check_directory_exists;
use crate::util::filesystem::check_file_exists;
use crate::util::hashing::hash_file_sha2::hash_file_sha2;
use crate::util::hashing::hash_string_sha2::hash_string_sha2;
use crate::util::jobs::cache_miss_strategizer::CacheMissStrategizer;
use crate::util::jobs::cache_miss_strategizer::CacheMissStrategy;
use crate::util::jobs::cache_miss_strategizer_multi::SyncMultiCacheMissStrategizer;
use crate::util::jobs::virtual_lfu_cache::SyncVirtualLfuCache;
use crate::util::noop_logger::NoOpLogger;
use crate::util::random_crockford_token::random_crockford_token;
use crate::util::semi_persistent_cache_dir::SemiPersistentCacheDir;
use data_encoding::{HEXUPPER, HEXLOWER, HEXLOWER_PERMISSIVE};
use log::{warn, info};
use ring::digest::{Context, Digest, SHA256};
use sqlx::MySqlPool;
use sqlx::mysql::MySqlPoolOptions;
use std::collections::HashMap;
use std::fs::{File, metadata};
use std::io::{BufReader, Read};
use std::path::{PathBuf, Path};
use std::process::Command;
use std::thread;
use std::time::Duration;
use tempdir::TempDir;

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

  pub private_bucket_client: BucketClient,
  pub public_bucket_client: BucketClient,

  pub firehose_publisher: FirehosePublisher,

  pub bucket_path_unifier: BucketPathUnifier,
  pub semi_persistent_cache: SemiPersistentCacheDir,

  pub tts_inference_command: TacotronInferenceCommand,
  pub tts_inference_sidecar_client: TtsInferenceSidecarClient,

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
  pub sidecar_max_synthesizer_models: u32,
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

  info!("Hostname: {}", &server_hostname);

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

  let firehose_publisher = FirehosePublisher {
    mysql_pool: mysql_pool.clone(), // NB: MySqlPool is clone/send/sync safe
  };

  let common_env = CommonEnv::read_from_env()?;

  let virtual_lfu_cache = SyncVirtualLfuCache::new(2)?;

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

  let inferencer = Inferencer {
    download_temp_directory: temp_directory,
    mysql_pool,
    public_bucket_client,
    private_bucket_client,
    tts_inference_command,
    tts_inference_sidecar_client,
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
  };

  main_loop(inferencer).await;

  Ok(())
}

const START_TIMEOUT_MILLIS : u64 = 500;
const INCREASE_TIMEOUT_MILLIS : u64 = 1000;

async fn main_loop(inferencer: Inferencer) {
  let mut error_timeout_millis = START_TIMEOUT_MILLIS;

  let mut noop_logger = NoOpLogger::new(inferencer.no_op_logger_millis as i64);

  loop {
    let num_records = inferencer.job_batch_size;

    let query_result = query_tts_inference_job_records(
      &inferencer.mysql_pool,
      num_records)
        .await;

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
      noop_logger.log_after_awhile();

      std::thread::sleep(Duration::from_millis(inferencer.job_batch_wait_millis));
      continue;
    }

    let batch_result = process_jobs(
      &inferencer,
      jobs,
    ).await;

    match batch_result {
      Ok(_) => {},
      Err(e) => {
        warn!("Error querying jobs: {:?}", e);
        std::thread::sleep(Duration::from_millis(error_timeout_millis));
        error_timeout_millis += INCREASE_TIMEOUT_MILLIS;
        continue;
      }
    }

    error_timeout_millis = START_TIMEOUT_MILLIS; // reset

    std::thread::sleep(Duration::from_millis(inferencer.job_batch_wait_millis));
  }
}

/// Process a batch of jobs, returning the count of cold-cache skipped jobs.
async fn process_jobs(
  inferencer: &Inferencer,
  jobs: Vec<TtsInferenceJobRecord>,
) -> AnyhowResult<()> {

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
        warn!("Failure to check model state: {:?}", e);

        let failure_reason = "";
        let _r = mark_tts_inference_job_failure(
          &inferencer.mysql_pool,
          &job,
          failure_reason,
          inferencer.job_max_attempts
        ).await;
        continue;
      }
    };

    if !model_state.is_downloaded_to_filesystem || !model_state.is_in_memory_cache {
      warn!("Model isn't ready (downloaded = {}), (in memory = {})",
        model_state.is_downloaded_to_filesystem,
        model_state.is_in_memory_cache);

      let maybe_strategy = if !model_state.is_downloaded_to_filesystem {
        inferencer.cache_miss_strategizers.disk_cache_miss(&model_state.model_record.model_token)
      } else {
        inferencer.cache_miss_strategizers.memory_cache_miss(&model_state.model_record.model_token)
      };

      match maybe_strategy {
        Err(err) => {
          warn!("Failure to process job: {:?}", err);
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
      Ok(_) => {},
      Err(e) => {
        warn!("Failure to process job: {:?}", e);
        let failure_reason = "";
        let _r = mark_tts_inference_job_failure(
          &inferencer.mysql_pool,
          &job,
          failure_reason,
          inferencer.job_max_attempts
        ).await;
      }
    }
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
  pub model_record: TtsModelRecord2,
  pub is_downloaded_to_filesystem: bool,
  pub is_in_memory_cache: bool,
}

impl ModelState {
  /// Query the model details and see if the model file is on the filesystem in one go.
  pub async fn query_model_and_check_filesystem(
    job: &TtsInferenceJobRecord,
    mysql_pool: &MySqlPool,
    semi_persistent_cache: &SemiPersistentCacheDir,
    virtual_cache: &SyncVirtualLfuCache,
  ) -> AnyhowResult<Self> {
    info!("Looking up TTS model by token: {}", &job.model_token);

    let query_result = get_tts_model_by_token(
      &mysql_pool,
      &job.model_token).await?;

    let model_record = match query_result {
      Some(model) => model,
      None => {
        warn!("TTS model not found: {}", &job.model_token);
        return Err(anyhow!("Model not found!"))
      },
    };

    let tts_synthesizer_fs_path = semi_persistent_cache.tts_synthesizer_model_path(
      &model_record.model_token);

    let is_downloaded_to_filesystem = tts_synthesizer_fs_path.exists();

    let path = tts_synthesizer_fs_path
        .to_str()
        .ok_or(anyhow!("could not make path"))?
        .to_string();

    let is_in_memory_cache = virtual_cache.in_cache(&path)?;

    Ok(Self {
      model_record,
      is_downloaded_to_filesystem,
      is_in_memory_cache,
    })
  }
}

async fn process_job(
  inferencer: &Inferencer,
  job: &TtsInferenceJobRecord,
  model_record: &TtsModelRecord2,
) -> AnyhowResult<()> {

  // TODO 1. Mark processing (DONE)

  // TODO 2. Check if vocoder model is downloaded / download to stable location (DONE)

  // TODO 3. Query model by token. (DONE)
  // TODO 4. Check if model is downloaded, otherwise download to stable location (DONE)

  // TODO 5. Write text to file
  // TODO 6. Process Inference

  // TODO 7. Upload Result
  // TODO 8. Save record
  // TODO 9. Mark job done

  // ==================== ATTEMPT TO GRAB JOB LOCK ==================== //

  let lock_acquired = grab_job_lock_and_mark_pending(&inferencer.mysql_pool, job).await?;

  if !lock_acquired {
    warn!("Could not acquire job lock for: {}", &job.id);
    return Ok(())
  }

  // ==================== CONFIRM OR DOWNLOAD WAVEGLOW VOCODER MODEL ==================== //

  let waveglow_vocoder_model_filename = inferencer.waveglow_vocoder_model_filename.clone();
  let waveglow_vocoder_model_fs_path = inferencer.semi_persistent_cache.tts_pretrained_vocoder_model_path(&waveglow_vocoder_model_filename);

  if !waveglow_vocoder_model_fs_path.exists() {
    warn!("Waveglow vocoder model file does not exist: {:?}", &waveglow_vocoder_model_fs_path);

    let waveglow_vocoder_model_object_path = inferencer.bucket_path_unifier
        .tts_pretrained_vocoders_path(&waveglow_vocoder_model_filename);

    info!("Download waveglow vocoder from bucket path: {:?}", &waveglow_vocoder_model_object_path);

    inferencer.private_bucket_client.download_file_to_disk(
      &waveglow_vocoder_model_object_path,
      &waveglow_vocoder_model_fs_path
    ).await?;

    info!("Downloaded waveglow vocoder model from bucket!");
  }

  // ==================== CONFIRM OR DOWNLOAD HIFIGAN (NORMAL) VOCODER MODEL ==================== //

  let hifigan_vocoder_model_filename = inferencer.hifigan_vocoder_model_filename.clone();
  let hifigan_vocoder_model_fs_path = inferencer.semi_persistent_cache.tts_pretrained_vocoder_model_path(&hifigan_vocoder_model_filename);

  if !hifigan_vocoder_model_fs_path.exists() {
    warn!("Hifigan vocoder model file does not exist: {:?}", &hifigan_vocoder_model_fs_path);

    let hifigan_vocoder_model_object_path = inferencer.bucket_path_unifier
        .tts_pretrained_vocoders_path(&hifigan_vocoder_model_filename);

    info!("Download hifigan vocoder from bucket path: {:?}", &hifigan_vocoder_model_object_path);

    inferencer.private_bucket_client.download_file_to_disk(
      &hifigan_vocoder_model_object_path,
      &hifigan_vocoder_model_fs_path
    ).await?;

    info!("Downloaded hifigan vocoder model from bucket!");
  }

  // ==================== CONFIRM OR DOWNLOAD HIFIGAN (SUPERRES) VOCODER MODEL ==================== //

  let hifigan_superres_vocoder_model_filename = inferencer.hifigan_superres_vocoder_model_filename.clone();
  let hifigan_superres_vocoder_model_fs_path = inferencer.semi_persistent_cache.tts_pretrained_vocoder_model_path(&hifigan_superres_vocoder_model_filename);

  if !hifigan_superres_vocoder_model_fs_path.exists() {
    warn!("Hifigan superres vocoder model file does not exist: {:?}", &hifigan_superres_vocoder_model_fs_path);

    let hifigan_superres_vocoder_model_object_path = inferencer.bucket_path_unifier
        .tts_pretrained_vocoders_path(&hifigan_superres_vocoder_model_filename);

    info!("Download hifigan superres vocoder from bucket path: {:?}", &hifigan_superres_vocoder_model_object_path);

    inferencer.private_bucket_client.download_file_to_disk(
      &hifigan_superres_vocoder_model_object_path,
      &hifigan_superres_vocoder_model_fs_path
    ).await?;

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

    let tts_synthesizer_object_path  = inferencer.bucket_path_unifier
        .tts_synthesizer_path(&model_record.private_bucket_hash);

    info!("Download from template media path: {:?}", &tts_synthesizer_object_path);

    inferencer.private_bucket_client.download_file_to_disk(
      &tts_synthesizer_object_path,
      &tts_synthesizer_fs_path
    ).await?;

    info!("Downloaded template media from bucket!");
  }

  // ==================== WRITE TEXT TO FILE ==================== //

  let temp_dir = format!("temp_tts_inference_{}", job.id);
  let temp_dir = TempDir::new(&temp_dir)?; // NB: Exists until it goes out of scope.

  let text_input_fs_path = temp_dir.path().join("inference_input.txt");

  std::fs::write(&text_input_fs_path, &job.raw_inference_text)?;

  // ==================== RUN INFERENCE ==================== //

  // TODO: Fix this.
  let maybe_unload_model_path = inferencer
      .virtual_model_lfu
      .insert_returning_replaced(tts_synthesizer_fs_path.to_str().unwrap_or(""))?;

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
    pretrained_vocoder = VocoderType::from_str(default_vocoder)?;
  }

  info!("With pretrained vocoder: {:?}", pretrained_vocoder);

  inferencer.tts_inference_sidecar_client.request_inference(
    &job.raw_inference_text,
    &tts_synthesizer_fs_path,
    pretrained_vocoder,
    &hifigan_vocoder_model_fs_path,
    &hifigan_superres_vocoder_model_fs_path,
    &waveglow_vocoder_model_fs_path,
    &output_audio_fs_path,
    &output_spectrogram_fs_path,
    &output_metadata_fs_path,
    maybe_unload_model_path,
  ).await?;

  // ==================== CHECK ALL FILES EXIST AND GET METADATA ==================== //

  info!("Checking that output files exist...");

  check_file_exists(&output_audio_fs_path)?;
  check_file_exists(&output_spectrogram_fs_path)?;
  check_file_exists(&output_metadata_fs_path)?;

  let file_metadata = read_metadata_file(&output_metadata_fs_path)?;

  // ==================== UPLOAD AUDIO TO BUCKET ==================== //

  let audio_result_object_path = inferencer.bucket_path_unifier.tts_inference_wav_audio_output_path(
    &job.uuid_idempotency_token); // TODO: Don't use this!

  info!("Audio destination bucket path: {:?}", &audio_result_object_path);

  info!("Uploading audio...");

  inferencer.public_bucket_client.upload_filename_with_content_type(
    &audio_result_object_path,
    &output_audio_fs_path,
    "audio/wav")
      .await?;

  // ==================== UPLOAD SPECTROGRAM TO BUCKETS ==================== //

  let spectrogram_result_object_path = inferencer.bucket_path_unifier.tts_inference_spectrogram_output_path(
    &job.uuid_idempotency_token); // TODO: Don't use this!

  info!("Spectrogram destination bucket path: {:?}", &spectrogram_result_object_path);

  info!("Uploading spectrogram...");

  inferencer.public_bucket_client.upload_filename_with_content_type(
    &spectrogram_result_object_path,
    &output_spectrogram_fs_path,
    "application/json")
      .await?;

  // ==================== SAVE RECORDS ==================== //

  let text_hash = hash_string_sha2(&job.raw_inference_text)?;

  info!("Saving tts inference record...");
  let (id, inference_result_token) = insert_tts_result(
    &inferencer.mysql_pool,
    job,
    &text_hash,
    pretrained_vocoder,
    &audio_result_object_path,
    &spectrogram_result_object_path,
    file_metadata.file_size_bytes,
    file_metadata.duration_millis.unwrap_or(0))
      .await?;

  info!("Marking job complete...");
  mark_tts_inference_job_done(
    &inferencer.mysql_pool,
    job,
    true,
    Some(&inference_result_token)
  ).await?;

  inferencer.firehose_publisher.tts_inference_finished(
    job.maybe_creator_user_token.as_deref(),
    &model_record.model_token,
    &inference_result_token)
      .await
      .map_err(|e| {
        warn!("error publishing event: {:?}", e);
        anyhow!("error publishing event")
      })?;

  info!("Job {} complete success! Downloaded, ran inference, and uploaded. Saved model record: {}",
        job.id, id);

  Ok(())
}
