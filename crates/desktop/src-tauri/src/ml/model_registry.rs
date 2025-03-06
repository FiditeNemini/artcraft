
#[derive(Copy, Clone, Debug)]
pub enum ModelRegistry {
  Clip,
  SdxlTurboUnet,
}

impl ModelRegistry {
  pub fn get_hf_id(&self) -> Option<&'static str> {
    match self {
      Self::Clip => Some("laion/CLIP-ViT-bigG-14-laion2B-39B-b160k"),
      Self::SdxlTurboUnet => Some("stabilityai/sdxl-turbo"),
    }
  }

  pub fn get_download_url(&self) -> &'static str {
    match self {
      Self::Clip => "https://pub-bc5e2bc0cdee4bb5ae8fca9d641ca0d6.r2.dev/tokenizer.json",
      Self::SdxlTurboUnet => "https://pub-bc5e2bc0cdee4bb5ae8fca9d641ca0d6.r2.dev/diffusion_pytorch_model.unet.safetensors",
    }
  }

  pub fn get_filename(&self) -> &'static str {
    match self {
      Self::Clip => "clip_vit_bigg_14_lion2b_39b_b160k.tokenizer.json",
      Self::SdxlTurboUnet => "diffusion_pytorch_model.unet.safetensors",
    }
  }
}
