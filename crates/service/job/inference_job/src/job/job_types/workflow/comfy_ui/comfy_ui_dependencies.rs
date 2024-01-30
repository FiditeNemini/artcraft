use std::path::PathBuf;
use errors::AnyhowResult;

use crate::job::job_types::workflow::comfy_ui::comfy_ui_inference_command::ComfyInferenceCommand;

pub struct ComfyDependencies {
    pub inference_command: ComfyInferenceCommand,
    pub dependency_tokens: RequiredModels,
}

impl ComfyDependencies {
    pub fn setup() -> AnyhowResult<Self> {
        Ok(Self {
            inference_command: ComfyInferenceCommand::from_env()?,
            dependency_tokens: RequiredModels::init(),
        })
    }
}


pub struct ComfyDependency {
    pub(crate) location: PathBuf,
    pub(crate) prefix: String,
    pub(crate) hash: String,
    pub(crate) extension: String,
}

pub struct RequiredModels {
    pub(crate) comfy: Vec<ComfyDependency>
}

impl RequiredModels {
    pub fn init() -> Self {
        Self {
            comfy: vec![
                ComfyDependency {
                    location: PathBuf::from("custom_nodes/ComfyUI-AnimateDiff-Evolved/models/v3_sd15_mm.ckpt"),
                    prefix: "sd15".to_string(),
                    hash: "d07ac2v29ak90cttyx4v846yhept2fbr".to_string(),
                    extension: "ckpt".to_string(),
                },
            ],
        }
    }
}
