use std::path::PathBuf;
use errors::AnyhowResult;
use crate::state::common::watermark_configs::WatermarkConfigs;

pub struct StudioGen2Dependencies {
  /// Watermarks added to videos (or perhaps images in the future)
  pub watermarks: WatermarkConfigs,

  pub model_path: PathBuf,
  pub input_directory: PathBuf,
  pub output_directory: PathBuf,
}

impl StudioGen2Dependencies {
  pub fn setup() -> AnyhowResult<Self> {
    Ok(Self {
      watermarks: WatermarkConfigs::from_env()?,
      model_path: PathBuf::from("/tmp/model.pt"),
      input_directory: PathBuf::from("/tmp/input"),
      output_directory: PathBuf::from("/tmp/output"),
    })
  }
}
