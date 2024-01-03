use anyhow::{Ok};
use errors::AnyhowResult;

use crate::job::job_types::image_generation::sd::model_downloaders::SDDownloaders;
use crate::job::job_types::image_generation::sd::sd_inference_command::StableDiffusionInferenceCommand;

pub struct StableDiffusionDependencies {
  pub downloaders: SDDownloaders,
  pub inference_command: StableDiffusionInferenceCommand,
}

impl StableDiffusionDependencies {
  pub fn setup() -> AnyhowResult<Self> {
    Ok(Self {
      downloaders: SDDownloaders::build_all_from_env(),
      inference_command: StableDiffusionInferenceCommand::from_env()?,
    })
  }
}
