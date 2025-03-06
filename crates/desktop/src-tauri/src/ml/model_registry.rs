
#[derive(Copy, Clone, Debug)]
pub enum ModelRegistry {
  ClipJson,
  SdxlTurboUnet,
  SdxlTurboVae,
  SdxlTurboClipEncoder,
  SdxlTurboClipEncoder2,
}

impl ModelRegistry {
  pub fn get_hf_id(&self) -> Option<&'static str> {
    match self {
      Self::ClipJson => Some("laion/CLIP-ViT-bigG-14-laion2B-39B-b160k"),
      Self::SdxlTurboUnet 
      | Self::SdxlTurboVae
      | Self::SdxlTurboClipEncoder
      | Self::SdxlTurboClipEncoder2 => Some("stabilityai/sdxl-turbo"),
    }
  }

  pub fn get_download_url(&self) -> &'static str {
    match self {
      Self::ClipJson => "https://pub-bc5e2bc0cdee4bb5ae8fca9d641ca0d6.r2.dev/tokenizer.json",
      Self::SdxlTurboUnet => "https://pub-bc5e2bc0cdee4bb5ae8fca9d641ca0d6.r2.dev/diffusion_pytorch_model.unet.safetensors",
      Self::SdxlTurboVae => "https://pub-bc5e2bc0cdee4bb5ae8fca9d641ca0d6.r2.dev/diffusion_pytorch_model.vae.safetensors",
      Self::SdxlTurboClipEncoder => "https://pub-bc5e2bc0cdee4bb5ae8fca9d641ca0d6.r2.dev/clip_text_encoder.safetensors",
      Self::SdxlTurboClipEncoder2 => "https://pub-bc5e2bc0cdee4bb5ae8fca9d641ca0d6.r2.dev/clip_text_encoder_2.safetensors",
    }
  }

  pub fn get_filename(&self) -> &'static str {
    match self {
      Self::ClipJson => "clip_vit_bigg_14_lion2b_39b_b160k.tokenizer.json",
      Self::SdxlTurboUnet => "diffusion_pytorch_model.unet.safetensors",
      Self::SdxlTurboVae => "diffusion_pytorch_model.vae.safetensors",
      Self::SdxlTurboClipEncoder => "clip_text_encoder.safetensors",
      Self::SdxlTurboClipEncoder2 => "clip_text_encoder_2.safetensors",
    }
  }
}
