use std::path::{Path, PathBuf};

pub struct JobOutputs {
  /// Filesystem path of the downloaded original video
  /// This is the input.
  pub original_video_path: PathBuf,

  /// Filesystem path of the trimmed and resampled video
  /// This is the first output we generate.
  /// We'll use this downstream once it's available.
  pub trimmed_resampled_video_path: PathBuf,

  /// This is the input into Comfy.
  /// This is typically the `trimmed_resampled_video_path`, but since Comfy
  /// can overwrite the source, we'll keep a separate copy of that file for
  /// later downstream sound restoration (since comfy wipes sound).
  pub comfy_input_video_path: PathBuf,

  /// Filesystem path of the style transfer output
  /// This is the main purpose of the job, and the second output we generate.
  pub comfy_output_video_path: PathBuf,

  /// Filesystem path of the audio-restored output
  /// This is the third output we generate.
  /// We'll want to upload this as a result, if available.
  pub audio_restored_video_path: Option<PathBuf>,

  /// Watermarked final result
  /// This is the fourth output we generate.
  /// We'll want to upload this as a result, if available.
  pub watermarked_video_path: Option<PathBuf>,
}


impl JobOutputs {
  pub fn new(root_comfy_path: &Path, job_output_path: &str) -> Self {
    // TODO(bt,2024-04-21): The pathing for this job is complicated. ComfyUI
    //  was set up with some of these expectations, which is bad. Worse, the
    //  jobs enqueue the expected output path -- no idea why that was done.
    //  This should all be fixed.
    let input_dir = root_comfy_path.join("input");
    let output_dir = root_comfy_path.join("output");

    let original_video_path = input_dir.join("video.mp4");
    let trimmed_resampled_video_path = input_dir.join("trimmed.mp4");
    let comfy_input_video_path = input_dir.join("input.mp4");
    let comfy_output_video_path = output_dir.join(job_output_path); // TODO: This sucks.

    Self {
      original_video_path,
      trimmed_resampled_video_path,
      comfy_input_video_path,
      comfy_output_video_path,
      audio_restored_video_path: None,
      watermarked_video_path: None,
    }
  }

  pub fn video_to_watermark(&self) -> &PathBuf {
    // Try to use the audio-restored video if it's available
    self.audio_restored_video_path.as_ref()
        .unwrap_or(&self.comfy_output_video_path)
  }

  pub fn get_final_video_to_upload(&self) -> &PathBuf {
    // This is the video to upload as the result and save in the media_files table.
    self.watermarked_video_path.as_ref()
        .or(self.audio_restored_video_path.as_ref())
        .unwrap_or(&self.comfy_output_video_path)
  }

  pub fn get_non_watermarked_video_to_upload(&self) -> &PathBuf {
    // We'll upload this for internal use and for premium users.
    // Same as "video_to_watermark()"
    self.audio_restored_video_path.as_ref()
        .unwrap_or(&self.comfy_output_video_path)
  }
}
