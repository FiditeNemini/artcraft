use std::fs::read_to_string;
use std::time::Instant;

use anyhow::anyhow;
use log::{error, info, warn};

use buckets::public::media_files::original_file::MediaFileBucketPath;
use container_common::filesystem::check_file_exists::check_file_exists;
use container_common::filesystem::safe_delete_temp_directory::safe_delete_temp_directory;
use container_common::filesystem::safe_delete_temp_file::safe_delete_temp_file;
use enums::by_table::generic_inference_jobs::inference_result_type::InferenceResultType;
use filesys::file_size::file_size;
use hashing::sha256::sha256_hash_file::sha256_hash_file;
use mimetypes::mimetype_for_file::get_mimetype_for_file;
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use mysql_queries::queries::media_files::insert_media_file_from_face_animation::{insert_media_file_from_face_animation, InsertArgs};
use tokens::users::user::UserToken;

use crate::job::job_loop::job_success_result::{JobSuccessResult, ResultEntity};
use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job::job_types::lipsync::sad_talker::download_audio_file::download_audio_file;
use crate::job::job_types::lipsync::sad_talker::download_image_file::download_image_file;
use crate::job::job_types::lipsync::sad_talker::sad_talker_inference_command::InferenceArgs;
use crate::job::job_types::lipsync::sad_talker::validate_job::validate_job;
use crate::job_dependencies::JobDependencies;
use crate::util::common_commands::ffmpeg_logo_watermark_command;

pub struct SadTalkerProcessJobArgs<'a> {
  pub job_dependencies: &'a JobDependencies,
  pub job: &'a AvailableInferenceJob,
}

pub async fn process_job(args: SadTalkerProcessJobArgs<'_>) -> Result<JobSuccessResult, ProcessSingleJobError> {
  let job = args.job;
  let deps = args.job_dependencies;

  let mut job_progress_reporter = args.job_dependencies
      .job_progress_reporter
      .new_generic_inference(job.inference_job_token.as_str())
      .map_err(|e| ProcessSingleJobError::Other(anyhow!(e)))?;

  // ==================== UNPACK + VALIDATE INFERENCE ARGS ==================== //

  let job_args = validate_job(job)?;

  // ==================== CONFIRM OR DOWNLOAD SAD TALKER MODELS (SEVERAL) ==================== //

  info!("Download models (if not present)...");

  let mut i : usize = 0;

  for downloader in deps.job_type_details.sad_talker.downloaders.all_downloaders() {

    // Temporary debugging
    info!("Downloader {}", i);
    i = i + 1;

    let result = downloader.download_if_not_on_filesystem(
      &args.job_dependencies.private_bucket_client,
      &args.job_dependencies.fs.scoped_temp_dir_creator_for_downloads,
    ).await;

    if let Err(e) = result {
      error!("could not download: {:?}", e);
      return Err(ProcessSingleJobError::from_anyhow_error(e))
    }
  }

  // ==================== TEMP DIR ==================== //

  let work_temp_dir = format!("temp_sad_talker_inference_{}", job.id.0);

  // NB: TempDir exists until it goes out of scope, at which point it should delete from filesystem.
  let work_temp_dir = args.job_dependencies
      .fs
      .scoped_temp_dir_creator_for_work
      .new_tempdir(&work_temp_dir)
      .map_err(|e| ProcessSingleJobError::from_io_error(e))?;


  // ==================== QUERY AND DOWNLOAD FILES ==================== //

  let audio_path = download_audio_file(
    &job_args.audio_source,
    &args.job_dependencies.public_bucket_client,
    &mut job_progress_reporter,
    job,
    &args.job_dependencies.fs.scoped_temp_dir_creator_for_work,
    &work_temp_dir,
    &deps.mysql_pool
  ).await?;

  info!("Audio file: {:?}", audio_path.filesystem_path);

  let image_path = download_image_file(
    &job_args.image_source,
    &args.job_dependencies.public_bucket_client,
    &mut job_progress_reporter,
    job,
    &args.job_dependencies.fs.scoped_temp_dir_creator_for_work,
    &work_temp_dir,
    &deps.mysql_pool
  ).await?;

  info!("Image file: {:?}", image_path.filesystem_path);

  // ==================== TRANSCODE MEDIA (IF NECESSARY) ==================== //

  // TODO

  // ==================== SETUP FOR INFERENCE ==================== //

  info!("Ready for SadTalker inference...");

  job_progress_reporter.log_status("running inference")
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  let output_video_fs_path = work_temp_dir.path().join("output.mp4");
  let output_video_fs_path_watermark = work_temp_dir.path().join("output_watermark.mp4");

  info!("Running SadTalker inference...");

  info!("Expected output video filename: {:?}", &output_video_fs_path);

  // TODO: Limit output length for premium.

  let maybe_args = job.maybe_inference_args
      .as_ref()
      .map(|args| args.args.as_ref())
      .flatten();

  // ==================== RUN INFERENCE SCRIPT ==================== //

  let workdir = work_temp_dir.path().to_path_buf();

  let stderr_output_file = work_temp_dir.path().join("stderr.txt");

  let inference_start_time = Instant::now();

  let command_exit_status = args.job_dependencies
      .job_type_details
      .sad_talker
      .inference_command
      .execute_inference(InferenceArgs {
        input_audio: &audio_path.filesystem_path,
        input_image: &image_path.filesystem_path,
        work_dir: &workdir,
        output_file: &output_video_fs_path,
        stderr_output_file: &stderr_output_file,
      });

  let inference_duration = Instant::now().duration_since(inference_start_time);

  info!("Inference took duration to complete: {:?}", &inference_duration);

  if !command_exit_status.is_success() {
    error!("Inference failed: {:?}", command_exit_status);

    let mut error = ProcessSingleJobError::Other(anyhow!("CommandExitStatus: {:?}", command_exit_status));

    if let Ok(contents) = read_to_string(&stderr_output_file) {
      if contents.contains("can not detect the landmark from source image") {
        warn!("Face not detected in source image");
        error = ProcessSingleJobError::FaceDetectionFailure;
      }
    }

    safe_delete_temp_file(&audio_path.filesystem_path);
    safe_delete_temp_file(&image_path.filesystem_path);
    safe_delete_temp_file(&output_video_fs_path);
    safe_delete_temp_file(&stderr_output_file);
    safe_delete_temp_directory(&work_temp_dir);

    return Err(error);
  }

  // ==================== CHECK NON-WATERMARKED RESULT ==================== //

  info!("Checking that output file exists: {:?} ...", output_video_fs_path);

  check_file_exists(&output_video_fs_path).map_err(|e| ProcessSingleJobError::Other(e))?;

  // ==================== WATERMARK ==================== //

  info!("Adding watermark...");

  let command_exit_status = args.job_dependencies
      .job_type_details
      .sad_talker
      .ffmpeg_watermark_command
      .execute_inference(ffmpeg_logo_watermark_command::InferenceArgs {
        video_path: &output_video_fs_path,
        maybe_override_logo_path: None,
        alpha: 0.6,
        output_path: &output_video_fs_path_watermark,
      });

  if !command_exit_status.is_success() {
    error!("Watermark failed: {:?}", command_exit_status);
    safe_delete_temp_file(&audio_path.filesystem_path);
    safe_delete_temp_file(&image_path.filesystem_path);
    safe_delete_temp_file(&output_video_fs_path);
    safe_delete_temp_file(&output_video_fs_path_watermark);
    safe_delete_temp_directory(&work_temp_dir);
    return Err(ProcessSingleJobError::Other(anyhow!("CommandExitStatus: {:?}", command_exit_status)));
  }

  // ==================== CHECK ALL FILES EXIST AND GET METADATA ==================== //

  info!("Checking that output watermark file exists: {:?} ...", output_video_fs_path_watermark);
  check_file_exists(&output_video_fs_path_watermark).map_err(|e| ProcessSingleJobError::Other(e))?;

  info!("Interrogating result file size ...");

  let file_size_bytes = file_size(&output_video_fs_path_watermark)
      .map_err(|err| ProcessSingleJobError::Other(err))?;

  info!("Interrogating result mimetype ...");

  let mimetype = get_mimetype_for_file(&output_video_fs_path_watermark)
      .map_err(|err| ProcessSingleJobError::from_io_error(err))?
      .map(|mime| mime.to_string())
      .ok_or(ProcessSingleJobError::Other(anyhow!("Mimetype could not be determined")))?;

  info!("Calculating sha256...");

  let file_checksum = sha256_hash_file(&output_video_fs_path_watermark)
      .map_err(|err| {
        ProcessSingleJobError::Other(anyhow!("Error hashing file: {:?}", err))
      })?;

  // ==================== UPLOAD AUDIO TO BUCKET ==================== //

  job_progress_reporter.log_status("uploading result")
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  let result_bucket_location = MediaFileBucketPath::generate_new();

  let result_bucket_object_pathbuf = result_bucket_location.to_full_object_pathbuf();

  info!("Audio destination bucket path: {:?}", &result_bucket_object_pathbuf);

  info!("Uploading media ...");

  args.job_dependencies.public_bucket_client.upload_filename_with_content_type(
    &result_bucket_object_pathbuf,
    &output_video_fs_path_watermark,
    &mimetype) // TODO: We should check the mimetype to make sure bad payloads can't get uploaded
      .await
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  // ==================== DELETE TEMP FILES ==================== //

  safe_delete_temp_file(&output_video_fs_path);
  safe_delete_temp_file(&output_video_fs_path_watermark);

  // NB: We should be using a tempdir, but to make absolutely certain we don't overflow the disk...
  safe_delete_temp_directory(&work_temp_dir);

  // ==================== SAVE RECORDS ==================== //

  info!("Saving SadTalker result (media_files table record) ...");

  let (media_file_token, id) = insert_media_file_from_face_animation(InsertArgs {
    pool: &args.job_dependencies.mysql_pool,
    job: &job,
    maybe_mime_type: Some(&mimetype),
    file_size_bytes,
    sha256_checksum: &file_checksum,
    public_bucket_directory_hash: result_bucket_location.get_object_hash(),
    is_on_prem: args.job_dependencies.container.is_on_prem,
    worker_hostname: &args.job_dependencies.container.hostname,
    worker_cluster: &args.job_dependencies.container.cluster_name,
  })
      .await
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  info!("SadTalker Done.");

  // TODO: Update upstream to be strongly typed
  let maybe_user_token = job.maybe_creator_user_token.as_deref()
      .map(|token| UserToken::new_from_str(token));

  args.job_dependencies.firehose_publisher.lipsync_animation_finished(
    maybe_user_token.as_ref(),
    &job.inference_job_token,
    media_file_token.as_str())
      .await
      .map_err(|e| {
        error!("error publishing event: {:?}", e);
        ProcessSingleJobError::Other(anyhow!("error publishing event"))
      })?;

  job_progress_reporter.log_status("done")
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  info!("Job {:?} complete success! Downloaded, ran inference, and uploaded. Saved model record: {}, Result Token: {}",
        job.id, id, &media_file_token);

  Ok(JobSuccessResult {
    maybe_result_entity: Some(ResultEntity {
      entity_type: InferenceResultType::MediaFile,
      entity_token: media_file_token.to_string(),
    }),
    inference_duration,
  })
}
