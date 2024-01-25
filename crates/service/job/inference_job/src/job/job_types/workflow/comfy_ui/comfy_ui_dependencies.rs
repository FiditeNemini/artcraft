use errors::AnyhowResult;

use crate::job::job_types::workflow::comfy_ui::comfy_ui_inference_command::ComfyInferenceCommand;

pub struct ComfyDependencies {
    pub inference_command: ComfyInferenceCommand,
}

impl ComfyDependencies {
    pub fn setup() -> AnyhowResult<Self> {
        Ok(Self {
            inference_command: ComfyInferenceCommand::from_env()?,
        })
    }
}
