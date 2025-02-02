use crate::job::job_types::studio_gen2::stable_animator_command::StableAnimatorCommand;
use crate::state::common::watermark_configs::WatermarkConfigs;
use errors::AnyhowResult;
use std::path::{Path, PathBuf};
use crate::util::common_commands::ffmpeg::runner::ffmpeg_command_runner::FfmpegCommandRunner;

pub struct StudioGen2Dependencies {
  /// Watermarks added to videos (or perhaps images in the future)
  pub watermarks: WatermarkConfigs,

  pub input_directory: PathBuf,
  pub output_directory: PathBuf,

  pub command: StableAnimatorCommand,

  pub pretrained_model_name_or_path: PathBuf,
  pub posenet_model_name_or_path: PathBuf,
  pub face_encoder_model_name_or_path: PathBuf,
  pub unet_model_name_or_path: PathBuf,

  pub ffmpeg: FfmpegCommandRunner,
}

impl StudioGen2Dependencies {
  pub fn setup() -> AnyhowResult<Self> {
    Ok(Self {
      watermarks: WatermarkConfigs::from_env()?,

      // TODO
      input_directory: PathBuf::from("/tmp/input"),
      output_directory: PathBuf::from("/tmp/output"),
      command: StableAnimatorCommand::new_from_env()?,

      pretrained_model_name_or_path: easyenv::get_env_pathbuf_required("STABLE_ANIMATOR_PRETRAINED_MODEL_PATH")?,
      posenet_model_name_or_path: easyenv::get_env_pathbuf_required("STABLE_ANIMATOR_POSENET_MODEL_PATH")?,
      face_encoder_model_name_or_path: easyenv::get_env_pathbuf_required("STABLE_ANIMATOR_FACE_ENCODER_MODEL_PATH")?,
      unet_model_name_or_path: easyenv::get_env_pathbuf_required("STABLE_ANIMATOR_UNET_MODEL_PATH")?,

      ffmpeg: FfmpegCommandRunner::from_env()?,
    })
  }
}
