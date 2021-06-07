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
use crate::buckets::bucket_paths::hash_to_bucket_path;
use crate::common_queries::firehose_publisher::FirehosePublisher;
use crate::job_queries::w2l_download_job_queries::W2lTemplateUploadJobRecord;
use crate::job_queries::w2l_download_job_queries::insert_w2l_template;
use crate::job_queries::w2l_download_job_queries::mark_w2l_template_upload_job_done;
use crate::job_queries::w2l_download_job_queries::mark_w2l_template_upload_job_failure;
use crate::job_queries::w2l_download_job_queries::query_w2l_template_upload_job_records;
use crate::script_execution::ffmpeg_generate_preview_image_command::FfmpegGeneratePreviewImageCommand;
use crate::script_execution::ffmpeg_generate_preview_video_command::FfmpegGeneratePreviewVideoCommand;
use crate::script_execution::google_drive_download_command::GoogleDriveDownloadCommand;
use crate::script_execution::imagemagick_generate_preview_image_command::ImagemagickGeneratePreviewImageCommand;
use crate::script_execution::wav2lip_process_upload_command::Wav2LipPreprocessClient;
use crate::util::anyhow_result::AnyhowResult;
use crate::util::filesystem::check_directory_exists;
use crate::util::filesystem::check_file_exists;
use crate::util::hashing::hash_file_sha2::hash_file_sha2;
use crate::util::random_crockford_token::random_crockford_token;
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

// Various bucket roots
const ENV_DOWNLOAD_BUCKET_ROOT : &'static str = "W2L_DOWNLOAD_BUCKET_ROOT";

// Python code
const ENV_CODE_DIRECTORY : &'static str = "W2L_CODE_DIRECTORY";
const ENV_MODEL_CHECKPOINT : &'static str = "W2L_MODEL_CHECKPOINT";
const ENV_DOWNLOAD_SCRIPT_NAME : &'static str = "W2L_DOWNLOAD_SCRIPT_NAME";

const DEFAULT_TEMP_DIR: &'static str = "/tmp";

struct Downloader {
  pub download_temp_directory: PathBuf,
  pub mysql_pool: MySqlPool,

  pub private_bucket_client: BucketClient,
  pub public_bucket_client: BucketClient,

  pub firehose_publisher: FirehosePublisher,

  pub google_drive_downloader: GoogleDriveDownloadCommand,
  pub w2l_processor: Wav2LipPreprocessClient,
  pub ffmpeg_image_preview_generator: FfmpegGeneratePreviewImageCommand,
  pub ffmpeg_video_preview_generator: FfmpegGeneratePreviewVideoCommand,
  pub imagemagick_image_preview_generator: ImagemagickGeneratePreviewImageCommand,

  // Command to run
  pub download_script: String,

  // Root to store W2L templates (public and private)
  pub bucket_root_w2l_template_uploads: String,

  // Temporary for debugging
  // Arbitrary timeouts can be inserted so we can exec in and poke around.
  pub debug_download_sleep_millis: u64,
  pub debug_face_detect_sleep_millis: u64,
  pub debug_job_end_sleep_millis: u64,
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
    .unwrap_or("w2l-download-job".to_string());

  info!("Hostname: {}", &server_hostname);

  // Bucket stuff (shared)
  let access_key = easyenv::get_env_string_required(ENV_ACCESS_KEY)?;
  let secret_key = easyenv::get_env_string_required(ENV_SECRET_KEY)?;
  let region_name = easyenv::get_env_string_required(ENV_REGION_NAME)?;

  // Private and Public Buckets
  let private_bucket_name = easyenv::get_env_string_required(ENV_PRIVATE_BUCKET_NAME)?;
  let public_bucket_name = easyenv::get_env_string_required(ENV_PUBLIC_BUCKET_NAME)?;

  // Bucket roots
  let bucket_root = easyenv::get_env_string_required(ENV_DOWNLOAD_BUCKET_ROOT)?;

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
  let py_script_name = easyenv::get_env_string_required(ENV_DOWNLOAD_SCRIPT_NAME)?;
  let py_model_checkpoint = easyenv::get_env_string_required(ENV_MODEL_CHECKPOINT)?;

  let w2l_preprecess_command = Wav2LipPreprocessClient::new(
    &py_code_directory,
    &py_script_name,
    &py_model_checkpoint,
  );

  let temp_directory = easyenv::get_env_string_or_default(
    "DOWNLOAD_TEMP_DIR",
    DEFAULT_TEMP_DIR);

  let download_script = easyenv::get_env_string_or_default(
    "DOWNLOAD_SCRIPT",
    "./scripts/download_internet_file.py");

  let google_drive_downloader = GoogleDriveDownloadCommand::new(&download_script);

  let temp_directory = PathBuf::from(temp_directory);

  check_directory_exists(&temp_directory)?;

  let db_connection_string =
    easyenv::get_env_string_or_default(
      "MYSQL_URL",
      DEFAULT_MYSQL_PASSWORD);

  info!("Connecting to database...");

  let mysql_pool = MySqlPoolOptions::new()
    .max_connections(5)
    .connect(&db_connection_string)
    .await?;
  
  let firehose_publisher = FirehosePublisher {
    mysql_pool: mysql_pool.clone(), // NB: Pool is sync/send/clone-safe
  };

  let downloader = Downloader {
    download_temp_directory: temp_directory,
    mysql_pool,
    public_bucket_client,
    private_bucket_client,
    download_script,
    google_drive_downloader,
    firehose_publisher,
    ffmpeg_image_preview_generator: FfmpegGeneratePreviewImageCommand {},
    ffmpeg_video_preview_generator: FfmpegGeneratePreviewVideoCommand {},
    imagemagick_image_preview_generator: ImagemagickGeneratePreviewImageCommand {},
    w2l_processor: w2l_preprecess_command,
    bucket_root_w2l_template_uploads: bucket_root.to_string(),
    debug_download_sleep_millis: easyenv::get_env_num("DEBUG_DOWNLOAD_SLEEP_MILLIS", 0)?,
    debug_face_detect_sleep_millis: easyenv::get_env_num("DEBUG_FACE_DETECT_SLEEP_MILLIS", 0)?,
    debug_job_end_sleep_millis: easyenv::get_env_num("DEBUG_JOB_END_SLEEP_MILLIS", 0)?,
  };

  main_loop(downloader).await;

  Ok(())
}

const START_TIMEOUT_MILLIS : u64 = 500;
const INCREASE_TIMEOUT_MILLIS : u64 = 1000;

async fn main_loop(downloader: Downloader) {
  let mut timeout_millis = START_TIMEOUT_MILLIS;

  loop {
    let num_records = 1;

    let query_result = query_w2l_template_upload_job_records(
      &downloader.mysql_pool,
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

    let result = process_jobs(&downloader, jobs).await;

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

async fn process_jobs(downloader: &Downloader, jobs: Vec<W2lTemplateUploadJobRecord>) -> AnyhowResult<()> {
  for job in jobs.into_iter() {
    let result = process_job(downloader, &job).await;
    match result {
      Ok(_) => {},
      Err(e) => {
        warn!("Failure to process job: {:?}", e);
        let failure_reason = "";
        let _r = mark_w2l_template_upload_job_failure(
          &downloader.mysql_pool,
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
  pub is_video: bool,
  pub width: u32,
  pub height: u32,
  pub num_frames: u64,
  pub fps: Option<f32>,
  pub duration_millis: Option<u64>,
  pub mimetype: Option<String>,
  pub file_size_bytes: u64,
}

fn read_metadata_file(filename: &str) -> AnyhowResult<FileMetadata> {
  let mut file = File::open(filename)?;
  let mut buffer = String::new();
  file.read_to_string(&mut buffer)?;
  Ok(serde_json::from_str(&buffer)?)
}

async fn process_job(downloader: &Downloader, job: &W2lTemplateUploadJobRecord) -> AnyhowResult<()> {
  // TODO: 1. Mark processing.
  // TODO: 2. Download. (DONE)
  // TODO: 3. Process template with face detection (DONE)
  // TODO: 4. Determine if picture or video
  // TODO: 5. Take a screenshot/gif
  // TODO: 6. Upload all (partially done).
  // TODO: 7. Save record. (DONE)
  // TODO: 8. Mark job done. (DONE)

  let temp_dir = format!("temp_{}", job.id);
  let temp_dir = TempDir::new(&temp_dir)?;

  let download_url = job.download_url.as_ref()
    .map(|c| c.to_string())
    .unwrap_or("".to_string());

  // ==================== DOWNLOAD FILE ==================== //

  info!("Calling downloader...");
  let download_filename = downloader.google_drive_downloader
    .download_file(&download_url, &temp_dir).await?;

  if downloader.debug_download_sleep_millis != 0 {
    warn!("Debug sleep after download: {} ms", downloader.debug_download_sleep_millis);
    thread::sleep(Duration::from_millis(downloader.debug_download_sleep_millis));
  }

  // ==================== PROCESS FACES ==================== //

  // This is the Python Pickle file with all the face frames.
  // We'll retain it forever since it's expensive to compute.
  let cached_faces_filename = format!("{}_detected_faces.pickle", &download_filename);

  // This is a file that we'll use to determine if the file is an image or video.
  let output_metadata_filename = format!("{}_metadata.json", &download_filename);

  let is_image = false; // TODO: Don't always treat as video.
  let spawn_process = false;

  downloader.w2l_processor.execute(
    &download_filename,
    &cached_faces_filename,
    &output_metadata_filename,
    is_image,
    spawn_process)?;

  if downloader.debug_face_detect_sleep_millis != 0 {
    warn!("Debug sleep after face detect: {} ms", downloader.debug_face_detect_sleep_millis);
    thread::sleep(Duration::from_millis(downloader.debug_face_detect_sleep_millis));
  }

  // ==================== CHECK ALL FILES EXIST AND GET METADATA ==================== //

  let video_or_image_path = PathBuf::from(&download_filename);
  let cached_faces_path = PathBuf::from(&cached_faces_filename);
  let output_metadata_path = PathBuf::from(&output_metadata_filename);

  info!("Checking that both files exist (original source + cached faces) ...");

  check_file_exists(&video_or_image_path)?;
  check_file_exists(&cached_faces_path)?;
  check_file_exists(&output_metadata_path)?;

  let file_metadata = read_metadata_file(&output_metadata_filename)?;

  // ==================== BASE OBJECT NAMES BASED ON HASH ==================== //

  let private_bucket_hash = hash_file_sha2(&download_filename)?;

  info!("File hash: {}", private_bucket_hash);

  // Full path to video/image
  let full_object_path = hash_to_bucket_path(
    &private_bucket_hash,
    Some(&downloader.bucket_root_w2l_template_uploads))?;

  // ==================== GENERATE VIDEO PREVIEWS ==================== //

  let mut maybe_image_preview_filename : Option<PathBuf> = None;
  let mut maybe_image_preview_object_name : Option<String> = None;

  let mut maybe_video_preview_filename : Option<PathBuf> = None;
  let mut maybe_video_preview_object_name : Option<String> = None;

  if file_metadata.is_video {
    let preview_filename = format!("{}_preview.webp", &download_filename);

    downloader.ffmpeg_video_preview_generator.execute(
      &download_filename,
      &preview_filename,
      500,
      500,
      true,
      false
    )?;

    let video_preview_path = PathBuf::from(&preview_filename);
    check_file_exists(&video_preview_path)?;

    let preview_object_path = format!("{}_preview.webp", full_object_path);
    maybe_video_preview_object_name = Some(preview_object_path);
    maybe_video_preview_filename = Some(video_preview_path);

  } else {
    let preview_filename = format!("{}_preview.webp", &download_filename);

    downloader.imagemagick_image_preview_generator.execute(
      &download_filename,
      &preview_filename,
      500,
      500,
      false
    )?;

    let image_preview_path = PathBuf::from(&preview_filename);
    check_file_exists(&image_preview_path)?;

    let preview_object_path = format!("{}_preview.webp", full_object_path);
    maybe_image_preview_object_name = Some(preview_object_path);
    maybe_image_preview_filename = Some(image_preview_path);
  }

  // ==================== UPLOAD TO BUCKETS ==================== //

  info!("Image/video destination bucket path: {}", full_object_path);

  // Full path to cached faces
  let full_object_path_cached_faces = format!("{}_detected_faces.pickle", full_object_path);

  info!("Cached faces destination bucket path: {}", full_object_path_cached_faces);

  info!("Uploading image/video...");

  let original_mime_type = file_metadata.mimetype
    .as_deref()
    .unwrap_or("application/octet-stream");

  downloader.private_bucket_client.upload_filename_with_content_type(
    &full_object_path,
    &video_or_image_path,
    original_mime_type).await?;

  downloader.public_bucket_client.upload_filename_with_content_type(
    &full_object_path,
    &video_or_image_path,
    original_mime_type).await?;

  info!("Uploading cached faces...");
  let path_copy: PathBuf = cached_faces_path.clone();
  downloader.private_bucket_client.upload_filename(
    &full_object_path_cached_faces,
    &path_copy).await?;

  // TODO: Fix this ugh.
  if let Some(image_preview_filename) = maybe_image_preview_filename.as_deref() {
    if let Some(image_preview_object_name) = maybe_image_preview_object_name.as_deref() {
      info!("Uploading image preview...");
      downloader.private_bucket_client.upload_filename_with_content_type(
        &image_preview_object_name,
        image_preview_filename,
        "image/webp").await?;

      info!("Uploading image preview...");
      downloader.public_bucket_client.upload_filename_with_content_type(
        &image_preview_object_name,
        image_preview_filename,
        "image/webp").await?;
    }
  }

  // TODO: Fix this ugh.
  if let Some(video_preview_filename) = maybe_video_preview_filename.as_deref() {
    if let Some(video_preview_object_name) = maybe_video_preview_object_name.as_deref() {
      info!("Uploading video preview...");
      downloader.private_bucket_client.upload_filename_with_content_type(
        &video_preview_object_name,
        video_preview_filename,
        "image/webp").await?;

      info!("Uploading video preview...");
      downloader.public_bucket_client.upload_filename_with_content_type(
        &video_preview_object_name,
        video_preview_filename,
        "image/webp").await?;
    }
  }

  // ==================== SAVE RECORDS ==================== //

  let template_type = if file_metadata.is_video { "video" } else { "image" };

  info!("Saving model record...");
  let (id, model_token) = insert_w2l_template(
    &downloader.mysql_pool,
    template_type,
    job,
    &private_bucket_hash,
    &full_object_path,
    &full_object_path_cached_faces,
    maybe_image_preview_object_name.as_deref(),
    maybe_video_preview_object_name.as_deref(),
    file_metadata.file_size_bytes,
    file_metadata.mimetype.as_deref(),
    file_metadata.width,
    file_metadata.height,
    file_metadata.num_frames,
    file_metadata.fps.unwrap_or(0.0f32),
    file_metadata.duration_millis.unwrap_or(0))
    .await?;

  info!("Marking job complete...");

  mark_w2l_template_upload_job_done(
    &downloader.mysql_pool,
    job,
    true,
    Some(&model_token)
  ).await?;

  info!("Job {} complete success! Downloaded, processed, and uploaded. Saved model record: {}",
        job.id, id);

  downloader.firehose_publisher.publish_w2l_template_upload_finished(&job.creator_user_token, &model_token)
    .await
    .map_err(|e| {
      warn!("error publishing event: {:?}", e);
      anyhow!("error publishing event")
    })?;

  if downloader.debug_job_end_sleep_millis != 0 {
    warn!("Debug sleep after job end: {} ms", downloader.debug_job_end_sleep_millis);
    thread::sleep(Duration::from_millis(downloader.debug_job_end_sleep_millis));
  }

  Ok(())
}
