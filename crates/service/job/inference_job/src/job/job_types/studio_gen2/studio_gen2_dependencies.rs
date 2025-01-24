use crate::job::job_types::studio_gen2::stable_animator_command::StableAnimatorCommand;
use crate::state::common::watermark_configs::WatermarkConfigs;
use errors::AnyhowResult;
use std::path::{Path, PathBuf};

pub struct StudioGen2Dependencies {
  /// Watermarks added to videos (or perhaps images in the future)
  pub watermarks: WatermarkConfigs,

  pub model_path: PathBuf,
  pub input_directory: PathBuf,
  pub output_directory: PathBuf,

  pub command: StableAnimatorCommand,

  pub pretrained_model_name_or_path: PathBuf,
  pub posenet_model_name_or_path: PathBuf,
  pub face_encoder_model_name_or_path: PathBuf,
  pub unet_model_name_or_path: PathBuf,
}

impl StudioGen2Dependencies {
  pub fn setup() -> AnyhowResult<Self> {
    Ok(Self {
      watermarks: WatermarkConfigs::from_env()?,

      // TODO
      model_path: PathBuf::from("/tmp/model.pt"),
      input_directory: PathBuf::from("/tmp/input"),
      output_directory: PathBuf::from("/tmp/output"),
      command: StableAnimatorCommand::new_from_env()?,

      // TODO
      pretrained_model_name_or_path: Default::default(),
      posenet_model_name_or_path: Default::default(),
      face_encoder_model_name_or_path: Default::default(),
      unet_model_name_or_path: Default::default(),
    })
  }
}
