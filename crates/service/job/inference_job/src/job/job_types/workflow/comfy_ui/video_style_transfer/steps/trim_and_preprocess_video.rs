use std::path::Path;
use std::process::{Command, Stdio};

use anyhow::anyhow;
use log::{error, info};
use sqlx::MySqlPool;

use cloud_storage::remote_file_manager::remote_cloud_file_manager::RemoteCloudFileClient;
use filesys::path_to_string::path_to_string;
use mysql_queries::payloads::generic_inference_args::workflow_payload::WorkflowArgs;
use tokens::tokens::media_files::MediaFileToken;
use videos::ffprobe_get_dimensions::ffprobe_get_dimensions;

use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job::job_types::workflow::comfy_ui::comfy_ui_dependencies::ComfyDependencies;
use crate::job::job_types::workflow::comfy_ui::video_style_transfer::video_paths::VideoPaths;

pub struct TrimAndProcessVideoArgs<'a> {
  pub comfy_args: &'a WorkflowArgs,
  pub comfy_deps: &'a ComfyDependencies,
  pub videos: &'a VideoPaths,
}

pub fn trim_and_preprocess_video(
  args: TrimAndProcessVideoArgs<'_>
) -> Result<(), ProcessSingleJobError> {
  let target_fps = args.comfy_args.target_fps.unwrap_or(24);

  let trim_start_millis = args.comfy_args.trim_start_milliseconds
      .or_else(|| args.comfy_args.trim_start_seconds.map(|s| s as u64 * 1_000))
      .unwrap_or(0);

  let trim_end_millis = args.comfy_args.trim_end_milliseconds
      .or_else(|| args.comfy_args.trim_end_seconds.map(|s| s as u64 * 1_000))
      .unwrap_or(3_000);

  info!("trim start millis: {trim_start_millis}");
  info!("trim end millis: {trim_end_millis}");
  info!("target FPS: {target_fps}");

  let skip_process_video = args.comfy_args.skip_process_video.unwrap_or(false);

  if skip_process_video {
    info!("Skipping video trim / resample...");
    info!("(This might break if we need to copy the video path. Salt's code implicitly expects videos to be in certain places, but doesn't allow passing of config, and that's horrible.)");

    std::fs::copy(&args.videos.original_video_path, &args.videos.trimmed_resampled_video_path)
        .map_err(|err| {
          error!("Error copying video (1): {:?}", err);
          ProcessSingleJobError::IoError(err)
        })?;

    std::fs::copy(&args.videos.original_video_path, &args.videos.comfy_output_video_path)
        .map_err(|err| {
          error!("Error copying video (2): {:?}", err);
          ProcessSingleJobError::IoError(err)
        })?;

  } else {
    info!("Calling video trim / resample...");
    info!("Script: {:?}", &args.comfy_deps.inference_command.processing_script);

    // shell out to python script
    let output = Command::new("python3")
        .stdout(Stdio::inherit()) // NB: This should emit to the rust job's stdout
        .stderr(Stdio::inherit()) // NB: This should emit to the rust job's stderr
        .arg(path_to_string(&args.comfy_deps.inference_command.processing_script))
        .arg(path_to_string(&args.videos.original_video_path))
        .arg(format!("{:?}", trim_start_millis))
        .arg(format!("{:?}", trim_end_millis))
        .arg(format!("{:?}", target_fps))
        .output()
        .map_err(|e| {
          error!("Error running inference: {:?}", e);
          ProcessSingleJobError::Other(e.into())
        })?;

    // check if the command was successful
    if !output.status.success() {
      // print stdout and stderr
      error!("Video processing failed: {:?}", output.status);
      error!("stdout: {}", String::from_utf8_lossy(&output.stdout));
      error!("stderr: {}", String::from_utf8_lossy(&output.stderr));
      return Err(ProcessSingleJobError::Other(anyhow!("Command failed: {:?}", output.status)));
    }

    info!("Finished video trim / resample.");

    // NB: The process video script implicitly saves the above video as "input.mp4"
    // Comfy sometimes overwrites this, so we need to make a copy.
    std::fs::copy(&args.videos.comfy_input_video_path, &args.videos.trimmed_resampled_video_path)
        .map_err(|err| {
          error!("Error copying trimmed video: {:?}", err);
          ProcessSingleJobError::IoError(err)
        })?;
  }

  args.videos.debug_print_paths_after_trim();

  if let Ok(Some(dimensions)) = ffprobe_get_dimensions(&args.videos.trimmed_resampled_video_path) {
    info!("Trimmed / resampled video dimensions: {}x{}", dimensions.width, dimensions.height);
  }

  Ok(())
}

