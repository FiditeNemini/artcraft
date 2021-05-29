#![deny(unused_must_use)]
#![allow(dead_code)]
#![allow(unused_imports)]
#![allow(unused_mut)]
#![allow(unused_variables)]
//#![allow(warnings)]

#[macro_use] extern crate serde_derive;

pub mod buckets;
pub mod job_queries;
pub mod script_execution;
pub mod util;

use anyhow::anyhow;
use chrono::Utc;
use crate::buckets::bucket_client::BucketClient;
use crate::buckets::bucket_path_unifier::BucketPathUnifier;
use crate::buckets::bucket_paths::hash_to_bucket_path;
use crate::buckets::file_hashing::get_file_hash;
use crate::job_queries::w2l_inference_job_queries::W2lInferenceJobRecord;
use crate::job_queries::w2l_inference_job_queries::get_w2l_template_by_token;
use crate::job_queries::w2l_inference_job_queries::insert_w2l_result;
use crate::job_queries::w2l_inference_job_queries::mark_w2l_inference_job_done;
use crate::job_queries::w2l_inference_job_queries::mark_w2l_inference_job_failure;
use crate::job_queries::w2l_inference_job_queries::query_w2l_inference_job_records;
use crate::script_execution::ffmpeg_generate_preview_image_command::FfmpegGeneratePreviewImageCommand;
use crate::script_execution::ffmpeg_generate_preview_video_command::FfmpegGeneratePreviewVideoCommand;
use crate::script_execution::google_drive_download_command::GoogleDriveDownloadCommand;
use crate::script_execution::imagemagick_generate_preview_image_command::ImagemagickGeneratePreviewImageCommand;
use crate::script_execution::wav2lip_inference_command::Wav2LipInferenceCommand;
use crate::util::anyhow_result::AnyhowResult;
use crate::util::filesystem::check_directory_exists;
use crate::util::filesystem::check_file_exists;
use crate::util::random_crockford_token::random_crockford_token;
use crate::util::semi_persistent_cache_dir::SemiPersistentCacheDir;
use data_encoding::{HEXUPPER, HEXLOWER, HEXLOWER_PERMISSIVE};
use log::{warn, info};
use ring::digest::{Context, Digest, SHA256};
use sqlx::MySqlPool;
use sqlx::mysql::MySqlPoolOptions;
use std::fs::{File, metadata};
use std::io::{BufReader, Read};
use std::path::{PathBuf, Path};
use std::process::Command;
use std::time::Duration;
use tempdir::TempDir;
use std::thread;

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

/// NB: `sqlx::query` is spammy and logs all queries as "info"-level
/// NB: `hyper::proto::h1::io` is incredibly spammy and logs every chunk of bytes in very large files being downloaded
const DEFAULT_RUST_LOG: &'static str = "debug,actix_web=info,sqlx::query=warn,hyper::proto::h1::io=warn";
const DEFAULT_TEMP_DIR: &'static str = "/tmp";

struct Inferencer {
  pub download_temp_directory: PathBuf,
  pub mysql_pool: MySqlPool,

  pub private_bucket_client: BucketClient,
  pub public_bucket_client: BucketClient,

  pub bucket_path_unifier: BucketPathUnifier,
  pub semi_persistent_cache: SemiPersistentCacheDir,

  pub google_drive_downloader: GoogleDriveDownloadCommand,
  pub w2l_inference: Wav2LipInferenceCommand,
  //pub ffmpeg_image_preview_generator: FfmpegGeneratePreviewImageCommand,
  //pub ffmpeg_video_preview_generator: FfmpegGeneratePreviewVideoCommand,
  //pub imagemagick_image_preview_generator: ImagemagickGeneratePreviewImageCommand,

  // Command to run
  pub inference_script: String,
  pub w2l_model_filename: String,
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
    .unwrap_or("w2l-inference-job".to_string());

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
  let py_model_checkpoint = easyenv::get_env_string_required(ENV_MODEL_CHECKPOINT)?;

  let w2l_inference_command = Wav2LipInferenceCommand::new(
    &py_code_directory,
    &py_script_name,
    &py_model_checkpoint,
  );

  let temp_directory = easyenv::get_env_string_or_default(
    "DOWNLOAD_TEMP_DIR",
    DEFAULT_TEMP_DIR);

  // TODO: In the future, we may want to enable downloading images or audio files.
  let download_script = easyenv::get_env_string_or_default(
    "DOWNLOAD_SCRIPT",
    "./scripts/download_gdrive.py");
  let google_drive_downloader = GoogleDriveDownloadCommand::new(&download_script);

  let temp_directory = PathBuf::from(temp_directory);

  check_directory_exists(&temp_directory)?;

  let db_connection_string =
    easyenv::get_env_string_or_default(
      "MYSQL_URL",
      "mysql://root:root@localhost/storyteller");

  info!("Connecting to database...");

  let mysql_pool = MySqlPoolOptions::new()
    .max_connections(5)
    .connect(&db_connection_string)
    .await?;

  let inference_script = "TODO".to_string();

  let persistent_cache_path = easyenv::get_env_string_or_default(
    ENV_SEMIPERSISTENT_CACHE_DIR,
    "/tmp");

  let semi_persistent_cache = SemiPersistentCacheDir::configured_root(&persistent_cache_path);

  info!("Creating pod semi-persistent cache dirs...");
  semi_persistent_cache.create_w2l_model_path()?;
  semi_persistent_cache.create_w2l_face_template_path()?;
  semi_persistent_cache.create_w2l_template_media_path()?;
  semi_persistent_cache.create_w2l_model_path()?;

  let w2l_model_filename = easyenv::get_env_string_or_default(
    "W2L_MODEL_FILENAME", "wav2lip_gan.pth");

  let inferencer = Inferencer {
    download_temp_directory: temp_directory,
    mysql_pool,
    public_bucket_client,
    private_bucket_client,
    inference_script,
    google_drive_downloader,
    //ffmpeg_image_preview_generator: FfmpegGeneratePreviewImageCommand {},
    //ffmpeg_video_preview_generator: FfmpegGeneratePreviewVideoCommand {},
    //imagemagick_image_preview_generator: ImagemagickGeneratePreviewImageCommand {},
    w2l_inference: w2l_inference_command,
    bucket_path_unifier: BucketPathUnifier::default_paths(),
    semi_persistent_cache,
    w2l_model_filename,
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

    let query_result = query_w2l_inference_job_records(
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

async fn process_job(inferencer: &Inferencer, job: &W2lInferenceJobRecord) -> AnyhowResult<()> {

  // TODO 1. Mark Processing
  //
  // TODO: 2. Check if w2l model is downloaded / download it to a stable cache location (DONE)
  // TODO: 3. Check if w2l template faces are downloaded and download it (done)
  // TODO: 4. Download user audio (done)

  // TODO: 5. Process Inference

  // TODO 6. Upload result
  // TODO 7. Save record
  // TODO 8. Mark job done

  // ==================== CONFIRM OR DOWNLOAD W2L MODEL ==================== //

  let model_filename = inferencer.w2l_model_filename.clone();
  let model_fs_path = inferencer.semi_persistent_cache.w2l_model_path(&model_filename);

  if !model_fs_path.exists() {
    info!("Model file does not exist: {:?}", &model_fs_path);

    let model_object_path = inferencer.bucket_path_unifier
      .w2l_pretrained_models_path(&model_filename);

    info!("Download from bucket path: {:?}", &model_object_path);

    inferencer.private_bucket_client.download_file_to_disk(
      &model_object_path,
      &model_fs_path
    ).await?;

    info!("Downloaded model from bucket!");
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

  inferencer.w2l_inference.execute(
    &audio_fs_path,
    &template_media_fs_path,
    &face_template_fs_path,
    &PathBuf::from("todo"),
    &PathBuf::from("todo"),
    false,
    false
  )?;

  let output_video_fs_path = temp_dir.path().join(&audio_bucket_hash);

  if true {
    info!("FAKE DONE");
    thread::sleep(Duration::from_millis(5000));
    return Ok(());
  }

  //let download_url = job.download_url.as_ref()
  //  .map(|c| c.to_string())
  //  .unwrap_or("".to_string());

  // ==================== DOWNLOAD FILE ==================== //

  info!("Calling downloader...");
  //let download_filename = inferencer.google_drive_downloader
  //  .download_file(&download_url, &temp_dir).await?;
  let download_filename = "TODO";

  // ==================== PROCESS FACES ==================== //

  // This is the Python Pickle file with all the face frames.
  // We'll retain it forever since it's expensive to compute.
  let cached_faces_filename = format!("{}_detected_faces.pickle", &download_filename);

  // This is a file that we'll use to determine if the file is an image or video.
  let output_metadata_filename = format!("{}_metadata.json", &download_filename);

  let is_image = false; // TODO: Don't always treat as video.
  let spawn_process = false;

  /*inferencer.w2l_processor.execute(
    &download_filename,
    &cached_faces_filename,
    &output_metadata_filename,
    is_image,
    spawn_process)?;*/

  // ==================== CHECK ALL FILES EXIST AND GET METADATA ==================== //

  let video_or_image_path = PathBuf::from(&download_filename);
  let cached_faces_path = &PathBuf::from(&cached_faces_filename);
  let output_metadata_path = &PathBuf::from(&output_metadata_filename);

  info!("Checking that both files exist (original source + cached faces) ...");

  check_file_exists(&video_or_image_path)?;
  check_file_exists(&cached_faces_path)?;
  check_file_exists(&output_metadata_path)?;

  let file_metadata = read_metadata_file(&output_metadata_filename)?;

  // ==================== BASE OBJECT NAMES BASED ON HASH ==================== //

  let private_bucket_hash = get_file_hash(&download_filename)?;

  info!("File hash: {}", private_bucket_hash);

  // Full path to video/image
  //let full_object_path = hash_to_bucket_path(
  //  &private_bucket_hash,
  //  Some(&inferencer.w2l_template_uploads_bucket_root))?;

  let full_object_path = "TODO";

  // ==================== GENERATE VIDEO PREVIEWS ==================== //

  let mut maybe_image_preview_filename : Option<PathBuf> = None;
  let mut maybe_image_preview_object_name : Option<String> = None;

  let mut maybe_video_preview_filename : Option<PathBuf> = None;
  let mut maybe_video_preview_object_name : Option<String> = None;

  /*if file_metadata.is_video {
    let preview_filename = format!("{}_preview.webp", &download_filename);

    inferencer.ffmpeg_video_preview_generator.execute(
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

    inferencer.imagemagick_image_preview_generator.execute(
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
  }*/

  // ==================== UPLOAD TO BUCKETS ==================== //

  info!("Image/video destination bucket path: {}", full_object_path);

  // Full path to cached faces
  let full_object_path_cached_faces = format!("{}_detected_faces.pickle", full_object_path);

  info!("Cached faces destination bucket path: {}", full_object_path_cached_faces);

  info!("Uploading image/video...");

  let original_mime_type = file_metadata.mimetype
    .as_deref()
    .unwrap_or("application/octet-stream");

  inferencer.private_bucket_client.upload_filename_with_content_type(
    &full_object_path,
    &video_or_image_path,
    original_mime_type).await?;

  inferencer.public_bucket_client.upload_filename_with_content_type(
    &full_object_path,
    &video_or_image_path,
    original_mime_type).await?;

  info!("Uploading cached faces...");
  inferencer.private_bucket_client.upload_filename(
    &full_object_path_cached_faces,
    &cached_faces_path).await?;

  // TODO: Fix this ugh.
  if let Some(image_preview_filename) = maybe_image_preview_filename.as_deref() {
    if let Some(image_preview_object_name) = maybe_image_preview_object_name.as_deref() {
      info!("Uploading image preview...");
      inferencer.private_bucket_client.upload_filename_with_content_type(
        &image_preview_object_name,
        image_preview_filename,
        "image/webp").await?;

      info!("Uploading image preview...");
      inferencer.public_bucket_client.upload_filename_with_content_type(
        &image_preview_object_name,
        image_preview_filename,
        "image/webp").await?;
    }
  }

  // TODO: Fix this ugh.
  if let Some(video_preview_filename) = maybe_video_preview_filename.as_deref() {
    if let Some(video_preview_object_name) = maybe_video_preview_object_name.as_deref() {
      info!("Uploading video preview...");
      inferencer.private_bucket_client.upload_filename_with_content_type(
        &video_preview_object_name,
        video_preview_filename,
        "image/webp").await?;

      info!("Uploading video preview...");
      inferencer.public_bucket_client.upload_filename_with_content_type(
        &video_preview_object_name,
        video_preview_filename,
        "image/webp").await?;
    }
  }

  // ==================== SAVE RECORDS ==================== //

  let template_type = if file_metadata.is_video { "video" } else { "image" };

  info!("Saving w2l inference record...");
  let id = insert_w2l_result(
    &inferencer.mysql_pool,
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

  info!("Job {} complete success! Downloaded, processed, and uploaded. Saved model record: {}",
        job.id, id);

  mark_w2l_inference_job_done(&inferencer.mysql_pool, job, true).await?;

  Ok(())
}
