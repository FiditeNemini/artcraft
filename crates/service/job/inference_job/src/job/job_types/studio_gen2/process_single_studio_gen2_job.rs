use crate::job::job_loop::job_success_result::{JobSuccessResult, ResultEntity};
use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job::job_types::studio_gen2::download_file_for_studio::{download_file_for_studio, DownloadFileForStudioArgs};
use crate::job::job_types::studio_gen2::studio_gen2_dirs::StudioGen2Dirs;
use crate::job::job_types::workflow::face_fusion::process_face_fusion_job::process_face_fusion_job;
use crate::job::job_types::workflow::live_portrait::process_live_portrait_job::process_live_portrait_job;
use crate::job::job_types::workflow::video_style_transfer::process_video_style_transfer_job::process_video_style_transfer_job;
use crate::job::job_types::workflow::video_style_transfer::steps::check_and_validate_job::check_and_validate_job;
use crate::job::job_types::workflow::video_style_transfer::steps::download_global_ipa_image::{download_global_ipa_image, DownloadGlobalIpaImageArgs};
use crate::job::job_types::workflow::video_style_transfer::steps::download_input_videos::{download_input_videos, DownloadInputVideoArgs};
use crate::job::job_types::workflow::video_style_transfer::steps::post_process_add_watermark::{post_process_add_watermark, PostProcessAddWatermarkArgs};
use crate::job::job_types::workflow::video_style_transfer::steps::post_process_restore_audio::{post_process_restore_audio, PostProcessRestoreVideoArgs};
use crate::job::job_types::workflow::video_style_transfer::steps::preprocess_save_audio::{preprocess_save_audio, ProcessSaveAudioArgs};
use crate::job::job_types::workflow::video_style_transfer::steps::preprocess_trim_and_resample_videos::{preprocess_trim_and_resample_videos, ProcessTrimAndResampleVideoArgs};
use crate::job::job_types::workflow::video_style_transfer::util::comfy_dirs::ComfyDirs;
use crate::job::job_types::workflow::video_style_transfer::util::process_preview_updates::PreviewProcessor;
use crate::job::job_types::workflow::video_style_transfer::util::video_pathing::{PrimaryInputVideoAndPaths, SecondaryInputVideoAndPaths, VideoPathing};
use crate::job::job_types::workflow::video_style_transfer::util::write_workflow_prompt::{write_workflow_prompt, WorkflowPromptArgs};
use crate::state::job_dependencies::JobDependencies;
use anyhow::anyhow;
use bucket_paths::legacy::remote_file_manager_paths::remote_cloud_bucket_details::RemoteCloudBucketDetails;
use bucket_paths::legacy::typified_paths::public::media_files::bucket_directory::MediaFileBucketDirectory;
use cloud_storage::remote_file_manager::remote_cloud_file_manager::RemoteCloudFileClient;
use enums::by_table::generic_inference_jobs::inference_job_type::InferenceJobType;
use enums::by_table::generic_inference_jobs::inference_result_type::InferenceResultType;
use filesys::check_file_exists::check_file_exists;
use filesys::file_deletion::safe_delete_possible_files_and_directories::safe_delete_possible_files_and_directories;
use filesys::file_deletion::safe_recursively_delete_files::safe_recursively_delete_files;
use filesys::path_to_string::path_to_string;
use log::{error, info, warn};
use mysql_queries::payloads::generic_inference_args::generic_inference_args::PolymorphicInferenceArgs::{Cu, S2};
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use mysql_queries::queries::model_weights::get::get_weight::get_weight_by_token_with_transactor;
use mysql_queries::utils::transactor::Transactor;
use std::fs::read_to_string;
use std::io::stdout;
use std::path::{Path, PathBuf};
use std::thread;
use std::time::{Duration, Instant};
use tokens::tokens::media_files::MediaFileToken;
use tokio::sync::oneshot;
use tokio::sync::oneshot::channel;
use filesys::create_dir_all_if_missing::create_dir_all_if_missing;
use videos::ffprobe_get_dimensions::ffprobe_get_dimensions;
use crate::job::job_types::studio_gen2::stable_animator_command::InferenceArgs;
use crate::job::job_types::studio_gen2::validate_and_save_results::{validate_and_save_results, SaveResultsArgs};
// TODO(bt,2025-01-16): This is a stub for Studio Gen2
// TODO(bt,2025-01-16): This is a stub for Studio Gen2
// TODO(bt,2025-01-16): This is a stub for Studio Gen2
// TODO(bt,2025-01-16): This is a stub for Studio Gen2

pub async fn process_single_studio_gen2_job(
  deps: &JobDependencies,
  job: &AvailableInferenceJob
) -> Result<JobSuccessResult, ProcessSingleJobError> {

  // TODO(bt,2025-01-16): This is a stub for Studio Gen2
  // TODO(bt,2025-01-16): This is a stub for Studio Gen2
  // TODO(bt,2025-01-16): This is a stub for Studio Gen2
  // TODO(bt,2025-01-16): This is a stub for Studio Gen2

  let mut job_progress_reporter = deps
      .clients
      .job_progress_reporter
      .new_generic_inference(job.inference_job_token.as_str())
      .map_err(|e| ProcessSingleJobError::Other(anyhow!(e)))?;

  let gen2_deps = deps
      .job
      .job_specific_dependencies
      .maybe_studio_gen2_dependencies
      .as_ref()
      .ok_or_else(|| ProcessSingleJobError::JobSystemMisconfiguration(Some("Missing Studio Gen2 dependencies".to_string())))?;

//  // ==================== UNPACK + VALIDATE INFERENCE ARGS ==================== //
//
//  let job_args = check_and_validate_job(job)?;

  // ===================== DOWNLOAD REQUIRED MODELS IF NOT EXIST ===================== //

  //// TODO: Replace all other paths with this
  let work_paths = StudioGen2Dirs::new(&gen2_deps)?;

  info!("Input path: {:?}", &work_paths.input_dir.path());
  info!("Output path: {:?}", &work_paths.output_dir.path());

  let remote_cloud_file_client = RemoteCloudFileClient::get_remote_cloud_file_client().await;
  let remote_cloud_file_client = match remote_cloud_file_client {
    Ok(res) => {
      res
    }
    Err(_) => {
      return Err(ProcessSingleJobError::from(anyhow!("failed to get remote cloud file client")));
    }
  };

//  info!("Grabbing redis connection from pool");
//
//  let redis_pool_dep = deps
//      .db
//      .maybe_keepalive_redis_pool.clone();
//
//  let redis_pool = redis_pool_dep
//      .ok_or_else(|| ProcessSingleJobError::Other(anyhow!("failed to get redis pool")))?;

  info!("Grabbing mysql connection from pool");

  let mut mysql_connection = deps.db.mysql_pool.acquire()
      .await
      .map_err(|e| {
        warn!("Could not acquire DB pool: {:?}", e);
        ProcessSingleJobError::Other(anyhow!("Could not acquire DB pool: {:?}", e))
      })?;

  let maybe_args = job.maybe_inference_args
      .as_ref()
      .map(|args| args.args.as_ref())
      .flatten();

  let poly_args = match maybe_args {
    None => return Err(ProcessSingleJobError::Other(anyhow!("Job args not found"))),
    Some(args) => args,
  };

  let studio_args = match poly_args {
    S2(args) => args,
    _ => return Err(ProcessSingleJobError::Other(anyhow!("Studio Gen2 args not found"))),
  };

  info!("Studio args: {:?}", studio_args);


  // ==================== DOWNLOAD IMAGE ==================== //

  let image_file;

  match studio_args.image_file.as_ref() {
    None => return Err(ProcessSingleJobError::Other(anyhow!("image_file not set"))),
    Some(media_token) => {
      image_file = download_file_for_studio(DownloadFileForStudioArgs {
        media_token,
        input_paths: &work_paths,
        remote_cloud_file_client: &remote_cloud_file_client,
        filename_without_extension: "input_image",
      }, Transactor::for_connection(&mut mysql_connection)).await?;

      info!("Downloaded image to {:?}", &image_file.file_path);
    }
  }

  // ==================== DOWNLOAD VIDEO ==================== //

  let video_file;

  match studio_args.video_file.as_ref() {
    None => return Err(ProcessSingleJobError::Other(anyhow!("video_file not set"))),
    Some(media_token) => {
      video_file = download_file_for_studio(DownloadFileForStudioArgs {
        media_token,
        input_paths: &work_paths,
        remote_cloud_file_client: &remote_cloud_file_client,
        filename_without_extension: "input_video",
      }, Transactor::for_connection(&mut mysql_connection)).await?;

      info!("Downloaded video to {:?}", &video_file.file_path);
    }
  }

  //if let Ok(Some(dimensions)) = ffprobe_get_dimensions(&videos.primary_video.original_download_path) {
  //  info!("Download video dimensions: {}x{}", dimensions.width, dimensions.height);
  //}

  //// ========================= TRIM AND PREPROCESS VIDEO ======================== //

  //let expected_frame_count = preprocess_trim_and_resample_videos(ProcessTrimAndResampleVideoArgs {
  //  comfy_args: studio_args,
  //  comfy_deps: gen2_deps,
  //  comfy_dirs: &work_paths,
  //  videos: &mut videos,
  //})?;

  // ==================== RUN INFERENCE ==================== //

  info!("Preparing for studio inference...");

  job_progress_reporter.log_status("running inference")
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  let stderr_output_file = work_paths.output_dir.path().join("stderr.txt");
  let stdout_output_file = work_paths.output_dir.path().join("stdout.txt");

  let pose_frames_dir = work_paths.output_dir.path().join("pose_frames");
  create_dir_all_if_missing(&pose_frames_dir)?;

  let video_output_path = work_paths.output_dir.path().join("output_video.mp4");

  let video_frames_output_dir = work_paths.output_dir.path().join("final_frames");
  create_dir_all_if_missing(&video_frames_output_dir)?;

  info!("Running Studio Gen2 inference...");

  let inference_start_time = Instant::now();

  let command_exit_status = gen2_deps
      .command
      .execute_inference(
        InferenceArgs {
          stderr_output_file: &stderr_output_file,
          stdout_output_file: &stdout_output_file,
          start_image_path: &image_file.file_path,
          pre_pose_video_path: Some(video_file.file_path.as_ref()),
          pose_images_dir: &pose_frames_dir,
          frame_output_dir: &video_frames_output_dir,
          video_output_path: &video_output_path,
          pretrained_model_name_or_path: &gen2_deps.pretrained_model_name_or_path,
          posenet_model_name_or_path: &gen2_deps.posenet_model_name_or_path,
          face_encoder_model_name_or_path: &gen2_deps.face_encoder_model_name_or_path,
          unet_model_name_or_path: &gen2_deps.unet_model_name_or_path,
          output_width: studio_args.output_width,
          output_height: studio_args.output_height,
        }).await;

  let inference_duration = Instant::now().duration_since(inference_start_time);

  info!("Inference command exited with status: {:?}", command_exit_status);
  info!("Inference took duration to complete: {:?}", &inference_duration);

  // check stdout for success and check if file exists
  if let Ok(contents) = read_to_string(&stdout_output_file) {
    info!("Captured stdout output: {}", contents);
  }

  if let Ok(contents) = read_to_string(&stderr_output_file) {
    info!("Captured stderr output: {}", contents);
  }

  //if let Ok(Some(dimensions)) = ffprobe_get_dimensions(&videos.primary_video.comfy_output_video_path) {
  //  info!("Comfy output video dimensions: {}x{}", dimensions.width, dimensions.height);
  //}

  // ==================== CHECK OUTPUT FILE ======================== //

  if let Err(err) = check_file_exists(&video_output_path) {
    error!("Output file does not  exist: {:?}", err);

    error!("Inference failed: {:?}", command_exit_status);

    if let Ok(contents) = read_to_string(&stderr_output_file) {
      warn!("Captured stderr output: {}", contents);
    }

    // NB: Forcing generic type to `&Path` with turbofish
    safe_delete_possible_files_and_directories::<&Path>(&[
      Some(work_paths.input_dir.path()),
      Some(work_paths.output_dir.path()),
    ]);

    return Err(ProcessSingleJobError::Other(anyhow!("Output file did not exist: {:?}",
            &video_output_path)));
  }

  //// ==================== COPY BACK AUDIO ==================== //

  //post_process_restore_audio(PostProcessRestoreVideoArgs {
  //  comfy_deps: gen2_deps,
  //  videos: &mut videos,
  //});

  //// ==================== OPTIONAL WATERMARK ==================== //

  //post_process_add_watermark(PostProcessAddWatermarkArgs {
  //  comfy_deps: gen2_deps,
  //  videos: &mut videos,
  //});

  // ==================== DEBUG ======================== //

  if let Ok(Some(dimensions)) = ffprobe_get_dimensions(&video_output_path) {
    info!("Final video upload dimensions: {}x{}", dimensions.width, dimensions.height);
  }

  // ==================== VALIDATE AND SAVE RESULTS ======================== //

  let result = validate_and_save_results(SaveResultsArgs {
    job,
    deps: &deps,
    gen2_deps,
    studio_args,
    output_video_path: &video_output_path,
    job_progress_reporter: &mut job_progress_reporter,
    inference_duration,
  }).await;

  let media_file_token = match result {
    Ok(token) => token,
    Err(err) => {
      error!("Error validating and saving results: {:?}", err);

      // NB: Forcing generic type to `&Path` with turbofish
      safe_delete_possible_files_and_directories::<&Path>(&[
        Some(work_paths.input_dir.path()),
        Some(work_paths.output_dir.path()),
      ]);

      return Err(err);
    }
  };

  // ==================== (OPTIONAL) DEBUG SLEEP ==================== //

  if let Some(sleep_millis) = studio_args.after_job_debug_sleep_millis {
    info!("Sleeping for millis: {sleep_millis}");
    tokio::time::sleep(Duration::from_millis(sleep_millis)).await;
  }

  // ==================== CLEANUP/ DELETE TEMP FILES ==================== //

  info!("Cleaning up temporary files...");

  // NB: Forcing generic type to `&Path` with turbofish
  safe_delete_possible_files_and_directories::<&Path>(&[
    Some(work_paths.input_dir.path()),
    Some(work_paths.output_dir.path()),
  ]);

  // ==================== DONE ==================== //

  info!("Studio Gen2 Done.");

  job_progress_reporter.log_status("done")
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  info!("Result video media token: {:?}", &media_file_token);

  info!("Job {:?} complete success!", job.id);

  Ok(JobSuccessResult {
    maybe_result_entity: Some(ResultEntity {
      entity_type: InferenceResultType::MediaFile,
      entity_token: media_file_token.to_string(),
    }),
    inference_duration,
  })
}
