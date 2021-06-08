#![deny(unused_must_use)]
#![allow(dead_code)]
#![allow(non_snake_case)]
#![allow(unused_imports)]
#![allow(unused_mut)]
#![allow(unused_variables)]
//#![allow(warnings)]

#[macro_use] extern crate serde_derive;

pub mod buckets;
pub mod common_queries;
pub mod database_helpers;
pub mod job_queries;
pub mod script_execution;
pub mod shared_constants;
pub mod util;

use anyhow::anyhow;
use chrono::Utc;
use crate::buckets::bucket_client::BucketClient;
use crate::buckets::bucket_path_unifier::BucketPathUnifier;
use crate::buckets::bucket_paths::hash_to_bucket_path;
use crate::common_queries::firehose_publisher::FirehosePublisher;
use crate::job_queries::tts_inference_job_queries::TtsInferenceJobRecord;
use crate::job_queries::tts_inference_job_queries::can_grab_job_lock;
use crate::job_queries::tts_inference_job_queries::get_tts_model_by_token;
use crate::job_queries::tts_inference_job_queries::insert_tts_result;
use crate::job_queries::tts_inference_job_queries::mark_tts_inference_job_done;
use crate::job_queries::tts_inference_job_queries::mark_tts_inference_job_failure;
use crate::job_queries::tts_inference_job_queries::query_tts_inference_job_records;
use crate::script_execution::tacotron_inference_command::TacotronInferenceCommand;
use crate::util::anyhow_result::AnyhowResult;
use crate::util::filesystem::check_directory_exists;
use crate::util::filesystem::check_file_exists;
use crate::util::hashing::hash_file_sha2::hash_file_sha2;
use crate::util::hashing::hash_string_sha2::hash_string_sha2;
use crate::util::random_crockford_token::random_crockford_token;
use crate::util::semi_persistent_cache_dir::SemiPersistentCacheDir;
use data_encoding::{HEXUPPER, HEXLOWER, HEXLOWER_PERMISSIVE};
use log::{warn, info};
use ring::digest::{Context, Digest, SHA256};
use shared_constants::DEFAULT_MYSQL_PASSWORD;
use shared_constants::DEFAULT_RUST_LOG;
use sqlx::MySqlPool;
use sqlx::mysql::MySqlPoolOptions;
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

const DEFAULT_TEMP_DIR: &'static str = "/tmp";

struct Inferencer {
  pub download_temp_directory: PathBuf,
  pub mysql_pool: MySqlPool,

  pub private_bucket_client: BucketClient,
  pub public_bucket_client: BucketClient,

  pub firehose_publisher: FirehosePublisher,

  pub bucket_path_unifier: BucketPathUnifier,
  pub semi_persistent_cache: SemiPersistentCacheDir,

  pub tts_inference: TacotronInferenceCommand,

  // Command to run
  pub tts_vocoder_model_filename: String,
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

  let temp_directory = easyenv::get_env_string_or_default(
    "DOWNLOAD_TEMP_DIR",
    DEFAULT_TEMP_DIR);

  let temp_directory = PathBuf::from(temp_directory);

  check_directory_exists(&temp_directory)?;

  let db_connection_string =
      easyenv::get_env_string_or_default(
        "MYSQL_URL",
        DEFAULT_MYSQL_PASSWORD);

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
  semi_persistent_cache.create_tts_vocoder_model_path()?;

  let tts_vocoder_model_filename = easyenv::get_env_string_or_default(
    "TTS_VOCODER_MODEL_FILENAME", "waveglow.pth");


  let firehose_publisher = FirehosePublisher {
    mysql_pool: mysql_pool.clone(), // NB: MySqlPool is clone/send/sync safe
  };

  let inferencer = Inferencer {
    download_temp_directory: temp_directory,
    mysql_pool,
    public_bucket_client,
    private_bucket_client,
    //ffmpeg_image_preview_generator: FfmpegGeneratePreviewImageCommand {},
    //ffmpeg_video_preview_generator: FfmpegGeneratePreviewVideoCommand {},
    //imagemagick_image_preview_generator: ImagemagickGeneratePreviewImageCommand {},
    tts_inference: tts_inference_command,
    bucket_path_unifier: BucketPathUnifier::default_paths(),
    semi_persistent_cache,
    firehose_publisher,
    tts_vocoder_model_filename,
  };

  main_loop(inferencer).await;

  Ok(())
}

const START_TIMEOUT_MILLIS : u64 = 500;
const INCREASE_TIMEOUT_MILLIS : u64 = 1000;

async fn main_loop(inferencer: Inferencer) {
  let mut timeout_millis = START_TIMEOUT_MILLIS;

  loop {
    let num_records = 1;

    let query_result = query_tts_inference_job_records(
      &inferencer.mysql_pool,
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
      std::thread::sleep(Duration::from_millis(20));
      continue;
    }

    let result = process_jobs(&inferencer, jobs).await;

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

    std::thread::sleep(Duration::from_millis(20));
  }
}

async fn process_jobs(inferencer: &Inferencer, jobs: Vec<TtsInferenceJobRecord>) -> AnyhowResult<()> {
  for job in jobs.into_iter() {
    let result = process_job(inferencer, &job).await;
    match result {
      Ok(_) => {},
      Err(e) => {
        warn!("Failure to process job: {:?}", e);
        let failure_reason = "";
        let _r = mark_tts_inference_job_failure(
          &inferencer.mysql_pool,
          &job,
          failure_reason)
            .await;
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

async fn process_job(inferencer: &Inferencer, job: &TtsInferenceJobRecord) -> AnyhowResult<()> {

  // TODO 1. Mark processing

  // TODO 2. Check if vocoder model is downloaded / download to stable location (DONE)

  // TODO 3. Query model by token. (DONE)
  // TODO 4. Check if model is downloaded, otherwise download to stable location (DONE)

  // TODO 5. Write text to file
  // TODO 6. Process Inference

  // TODO 7. Upload Result
  // TODO 8. Save record
  // TODO 9. Mark job done

  // ==================== ATTEMPT TO GRAB JOB LOCK ==================== //

  let lock_acquired = can_grab_job_lock(&inferencer.mysql_pool, job).await?;

  if !lock_acquired {
    warn!("Could not acquire job lock for: {}", &job.id);
    return Ok(())
  }

  // ==================== CONFIRM OR DOWNLOAD TTS VOCODER MODEL ==================== //

  let tts_vocoder_model_filename = inferencer.tts_vocoder_model_filename.clone();
  let tts_vocoder_model_fs_path = inferencer.semi_persistent_cache.tts_vocoder_model_path(&tts_vocoder_model_filename);

  if !tts_vocoder_model_fs_path.exists() {
    warn!("Vocoder model file does not exist: {:?}", &tts_vocoder_model_fs_path);

    let tts_vocoder_model_object_path = inferencer.bucket_path_unifier
        .tts_pretrained_vocoders_path(&tts_vocoder_model_filename);

    info!("Download vocoder from bucket path: {:?}", &tts_vocoder_model_object_path);

    inferencer.private_bucket_client.download_file_to_disk(
      &tts_vocoder_model_object_path,
      &tts_vocoder_model_fs_path
    ).await?;

    info!("Downloaded tts vocoder model from bucket!");
  }

  // ==================== LOOK UP TTS SYNTHESIZER RECORD (WHICH CONTAINS ITS BUCKET PATH) ==================== //

  info!("Looking up TTS model by token: {}", &job.model_token);

  let query_result = get_tts_model_by_token(
    &inferencer.mysql_pool,
    &job.model_token).await?;

  let tts_model = match query_result {
    Some(model) => model,
    None => {
      warn!("TTS model not found: {}", &job.model_token);
      return Err(anyhow!("Model not found!"))
    },
  };

  // ==================== CONFIRM OR DOWNLOAD TTS SYNTHESIZER MODEL ==================== //

  // TODO: Let's just put paths in the db
  // TODO: We'll probably need to LRU cache these.

  let tts_synthesizer_fs_path = inferencer.semi_persistent_cache.tts_synthesizer_model_path(
    &tts_model.model_token);

  if !tts_synthesizer_fs_path.exists() {
    info!("TTS synthesizer model file does not exist: {:?}", &tts_synthesizer_fs_path);

    let tts_synthesizer_object_path  = inferencer.bucket_path_unifier
        .tts_synthesizer_path(&tts_model.private_bucket_hash);

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

  std::fs::write(&text_input_fs_path, &job.inference_text)?;

  // ==================== RUN INFERENCE ==================== //

  let output_audio_fs_path = temp_dir.path().join("output.wav");
  let output_metadata_fs_path = temp_dir.path().join("metadata.json");
  let output_spectrogram_fs_path = temp_dir.path().join("spectrogram.json");

  info!("Running TTS inference...");

  info!("Expected output audio filename: {:?}", &output_audio_fs_path);
  info!("Expected output spectrogram filename: {:?}", &output_spectrogram_fs_path);
  info!("Expected output metadata filename: {:?}", &output_metadata_fs_path);

  inferencer.tts_inference.execute(
    &tts_synthesizer_fs_path,
    &tts_vocoder_model_fs_path,
    &text_input_fs_path,
    &output_audio_fs_path,
    &output_spectrogram_fs_path,
    &output_metadata_fs_path,
    false,
  )?;

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

  let text_hash = hash_string_sha2(&job.inference_text)?;

  info!("Saving tts inference record...");
  let (id, inference_result_token) = insert_tts_result(
    &inferencer.mysql_pool,
    job,
    &text_hash,
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
    &tts_model.model_token,
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
