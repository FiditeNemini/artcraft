use anyhow::{Ok};
use errors::AnyhowResult;

use crate::job::job_types::image_generation::sd::model_downloaders::StableDiffusionDownloaders;
use crate::job::job_types::image_generation::sd::sd_inference_command::StableDiffusionInferenceCommand;

pub struct StableDiffusionDependencies {
  pub downloaders: StableDiffusionDownloaders,
  pub inference_command: StableDiffusionInferenceCommand,
  pub vae_bucket_path: String,
}

impl StableDiffusionDependencies {
  pub fn setup() -> AnyhowResult<Self> {
    Ok(Self {
      downloaders: StableDiffusionDownloaders::build_all_from_env(),
      inference_command: StableDiffusionInferenceCommand::from_env()?,
      vae_bucket_path: easyenv::get_env_string_required("SD_VAE_BUCKET_PATH")?,
    })
  }
}
