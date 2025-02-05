use crate::job::job_types::studio_gen2::stable_animator::stable_animator_dependencies::StableAnimatorDependencies;
use crate::state::common::watermark_configs::WatermarkConfigs;
use crate::util::common_commands::ffmpeg::runner::ffmpeg_command_runner::FfmpegCommandRunner;
use errors::AnyhowResult;
use std::path::PathBuf;

pub struct StudioGen2Dependencies {
  /// Watermarks added to videos (or perhaps images in the future)
  pub watermarks: WatermarkConfigs,

  pub input_directory: PathBuf,
  pub output_directory: PathBuf,

  pub stable_animator: Option<StableAnimatorDependencies>,

  pub ffmpeg: FfmpegCommandRunner,
}

impl StudioGen2Dependencies {
  pub fn setup() -> AnyhowResult<Self> {

    let stable_animator =
        match easyenv::get_env_bool_optional("STABLE_ANIMATOR_ENABLED") {
          Ok(true) => Some(StableAnimatorDependencies::setup()?),
          _ => None,
        };

    Ok(Self {
      watermarks: WatermarkConfigs::from_env()?,

      // TODO: Configurability of input/output dirs
      input_directory: PathBuf::from("/tmp/input"),
      output_directory: PathBuf::from("/tmp/output"),

      stable_animator,

      ffmpeg: FfmpegCommandRunner::from_env()?,
    })
  }
}
