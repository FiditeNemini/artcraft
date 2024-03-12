use std::path::PathBuf;

use errors::AnyhowResult;

use crate::job::job_types::workflow::comfy_ui::comfy_ui_inference_command::ComfyInferenceCommand;
use crate::util::common_commands::ffmpeg_logo_watermark_command::FfmpegLogoWatermarkCommand;

pub struct ComfyDependencies {
    pub inference_command: ComfyInferenceCommand,
    pub ffmpeg_watermark_command: FfmpegLogoWatermarkCommand,
    pub dependency_tokens: RequiredModels,
}

impl ComfyDependencies {
    pub fn setup() -> AnyhowResult<Self> {
        Ok(Self {
            inference_command: ComfyInferenceCommand::from_env()?,
            dependency_tokens: RequiredModels::init(),
            ffmpeg_watermark_command: FfmpegLogoWatermarkCommand::from_env()?,
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
                    location: PathBuf::from("models/embeddings/badhandv4.pt"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/badhandv4.pt".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("models/embeddings/easynegative.safetensors"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/easynegative.safetensors".to_string(),
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
                ComfyDependency {
                    location: PathBuf::from("custom_nodes/ComfyUI-AnimateDiff-Evolved/models/v3_sd15_mm.ckpt"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/v3_sd15_mm.ckpt".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("custom_nodes/comfyui_controlnet_aux/ckpts/hr16/DWPose-TorchScript-BatchSize5/dw-ll_ucoco_384_bs5.torchscript.pt"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/dw-ll_ucoco_384_bs5.torchscript.pt".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("custom_nodes/comfyui_controlnet_aux/ckpts/yzd-v/DWPose/yolox_l.onnx"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/yolox_l.onnx".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("custom_nodes/comfyui_controlnet_aux/ckpts/LiheYoung/Depth-Anything/checkpoints/depth_anything_vitl14.pth"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/depth_anything_vitl14.pth".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("custom_nodes/comfyui_controlnet_aux/ckpts/lllyasviel/Annotators/sk_model2.pth"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/sk_model2.pth".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("custom_nodes/comfyui_controlnet_aux/ckpts/lllyasviel/Annotators/sk_model.pth"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/sk_model.pth".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("custom_nodes/comfyui_controlnet_aux/ckpts/lllyasviel/Annotators/netG.pth"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/netG.pth".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("custom_nodes/comfyui_controlnet_aux/ckpts/lllyasviel/Annotators/ControlNetHED.pth"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/ControlNetHED.pth".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("custom_nodes/ComfyUI-Frame-Interpolation/ckpts/rife/rife47.pth"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/rife47.pth".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("input/example.png"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/example.png".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("custom_nodes/ComfyUI-AnimateDiff-Evolved/models/sd15_t2v_beta_motion.ckpt"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/sd15_t2v_beta_motion.ckpt".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("models/loras/LCM_LoRA_Weights_SD15.safetensors"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/LCM_LoRA_Weights_SD15.safetensors".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("models/controlnet/control_v11p_sd15_canny.safetensors"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/control_v11p_sd15_canny.safetensors".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("models/grounding-dino/GroundingDINO_SwinT_OGC.cfg.py"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/GroundingDINO_SwinT_OGC.py".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("models/grounding-dino/groundingdino_swint_ogc.pth"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/groundingdino_swint_ogc.pth".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("models/grounding-dino/groundingdino_swint_ogc.pth"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/groundingdino_swint_ogc.pth".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("models/grounding-dino/groundingdino_swint_ogc.pth"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/groundingdino_swint_ogc.pth".to_string(),
                },
                ComfyDependency {
                    location: PathBuf::from("models/vae/vae-ft-mse-840000-ema-pruned.ckpt"),
                    url: "https://storage.googleapis.com/vocodes-public/comfyui-deps/vae-ft-mse-840000-ema-pruned.ckpt".to_string(),
                },        
            ],
        }
    }
}
