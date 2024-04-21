use std::path::PathBuf;

// TODO(bt,2024-04-21): This doesn't need to be a state machine. We can generate the paths we need upfront.
pub struct JobOutputsStageOne {
  /// Filesystem path of the downloaded original video
  pub original_video_path: PathBuf,
}

pub struct JobOutputsStageTwo {
  /// Filesystem path of the downloaded original video
  pub original_video_path: PathBuf,

  /// Filesystem path of the trimmed and resampled video
  /// We'll use this downstream once it's available.
  pub trimmed_resampled_video_path: PathBuf,
}

pub struct JobOutputsStageThree {
  /// Filesystem path of the downloaded original video
  pub original_video_path: PathBuf,

  /// Filesystem path of the trimmed and resampled video
  /// We'll use this downstream once it's available.
  pub trimmed_resampled_video_path: PathBuf,

  /// Filesystem path of the style transfer output
  pub comfy_output_video_path: PathBuf,

  /// Filesystem path of the audio-restored output
  /// We'll want to upload this as a result, if available.
  pub audio_restored_video_path: Option<PathBuf>,

  /// Watermarked final result
  /// We'll want to upload this as a result, if available.
  pub watermarked_video_path: Option<PathBuf>,
}

impl JobOutputsStageOne {
  pub fn new(original_video_path: PathBuf) -> Self {
    Self {
      original_video_path,
    }
  }

  pub fn with_trimmed_resampled_video(self, trimmed_resampled_video_path: PathBuf) -> JobOutputsStageTwo {
    JobOutputsStageTwo {
      original_video_path: self.original_video_path,
      trimmed_resampled_video_path,
    }
  }
}

impl JobOutputsStageTwo {
  pub fn add_comfy_output(self, comfy_output_video_path: PathBuf) -> JobOutputsStageThree {
    JobOutputsStageThree {
      original_video_path: self.original_video_path,
      trimmed_resampled_video_path: self.trimmed_resampled_video_path,
      comfy_output_video_path,
      audio_restored_video_path: None,
      watermarked_video_path: None,
    }
  }
}


impl JobOutputsStageThree {
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

