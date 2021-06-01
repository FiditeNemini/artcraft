#![deny(unused_must_use)]
#![allow(dead_code)]
#![allow(unused_imports)]
#![allow(unused_mut)]
#![allow(unused_variables)]
//#![allow(warnings)]

#[macro_use] extern crate serde_derive;

pub mod buckets;
pub mod common_queries;
pub mod job_queries;
pub mod script_execution;
pub mod shared_constants;
pub mod util;

use anyhow::anyhow;
use chrono::Utc;
use crate::buckets::bucket_client::BucketClient;
use crate::buckets::bucket_path_unifier::BucketPathUnifier;
use crate::buckets::bucket_paths::hash_to_bucket_path;
use crate::buckets::file_hashing::get_file_hash;
use crate::common_queries::firehose_publisher::FirehosePublisher;
use crate::job_queries::tts_inference_job_queries::TtsInferenceJobRecord;
use crate::job_queries::tts_inference_job_queries::get_tts_model_by_token;
use crate::job_queries::tts_inference_job_queries::insert_tts_result;
use crate::job_queries::tts_inference_job_queries::mark_tts_inference_job_done;
use crate::job_queries::tts_inference_job_queries::mark_tts_inference_job_failure;
use crate::job_queries::tts_inference_job_queries::query_tts_inference_job_records;
use crate::script_execution::tacotron_inference_command::TacotronInferenceCommand;
use crate::util::anyhow_result::AnyhowResult;
use crate::util::filesystem::check_directory_exists;
use crate::util::filesystem::check_file_exists;
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

// Buckets (private data)
const ENV_PRIVATE_BUCKET_NAME : &'static str = "W2L_PRIVATE_DOWNLOAD_BUCKET_NAME";
// Buckets (public data)
const ENV_PUBLIC_BUCKET_NAME : &'static str = "W2L_PUBLIC_DOWNLOAD_BUCKET_NAME";

// Where models and other assets get downloaded to.
const ENV_SEMIPERSISTENT_CACHE_DIR : &'static str = "SEMIPERSISTENT_CACHE_DIR";

// Python code
const ENV_CODE_DIRECTORY : &'static str = "W2L_CODE_DIRECTORY";
const ENV_MODEL_CHECKPOINT : &'static str = "W2L_MODEL_CHECKPOINT";
const ENV_INFERENCE_SCRIPT_NAME : &'static str = "W2L_INFERENCE_SCRIPT_NAME";

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
  //let py_model_checkpoint = easyenv::get_env_string_required(ENV_MODEL_CHECKPOINT)?;

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
      std::thread::sleep(Duration::from_millis(1500));
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

    std::thread::sleep(Duration::from_millis(500));
  }
}

async fn process_jobs(inferencer: &Inferencer, jobs: Vec<W2lInferenceJobRecord>) -> AnyhowResult<()> {
  for job in jobs.into_iter() {
    let result = process_job(inferencer, &job).await;
    match result {
      Ok(_) => {},
      Err(e) => {
        warn!("Failure to process job: {:?}", e);
        let failure_reason = "";
        let _r = mark_w2l_inference_job_failure(
          &inferencer.mysql_pool,
          &job,
          failure_reason)
            .await;
      }
    }
  }

  Ok(())
}

#[derive(Deserialize)]
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

async fn process_job(inferencer: &Inferencer, job: &W2lInferenceJobRecord) -> AnyhowResult<()> {

  // TODO 1. Mark processing

  // TODO 2. Check if vocoder model is downloaded / download to stable location

  // TODO 3. Query model by token.
  // TODO 4. Check if model is downloaded, otherwise download to stable location

  // TODO 5. Process Inference

  // TODO 6. Upload Result
  // TODO 7. Save record
  // TODO 8. Mark job done


  // ==================== CONFIRM OR DOWNLOAD TTS VOCODER MODEL ==================== //

  let tts_vocoder_model_filename = inferencer.tts_vocoder_model_filename.clone();
  let tts_vocoder_model_fs_path = inferencer.semi_persistent_cache.tts_vocoder_model_path(&tts_vocoder_model_filename);

  if !tts_vocoder_model_fs_path.exists() {
    warn!("Vocoder model file does not exist: {:?}", &tts_vocoder_model_fs_path);

    let model_object_path = inferencer.bucket_path_unifier
        .w2l_pretrained_models_path(&model_filename);

    info!("Download from bucket path: {:?}", &model_object_path);

    inferencer.private_bucket_client.download_file_to_disk(
      &model_object_path,
      &model_fs_path
    ).await?;

    info!("Downloaded model from bucket!");
  }

  // ==================== CONFIRM OR DOWNLOAD W2L END BUMP ==================== //

  let end_bump_filename = inferencer.w2l_end_bump_filename.clone();
  let end_bump_fs_path = inferencer.semi_persistent_cache.w2l_end_bump_path(&end_bump_filename);

  if !end_bump_fs_path.exists() {
    warn!("End bump file does not exist: {:?}", &end_bump_fs_path);

    let end_bump_object_path = inferencer.bucket_path_unifier
        .end_bump_video_for_w2l_path(&end_bump_filename);

    info!("Download from bucket path: {:?}", &end_bump_object_path);

    inferencer.private_bucket_client.download_file_to_disk(
      &end_bump_object_path,
      &end_bump_fs_path
    ).await?;

    info!("Downloaded end bump from bucket!");
  }

  // ==================== LOOK UP TEMPLATE RECORD ==================== //

  let template_token = match &job.maybe_w2l_template_token {
    Some(token) => token.to_string(),
    None => {
      warn!("non-template token based inference not yet supported");
      return Err(anyhow!("non-template token based inference not yet supported"))
    },
  };

  info!("Looking up w2l template by token: {}", &template_token);

  let query_result = get_w2l_template_by_token(&inferencer.mysql_pool, &template_token).await?;

  let w2l_template = match query_result {
    Some(template) => template,
    None => {
      warn!("W2L Template not found: {}", &template_token);
      return Err(anyhow!("Template not found!"))
    },
  };

  // ==================== CONFIRM OR DOWNLOAD W2L TEMPLATE AUDIO OR VIDEO ==================== //

  // Template is based on the `private_bucket_hash`:
  //  - private_bucket_hash: 1519edf86e6975fdcd0a56a5953d84948db79f2b9ce588818d7fa544d5cb38b2
  //  - private_bucket_object_name: /user_uploaded_w2l_templates/1/5/1/1519edf86e6975fdcd0a56a5953d84948db79f2b9ce588818d7fa544d5cb38b2
  //  - private_bucket_cached_faces_object_name: /user_uploaded_w2l_templates/1/5/1/1519edf86e6975fdcd0a56a5953d84948db79f2b9ce588818d7fa544d5cb38b2_detected_faces.pickle
  //  - maybe_public_bucket_preview_image_object_name: /user_uploaded_w2l_templates/1/5/1/1519edf86e6975fdcd0a56a5953d84948db79f2b9ce588818d7fa544d5cb38b2_preview.webp

  let template_media_fs_path = inferencer.semi_persistent_cache.w2l_template_media_path(
    &w2l_template.private_bucket_hash);

  if !template_media_fs_path.exists() {
    info!("W2L template media file does not exist: {:?}", &template_media_fs_path);

    let template_media_object_path = inferencer.bucket_path_unifier
        .media_templates_for_w2l_path(&w2l_template.private_bucket_hash);

    info!("Download from template media path: {:?}", &template_media_object_path);

    inferencer.private_bucket_client.download_file_to_disk(
      &template_media_object_path,
      &template_media_fs_path
    ).await?;

    info!("Downloaded template media from bucket!");
  }

  // ==================== CONFIRM OR DOWNLOAD W2L TEMPLATE FACE ==================== //

  // Template is based on the `private_bucket_hash`:
  //  - private_bucket_hash: 1519edf86e6975fdcd0a56a5953d84948db79f2b9ce588818d7fa544d5cb38b2
  //  - private_bucket_object_name: /user_uploaded_w2l_templates/1/5/1/1519edf86e6975fdcd0a56a5953d84948db79f2b9ce588818d7fa544d5cb38b2
  //  - private_bucket_cached_faces_object_name: /user_uploaded_w2l_templates/1/5/1/1519edf86e6975fdcd0a56a5953d84948db79f2b9ce588818d7fa544d5cb38b2_detected_faces.pickle
  //  - maybe_public_bucket_preview_image_object_name: /user_uploaded_w2l_templates/1/5/1/1519edf86e6975fdcd0a56a5953d84948db79f2b9ce588818d7fa544d5cb38b2_preview.webp

  let face_template_fs_path = inferencer.semi_persistent_cache.w2l_face_template_path(
    &w2l_template.private_bucket_hash);

  if !face_template_fs_path.exists() {
    info!("W2L face template file does not exist: {:?}", &face_template_fs_path);

    let face_template_object_path = inferencer.bucket_path_unifier
        .precomputed_faces_for_w2l_path(&w2l_template.private_bucket_hash);

    info!("Download from face template path: {:?}", &face_template_object_path);

    inferencer.private_bucket_client.download_file_to_disk(
      &face_template_object_path,
      &face_template_fs_path
    ).await?;

    info!("Downloaded face template from bucket!");
  }

  // ==================== DOWNLOAD USER AUDIO ==================== //

  let temp_dir = format!("temp_{}", job.id);
  let temp_dir = TempDir::new(&temp_dir)?; // NB: Exists until it goes out of scope.

  let audio_bucket_hash = match &job.maybe_public_audio_bucket_hash {
    Some(l) => l.clone(),
    None => {
      warn!("Only W2L jobs with user-uploaded audio are supported right now");
      return Err(anyhow!("Only W2L jobs with user-uploaded audio are supported right now"))
    },
  };

  let audio_fs_path = temp_dir.path().join(&audio_bucket_hash);

  let audio_object_path = inferencer.bucket_path_unifier
      .user_audio_for_w2l_inference_path(&audio_bucket_hash);

  inferencer.private_bucket_client.download_file_to_disk(
    &audio_object_path,
    &audio_fs_path
  ).await?;


  // ==================== RUN INFERENCE ==================== //

  let output_video_fs_path = temp_dir.path().join("output.mp4");
  let output_metadata_fs_path = temp_dir.path().join("metadata.json");

  let is_image = w2l_template.template_type.contains("image");

  info!("Is image? {}", is_image);
  info!("Running W2L inference...");

  inferencer.w2l_inference.execute(
    &model_fs_path,
    &audio_fs_path,
    &end_bump_fs_path,
    &template_media_fs_path,
    &face_template_fs_path,
    &output_metadata_fs_path,
    &output_video_fs_path,
    false,
    false
  )?;

  info!("Output filename: {:?}", &output_video_fs_path);

  // ==================== CHECK ALL FILES EXIST AND GET METADATA ==================== //

  info!("Checking that output files exist...");

  check_file_exists(&output_video_fs_path)?;
  check_file_exists(&output_metadata_fs_path)?;

  let file_metadata = read_metadata_file(&output_metadata_fs_path)?;

  // ==================== UPLOAD TO BUCKETS ==================== //

  let result_object_path = inferencer.bucket_path_unifier.w2l_inference_video_output_path(
    &job.inference_job_token);

  info!("Image/video destination bucket path: {:?}", &result_object_path);

  info!("Uploading image/video...");

  let original_mime_type = file_metadata.mimetype
      .as_deref()
      .unwrap_or("application/octet-stream");

  inferencer.public_bucket_client.upload_filename_with_content_type(
    &result_object_path,
    &output_video_fs_path,
    original_mime_type)
      .await?;

  // ==================== SAVE RECORDS ==================== //

  info!("Saving w2l inference record...");
  let (id, inference_result_token) = insert_w2l_result(
    &inferencer.mysql_pool,
    job,
    &result_object_path,
    file_metadata.file_size_bytes,
    file_metadata.mimetype.as_deref(),
    file_metadata.width,
    file_metadata.height,
    file_metadata.duration_millis.unwrap_or(0))
      .await?;

  info!("Marking job complete...");
  mark_w2l_inference_job_done(&inferencer.mysql_pool, job, true).await?;

  inferencer.firehose_publisher.w2l_inference_finished(
    job.maybe_creator_user_token.as_deref(),
    &job.inference_job_token,
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
