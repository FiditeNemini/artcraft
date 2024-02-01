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
    pub(crate) url: String,
}

pub struct RequiredModels {
    pub(crate) comfy: Vec<ComfyDependency>
}

impl RequiredModels {
    pub fn init() -> Self {
        Self {
            comfy: vec![
                ComfyDependency {
                    location: PathBuf::from("models/loras/v3_sd15_adapter.ckpt"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/v3_sd15_adapter.ckpt".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("custom_nodes/ComfyUI-AnimateDiff-Evolved/models/v3_sd15_mm.ckpt"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/v3_sd15_mm.ckpt".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("custom_nodes/ComfyUI-AnimateDiff-Evolved/models/v3_sd15_mm.ckpt"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/v3_sd15_mm.ckpt".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("models/controlnet/v3_sd15_sparsectrl_scribble.ckpt"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/v3_sd15_sparsectrl_scribble.ckpt".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("models/controlnet/control_v11f1e_sd15_tile.bin"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/control_v11f1e_sd15_tile.bin".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("models/controlnet/control_v11p_sd15_softedge.safetensors"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/control_v11p_sd15_softedge.safetensors".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("models/controlnet/control_v11p_sd15s2_lineart_anime.safetensors"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/control_v11p_sd15s2_lineart_anime.safetensors".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("models/controlnet/control_v11p_sd15_lineart.safetensors"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/control_v11p_sd15_lineart.safetensors".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("models/controlnet/control_v11f1p_sd15_depth.safetensors"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/control_v11f1p_sd15_depth.safetensors".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("models/controlnet/control_v11p_sd15_openpose.safetensors"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/control_v11p_sd15_openpose.safetensors".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("models/controlnet/animatediff_controlnet.ckpt"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/animatediff_controlnet.ckpt".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("models/controlnet/control_v2p_sd15_mediapipe_face.safetensors"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/control_v2p_sd15_mediapipe_face.safetensors".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("models/controlnet/ControlNetHED.pth"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/ControlNetHED.pth".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("models/ipadapter/ip-adapter_sd15_light.safetensors"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/ip-adapter_sd15_light.safetensors".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("models/clip_vision/CLIP-ViT-H-14-laion2B-s32B-b79K.safetensors"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/model.safetensors".to_string(),
                },
            ],
        }
    }
}
