#[cfg(feature = "accelerate")]
extern crate accelerate_src;

#[cfg(feature = "mkl")]
extern crate intel_mkl_src;

use candle_transformers::models::stable_diffusion;
use std::ops::Div;

use anyhow::{Error as E, Result};
use candle::{DType, Device, IndexOp, Module, Tensor, D};
use clap::Parser;
use rand::Rng;
use stable_diffusion::vae::AutoEncoderKL;
use tokenizers::Tokenizer;
use candle_nn::VarBuilder;
use candle_transformers::models::stable_diffusion::unet_2d::UNet2DConditionModel;
use candle_transformers::models::stable_diffusion::unet_2d::UNet2DConditionModelConfig;
use candle_transformers::models::stable_diffusion::unet_2d::BlockConfig;

const PRINT_DEBUG_TENSORS: bool = false;

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
struct Args {
  /// The prompt to be used for image generation.
  #[arg(long, default_value = "A very realistic photo of a rusty robot walking on a sandy beach")]
  prompt: String,

  #[arg(long, default_value = "")]
  uncond_prompt: String,

  /// Run on CPU rather than on GPU.
  #[arg(long)]
  cpu: bool,

  /// Enable tracing (generates a trace-timestamp.json file).
  #[arg(long)]
  tracing: bool,

  /// The height in pixels of the generated image.
  #[arg(long)]
  height: Option<usize>,

  /// The width in pixels of the generated image.
  #[arg(long)]
  width: Option<usize>,

  /// The UNet weight file, in .safetensors format.
  #[arg(long, value_name = "FILE")]
  unet_weights: Option<String>,

  /// The CLIP weight file, in .safetensors format.
  #[arg(long, value_name = "FILE")]
  clip_weights: Option<String>,

  /// The CLIP2 weight file, in .safetensors format.
  #[arg(long, value_name = "FILE")]
  clip2_weights: Option<String>,

  /// The VAE weight file, in .safetensors format.
  #[arg(long, value_name = "FILE")]
  vae_weights: Option<String>,

  #[arg(long, value_name = "FILE")]
  /// The file specifying the tokenizer to used for tokenization.
  tokenizer: Option<String>,

  /// The size of the sliced attention or 0 for automatic slicing (disabled by default)
  #[arg(long)]
  sliced_attention_size: Option<usize>,

  /// The number of inference steps to run.
  #[arg(long, default_value_t = 4)]
  n_steps: usize,

  /// The number of samples to generate iteratively.
  #[arg(long, default_value_t = 1)]
  num_samples: usize,

  /// The numbers of samples to generate simultaneously.
  #[arg[long, default_value_t = 1]]
  bsize: usize,

  /// The name of the final image to generate.
  #[arg(long, value_name = "FILE", default_value = "sd_final.png")]
  final_image: String,

  #[arg(long, value_enum, default_value = "v2-1")]
  sd_version: StableDiffusionVersion,

  /// Generate intermediary images at each step.
  #[arg(long, action)]
  intermediary_images: bool,

  #[arg(long)]
  use_flash_attn: bool,

  #[arg(long)]
  use_f16: bool,

  /// The guidance scale for classifier-free guidance.
  #[arg(long, default_value_t = 2.0)]
  guidance_scale: f64,

  /// Path to the mask image for inpainting.
  #[arg(long, value_name = "FILE")]
  mask_path: Option<String>,

  /// Path to the image used to initialize the latents. For inpainting, this is the image to be masked.
  #[arg(long, value_name = "FILE")]
  img2img: Option<String>,

  /// The strength parameter for img2img, between 0 and 1.
  #[arg(long, default_value_t = 0.7)]
  strength: f64,

  /// The seed to use when generating random samples.
  #[arg(long)]
  seed: Option<u64>,

  /// Force the saved image to update only the masked region
  #[arg(long)]
  only_update_masked: bool,

  #[arg(long)]
  save_tensors: bool,

  /// Use half precision (F16) rather than F32
  #[arg(long)]
  half_precision: bool,
}

#[derive(Debug, Clone, Copy, clap::ValueEnum, PartialEq, Eq)]
enum StableDiffusionVersion {
  V1_5,
  V1_5Inpaint,
  V2_1,
  V2Inpaint,
  Xl,
  XlInpaint,
  Turbo,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum ModelFile {
  Tokenizer,
  Tokenizer2,
  Clip,
  Clip2,
  Unet,
  UnetLcm,
  Vae,
}

impl StableDiffusionVersion {
  fn repo(&self) -> &'static str {
    match self {
      Self::XlInpaint => "diffusers/stable-diffusion-xl-1.0-inpainting-0.1",
      Self::Xl => "stabilityai/stable-diffusion-xl-base-1.0",
      Self::V2Inpaint => "stabilityai/stable-diffusion-2-inpainting",
      Self::V2_1 => "stabilityai/stable-diffusion-2-1",
      Self::V1_5 => "runwayml/stable-diffusion-v1-5",
      Self::V1_5Inpaint => "stable-diffusion-v1-5/stable-diffusion-inpainting",
      Self::Turbo => "stabilityai/sdxl-turbo",
    }
  }

  fn unet_file(&self, use_f16: bool) -> &'static str {
    match self {
      Self::V1_5 | Self::V1_5Inpaint | Self::V2_1 | Self::V2Inpaint | Self::Xl | Self::XlInpaint | Self::Turbo => {
        if use_f16 {
          "unet/diffusion_pytorch_model.fp16.safetensors"
        } else {
          "unet/diffusion_pytorch_model.safetensors"
        }
      },
    }
  }

  fn vae_file(&self, use_f16: bool) -> &'static str {
    match self {
      Self::V1_5 | Self::V1_5Inpaint | Self::V2_1 | Self::V2Inpaint | Self::Xl | Self::XlInpaint | Self::Turbo => {
        if use_f16 {
          "vae/diffusion_pytorch_model.fp16.safetensors"
        } else {
          "vae/diffusion_pytorch_model.safetensors"
        }
      },
    }
  }

  fn clip_file(&self, use_f16: bool) -> &'static str {
    match self {
      Self::V1_5 | Self::V1_5Inpaint | Self::V2_1 | Self::V2Inpaint | Self::Xl | Self::XlInpaint | Self::Turbo => {
        if use_f16 {
          "text_encoder/model.fp16.safetensors"
        } else {
          "text_encoder/model.safetensors"
        }
      },
    }
  }

  fn clip2_file(&self, use_f16: bool) -> &'static str {
    match self {
      Self::V1_5 | Self::V1_5Inpaint | Self::V2_1 | Self::V2Inpaint | Self::Xl | Self::XlInpaint | Self::Turbo => {
        if use_f16 {
          "text_encoder_2/model.fp16.safetensors"
        } else {
          "text_encoder_2/model.safetensors"
        }
      },
    }
  }
}

impl ModelFile {
  fn get(&self, filename: Option<String>, version: StableDiffusionVersion, use_f16: bool) -> Result<std::path::PathBuf> {
    use hf_hub::api::sync::Api;
    match filename {
      Some(filename) => Ok(std::path::PathBuf::from(filename)),
      None => {
        let (repo, path) = match self {
          Self::Tokenizer => {
            let tokenizer_repo = match version {
              StableDiffusionVersion::V1_5 | StableDiffusionVersion::V2_1 | StableDiffusionVersion::V1_5Inpaint | StableDiffusionVersion::V2Inpaint => "openai/clip-vit-base-patch32",
              StableDiffusionVersion::Xl | StableDiffusionVersion::XlInpaint | StableDiffusionVersion::Turbo => {
                // This seems similar to the patch32 version except some very small
                // difference in the split regex.
                "openai/clip-vit-large-patch14"
              },
            };
            (tokenizer_repo, "tokenizer.json")
          },
          Self::Tokenizer2 => ("laion/CLIP-ViT-bigG-14-laion2B-39B-b160k", "tokenizer.json"),
          Self::Clip => (version.repo(), version.clip_file(use_f16)),
          Self::Clip2 => (version.repo(), version.clip2_file(use_f16)),
          Self::UnetLcm => ("SimianLuo/LCM_Dreamshaper_v7", if use_f16 { "unet/diffusion_pytorch_model.fp16.safetensors" } else { "unet/diffusion_pytorch_model.safetensors" }),
          Self::Unet => (version.repo(), version.unet_file(use_f16)),
          Self::Vae => {
            // Override for SDXL when using f16 weights.
            // See https://github.com/huggingface/candle/issues/1060
            if matches!(version, StableDiffusionVersion::Xl | StableDiffusionVersion::Turbo,) && use_f16 {
              ("madebyollin/sdxl-vae-fp16-fix", "diffusion_pytorch_model.safetensors")
            } else {
              (version.repo(), version.vae_file(use_f16))
            }
          },
        };
        let filename = Api::new()?.model(repo.to_string()).get(path)?;
        Ok(filename)
      },
    }
  }
}

fn output_filename(basename: &str, sample_idx: usize, num_samples: usize, timestep_idx: Option<usize>) -> String {
  let filename = if num_samples > 1 {
    match basename.rsplit_once('.') {
      None => format!("{basename}.{sample_idx}.png"),
      Some((filename_no_extension, extension)) => {
        format!("{filename_no_extension}.{sample_idx}.{extension}")
      },
    }
  } else {
    basename.to_string()
  };
  match timestep_idx {
    None => filename,
    Some(timestep_idx) => match filename.rsplit_once('.') {
      None => format!("{filename}-{timestep_idx}.png"),
      Some((filename_no_extension, extension)) => {
        format!("{filename_no_extension}-{timestep_idx}.{extension}")
      },
    },
  }
}

#[allow(clippy::too_many_arguments)]
fn save_image(vae: &AutoEncoderKL, latents: &Tensor, vae_scale: f64, bsize: usize, idx: usize, final_image: &str, num_samples: usize, timestep_ids: Option<usize>) -> Result<()> {
  let images = vae.decode(&(latents / vae_scale)?)?;
  let images = ((images / 2.)? + 0.5)?.to_device(&Device::Cpu)?;
  let images = (images.clamp(0f32, 1.)? * 255.)?.to_dtype(DType::U8)?;
  for batch in 0..bsize {
    let image = images.i(batch)?;
    let image_filename = output_filename(final_image, (bsize * idx) + batch + 1, batch + num_samples, timestep_ids);
    candle_examples::save_image(&image, image_filename)?;
  }
  Ok(())
}

#[allow(clippy::too_many_arguments)]
fn text_embeddings(prompt: &str, uncond_prompt: &str, tokenizer: Option<String>, clip_weights: Option<String>, clip2_weights: Option<String>, sd_version: StableDiffusionVersion, sd_config: &stable_diffusion::StableDiffusionConfig, use_f16: bool, device: &Device, dtype: DType, use_guide_scale: bool, first: bool) -> Result<Tensor> {
  let tokenizer_file = if first { ModelFile::Tokenizer } else { ModelFile::Tokenizer2 };
  let tokenizer = tokenizer_file.get(tokenizer, sd_version, use_f16)?;
  let tokenizer = Tokenizer::from_file(tokenizer).map_err(E::msg)?;
  let pad_id = match &sd_config.clip.pad_with {
    Some(padding) => *tokenizer.get_vocab(true).get(padding.as_str()).unwrap(),
    None => *tokenizer.get_vocab(true).get("<|endoftext|>").unwrap(),
  };
  println!("Running with prompt \"{prompt}\".");
  let mut tokens = tokenizer.encode(prompt, true).map_err(E::msg)?.get_ids().to_vec();
  if tokens.len() > sd_config.clip.max_position_embeddings {
    anyhow::bail!("the prompt is too long, {} > max-tokens ({})", tokens.len(), sd_config.clip.max_position_embeddings)
  }
  while tokens.len() < sd_config.clip.max_position_embeddings {
    tokens.push(pad_id)
  }
  let tokens = Tensor::new(tokens.as_slice(), device)?.unsqueeze(0)?;

  println!("Building the Clip transformer.");
  let clip_weights_file = if first { ModelFile::Clip } else { ModelFile::Clip2 };
  let clip_weights = if first { clip_weights_file.get(clip_weights, sd_version, use_f16)? } else { clip_weights_file.get(clip2_weights, sd_version, use_f16)? };
  let clip_config = if first { &sd_config.clip } else { sd_config.clip2.as_ref().unwrap() };
  let text_model = stable_diffusion::build_clip_transformer(clip_config, clip_weights, device, DType::F32)?;
  let text_embeddings = text_model.forward(&tokens)?;

  let text_embeddings = if use_guide_scale {
    let mut uncond_tokens = tokenizer.encode(uncond_prompt, true).map_err(E::msg)?.get_ids().to_vec();
    if uncond_tokens.len() > sd_config.clip.max_position_embeddings {
      anyhow::bail!("the negative prompt is too long, {} > max-tokens ({})", uncond_tokens.len(), sd_config.clip.max_position_embeddings)
    }
    while uncond_tokens.len() < sd_config.clip.max_position_embeddings {
      uncond_tokens.push(pad_id)
    }

    let uncond_tokens = Tensor::new(uncond_tokens.as_slice(), device)?.unsqueeze(0)?;
    let uncond_embeddings = text_model.forward(&uncond_tokens)?;

    Tensor::cat(&[uncond_embeddings, text_embeddings], 0)?.to_dtype(dtype)?
  } else {
    text_embeddings.to_dtype(dtype)?
  };
  Ok(text_embeddings)
}

fn image_preprocess<T: AsRef<std::path::Path>>(path: T) -> anyhow::Result<Tensor> {
  let img = image::ImageReader::open(path)?.decode()?;
  let (height, width) = (img.height() as usize, img.width() as usize);
  let height = height - height % 32;
  let width = width - width % 32;
  let img = img.resize_to_fill(width as u32, height as u32, image::imageops::FilterType::CatmullRom);
  let img = img.to_rgb8();
  let img = img.into_raw();
  let img = Tensor::from_vec(img, (height, width, 3), &Device::Cpu)?.permute((2, 0, 1))?.to_dtype(DType::F32)?.affine(2. / 255., -1.)?.unsqueeze(0)?;
  Ok(img)
}

/// Convert the mask image to a single channel tensor. Also ensure the image is a multiple of 32 in both dimensions.
fn mask_preprocess<T: AsRef<std::path::Path>>(path: T) -> anyhow::Result<Tensor> {
  let img = image::open(path)?.to_luma8();
  let (new_width, new_height) = {
    let (width, height) = img.dimensions();
    (width - width % 32, height - height % 32)
  };
  let img = image::imageops::resize(&img, new_width, new_height, image::imageops::FilterType::CatmullRom).into_raw();
  let mask = Tensor::from_vec(img, (new_height as usize, new_width as usize), &Device::Cpu)?.unsqueeze(0)?.to_dtype(DType::F32)?.div(255.0)?.unsqueeze(0)?;
  Ok(mask)
}

/// Generates the mask latents, scaled mask and mask_4 for inpainting. Returns a tuple of None if inpainting is not
/// being used.
#[allow(clippy::too_many_arguments)]
fn inpainting_tensors(sd_version: StableDiffusionVersion, mask_path: Option<String>, dtype: DType, device: &Device, use_guide_scale: bool, vae: &AutoEncoderKL, image: Option<Tensor>, vae_scale: f64) -> Result<(Option<Tensor>, Option<Tensor>, Option<Tensor>)> {
  match sd_version {
    StableDiffusionVersion::XlInpaint | StableDiffusionVersion::V2Inpaint | StableDiffusionVersion::V1_5Inpaint => {
      let inpaint_mask = mask_path.ok_or_else(|| anyhow::anyhow!("An inpainting model was requested but mask-path is not provided."))?;
      // Get the mask image with shape [1, 1, 128, 128]
      let mask = mask_preprocess(inpaint_mask)?.to_device(device)?.to_dtype(dtype)?;
      // Generate the masked image from the image and the mask with shape [1, 3, 1024, 1024]
      let xmask = mask.le(0.5)?.repeat(&[1, 3, 1, 1])?.to_dtype(dtype)?;
      let image = &image.ok_or_else(|| anyhow::anyhow!("An inpainting model was requested but img2img which is used as the input image is not provided."))?;
      let masked_img = (image * xmask)?;
      // Scale down the mask
      let shape = masked_img.shape();
      let (w, h) = (shape.dims()[3] / 8, shape.dims()[2] / 8);
      let mask = mask.interpolate2d(w, h)?;
      // shape: [1, 4, 128, 128]
      let mask_latents = vae.encode(&masked_img)?;
      let mask_latents = (mask_latents.sample()? * vae_scale)?.to_device(device)?;

      let mask_4 = mask.as_ref().repeat(&[1, 4, 1, 1])?;
      let (mask_latents, mask) = if use_guide_scale { (Tensor::cat(&[&mask_latents, &mask_latents], 0)?, Tensor::cat(&[&mask, &mask], 0)?) } else { (mask_latents, mask) };
      Ok((Some(mask_latents), Some(mask), Some(mask_4)))
    },
    _ => Ok((None, None, None)),
  }
}

fn get_tensor_stats(tensor: &Tensor) -> Result<(f32, f32, f32, f32)> {
  // Convert tensor to F32 for stats calculation - makes statistics more accurate anyway
  let tensor_f32 = tensor.to_dtype(DType::F32)?;
  let flat = tensor_f32.flatten_all()?;

  let min = flat.min(0)?.to_scalar::<f32>()?;
  let max = flat.max(0)?.to_scalar::<f32>()?;
  let mean = flat.mean_all()?.to_scalar::<f32>()?;

  // Create a tensor with the same shape as flat but filled with the mean value
  let mean_tensor = Tensor::new(&[mean], flat.device())?;
  let mean_tensor = mean_tensor.broadcast_as(flat.shape().dims())?;
  let diff = (flat - mean_tensor)?;
  let squared = diff.sqr()?;
  let variance = squared.mean_all()?;
  let std = variance.sqrt()?.to_scalar::<f32>()?;

  Ok((min, max, mean, std))
}

// Add this function to track statistics at key points
fn log_tensor_stats(name: &str, tensor: &Tensor) -> Result<()> {
  let (min, max, mean, std) = get_tensor_stats(tensor)?;
  println!("{} stats: min={:.5}, max={:.5}, mean={:.5}, std={:.5}", name, min, max, mean, std);
  Ok(())
}

// Add this simpler alternative function
fn save_tensor_as_numpy(tensor: &Tensor, filename: &str) -> Result<()> {
  use std::fs::File;
  use std::io::Write;

  // Move tensor to CPU and convert to f32 for consistent serialization
  let tensor_cpu = tensor.to_device(&Device::Cpu)?.to_dtype(DType::F32)?;
  let data = tensor_cpu.to_vec1::<f32>()?;

  // Create a simple binary file with the tensor data
  let mut file = File::create(filename)?;

  // Write shape information first (as u32 values)
  let shape = tensor.shape().dims();
  file.write_all(&(shape.len() as u32).to_le_bytes())?;
  for &dim in shape {
    file.write_all(&(dim as u32).to_le_bytes())?;
  }

  // Write all float values
  for val in data {
    file.write_all(&val.to_le_bytes())?;
  }

  Ok(())
}

fn run(args: Args) -> Result<()> {
  use tracing_chrome::ChromeLayerBuilder;
  use tracing_subscriber::prelude::*;

  let Args { prompt, uncond_prompt, cpu, height, width, n_steps, tokenizer, final_image, sliced_attention_size, num_samples, bsize, sd_version, clip_weights, clip2_weights, vae_weights, unet_weights, tracing, use_f16, guidance_scale, use_flash_attn, mask_path, img2img, strength, seed, only_update_masked, save_tensors, intermediary_images, half_precision } = args;

  if !(0. ..=1.).contains(&strength) {
    anyhow::bail!("strength should be between 0 and 1, got {strength}")
  }

  let _guard = if tracing {
    let (chrome_layer, guard) = ChromeLayerBuilder::new().build();
    tracing_subscriber::registry().with(chrome_layer).init();
    Some(guard)
  } else {
    None
  };

  println!("=== LCM-Dreamshaper F16 DEBUG MODE ===");
  println!("Using dtype: {:?}", if half_precision { DType::F16 } else { DType::F32 });

  let dtype = if half_precision { DType::F16 } else { DType::F32 };
  let sd_config = match sd_version {
    StableDiffusionVersion::V1_5 | StableDiffusionVersion::V1_5Inpaint => stable_diffusion::StableDiffusionConfig::v1_5(sliced_attention_size, height, width),
    StableDiffusionVersion::V2_1 | StableDiffusionVersion::V2Inpaint => stable_diffusion::StableDiffusionConfig::v2_1(sliced_attention_size, height, width),
    StableDiffusionVersion::Xl | StableDiffusionVersion::XlInpaint => stable_diffusion::StableDiffusionConfig::sdxl(sliced_attention_size, height, width),
    StableDiffusionVersion::Turbo => stable_diffusion::StableDiffusionConfig::sdxl_turbo(sliced_attention_size, height, width),
  };

  let mut scheduler = stable_diffusion::lcm::LCMScheduler::new(n_steps, stable_diffusion::lcm::LCMSchedulerConfig::default())?;
  println!("Scheduler created with dtype={:?}", scheduler.dtype());

  let device = candle_examples::device(cpu)?;
  // If a seed is not given, generate a random seed and print it
  let seed = seed.unwrap_or(rand::thread_rng().gen_range(0u64..u64::MAX));
  println!("Using seed {seed}");
  device.set_seed(seed)?;
  let use_guide_scale = guidance_scale > 1.0;

  let which = match sd_version {
    StableDiffusionVersion::Xl | StableDiffusionVersion::XlInpaint | StableDiffusionVersion::Turbo => vec![true, false],
    _ => vec![true],
  };

  // Define the base model and LCM model repositories
  let base_model_repo = match sd_version {
    StableDiffusionVersion::V1_5 | StableDiffusionVersion::V1_5Inpaint => {
      // Dreamshaper is based on SD 1.5, so use it for those versions
      "Lykon/dreamshaper-7"
    },
    _ => {
      // For other versions, use the standard repo
      sd_version.repo()
    },
  };
  let lcm_model_repo = "SimianLuo/LCM_Dreamshaper_v7"; // LCM UNet

  // Create a custom ModelFile enum variant for the base model
  let clip_weights = if clip_weights.is_none() {
    use hf_hub::api::sync::Api;
    let api = Api::new()?;
    let clip_path = api.model(base_model_repo.to_string()).get(if use_f16 { "text_encoder/model.fp16.safetensors" } else { "text_encoder/model.safetensors" })?;
    Some(clip_path.to_string_lossy().to_string())
  } else {
    clip_weights
  };

  let vae_weights = if vae_weights.is_none() {
    use hf_hub::api::sync::Api;
    let api = Api::new()?;
    let vae_path = api.model(base_model_repo.to_string()).get(if use_f16 { "vae/diffusion_pytorch_model.fp16.safetensors" } else { "vae/diffusion_pytorch_model.safetensors" })?;
    Some(vae_path.to_string_lossy().to_string())
  } else {
    vae_weights
  };

  // For the UNet, always use the LCM model
  let unet_weights = {
    use hf_hub::api::sync::Api;
    let api = Api::new()?;
    let unet_path = api.model(lcm_model_repo.to_string()).get(if use_f16 {
      if lcm_model_repo == "SimianLuo/LCM_Dreamshaper_v7" {
        "unet/diffusion_pytorch_model.safetensors"
      } else {
        "unet/diffusion_pytorch_model.fp16.safetensors"
      }
    } else {
      "unet/diffusion_pytorch_model.safetensors"
    })?;
    Some(unet_path.to_string_lossy().to_string())
  };

  // Load text embeddings from the base model
  let text_embeddings = which.iter().map(|first| text_embeddings(&prompt, &uncond_prompt, tokenizer.clone(), clip_weights.clone(), clip2_weights.clone(), sd_version, &sd_config, use_f16, &device, dtype, use_guide_scale, *first)).collect::<Result<Vec<_>>>()?;

  let text_embeddings = Tensor::cat(&text_embeddings, D::Minus1)?;
  let text_embeddings = text_embeddings.repeat((bsize, 1, 1))?;
  println!("Text embeddings shape: {:?}", text_embeddings.shape());
  if PRINT_DEBUG_TENSORS {
    println!("Text embeddings first few values: {}", text_embeddings.i(0)?.i(0)?.narrow(0, 0, 10)?);
  }

  // Replace the random projection with a fixed one to match diffusers
  let text_embeddings = if text_embeddings.dim(2)? == 2048 {
    println!("Projecting text embeddings from 2048 to 768 dimensions");

    // Load the projection matrix from a file (you'll need to extract this from the diffusers model)
    // For now, we'll still use a random one but with a fixed seed
    device.set_seed(42)?; // Use a fixed seed for the projection
    let projection = Tensor::randn(0.0, 0.02, (2048, 768), &device)?.to_dtype(dtype)?;

    let proj_embeddings = text_embeddings.matmul(&projection)?;
    proj_embeddings
  } else {
    text_embeddings
  };
  if PRINT_DEBUG_TENSORS {
    println!("Projected text embeddings: {:?}", text_embeddings);
  }

  println!("Building the autoencoder.");
  let vae_weights = ModelFile::Vae.get(vae_weights, sd_version, use_f16)?;
  let vae = sd_config.build_vae(vae_weights, &device, dtype)?;

  let (image, init_latent_dist) = match &img2img {
    None => (None, None),
    Some(image) => {
      let image = image_preprocess(image)?.to_device(&device)?.to_dtype(dtype)?;
      println!("Input image shape: {:?}", image.shape());
      (Some(image.clone()), Some(vae.encode(&image)?))
    },
  };

  println!(
    "Latent shape after VAE encoding: {:?}",
    init_latent_dist.as_ref().map(|dist| {
      // Try to get shape from a temporary sample
      match dist.sample() {
        Ok(sample) => format!("{:?}", sample.shape()),
        Err(_) => "Unable to determine shape".to_string(),
      }
    })
  );

  println!("Building the unet.");
  let unet_weights = ModelFile::UnetLcm.get(unet_weights, sd_version, use_f16)?;
  let in_channels = match sd_version {
    StableDiffusionVersion::XlInpaint | StableDiffusionVersion::V2Inpaint | StableDiffusionVersion::V1_5Inpaint => 9,
    _ => 4,
  };
  println!("Loading UNet weights from: SimianLuo/LCM_Dreamshaper_v7/unet");

  // Ensure we're loading the correct UNet configuration
  println!("Building UNet for LCM (SimianLuo/LCM_Dreamshaper_v7)");

  // For LCM models, ensure that:
  // 1. We're using the correct prediction type (epsilon)
  // 2. The cross-attention dimension is correct (768 for Dreamshaper)
  // 3. The in_channels matches the expected input (4 for standard, 9 for inpainting)
  let unet_config = UNet2DConditionModelConfig {
    // LCM specific config values
    cross_attention_dim: 768, // Dreamshaper v7 uses 768
    // Rest of configuration...
    center_input_sample: false,
    flip_sin_to_cos: true,
    freq_shift: 0.0,
    blocks: vec![BlockConfig { out_channels: 320, use_cross_attn: Some(1), attention_head_dim: 8 }, BlockConfig { out_channels: 640, use_cross_attn: Some(1), attention_head_dim: 8 }, BlockConfig { out_channels: 1280, use_cross_attn: Some(1), attention_head_dim: 8 }, BlockConfig { out_channels: 1280, use_cross_attn: None, attention_head_dim: 8 }],
    layers_per_block: 2,
    downsample_padding: 1,
    mid_block_scale_factor: 1.0,
    norm_num_groups: 32,
    norm_eps: 1e-5,
    sliced_attention_size: None,
    use_linear_projection: false,
  };

  // Load the model directly from the safetensors file
  let vs_unet = unsafe { VarBuilder::from_mmaped_safetensors(&[unet_weights], dtype, &device)? };

  let unet = UNet2DConditionModel::new(vs_unet, in_channels, 4, use_flash_attn, unet_config)?;

  // Ensure strength is at least 0.4 for img2img to work well
  let effective_strength = if img2img.is_some() {
    strength.max(0.4).min(0.99) // Keep between 0.4 and 0.99
  } else {
    strength
  };

  // Make sure we're doing a proper image-to-image transform
  // with the right amount of noise
  println!("Using img2img with strength={:.4}", effective_strength);
  let mut raw_t_start = n_steps - (n_steps as f64 * effective_strength).ceil() as usize;

  let vae_scale = match sd_version {
    StableDiffusionVersion::V1_5 | StableDiffusionVersion::V1_5Inpaint | StableDiffusionVersion::V2_1 | StableDiffusionVersion::V2Inpaint | StableDiffusionVersion::XlInpaint | StableDiffusionVersion::Xl => 0.18215,
    StableDiffusionVersion::Turbo => 0.13025,
  };

  let (mask_latents, mask, mask_4) = inpainting_tensors(sd_version, mask_path, dtype, &device, use_guide_scale, &vae, image, vae_scale)?;

  println!("Timesteps: {:?}", scheduler.timesteps());
  // println!("Alpha cumprod: {:?}", scheduler.alphas_cumprod());

  // Enable debug dumps to compare with diffusers
  let enable_debug_dumps = true;
  let debug_dir = "lcm_rust_debug";
  if enable_debug_dumps {
    std::fs::create_dir_all(debug_dir).expect("Failed to create debug directory");

    // Log the scheduler configuration
    let mut config_file = std::fs::File::create(format!("{}/scheduler_config.txt", debug_dir)).expect("Failed to create config file");
    use std::io::Write;
    writeln!(config_file, "Rust LCM Configuration:").unwrap();
    writeln!(config_file, "  beta_start: {}", scheduler.config.beta_start).unwrap();
    writeln!(config_file, "  beta_end: {}", scheduler.config.beta_end).unwrap();
    // More config params...
    writeln!(config_file, "\nTimesteps: {:?}", scheduler.timesteps()).unwrap();
    writeln!(config_file, "First 10 alphas_cumprod: {:?}", scheduler.alphas_cumprod().iter().take(10).collect::<Vec<_>>()).unwrap();
  }

  // Add this code before the loop where we iterate through samples
  // This will generate and log the guidance scale embedding

  // Create and log guidance scale embedding for comparison with Python
  println!("\n==== Generating LCM Guidance Scale Embedding ====");
  let guidance_scale = args.guidance_scale;
  println!("Guidance scale: {}", guidance_scale);

  // The embedding dimension should match the UNet time embedding dimension
  // For LCM Dreamshaper, this is typically 1280 (not 320)
  // Use a hardcoded value since we don't have direct access to the config
  let embedding_dim = 1280; // Standard for SD models based on UNet config
  println!("Embedding dimension: {}", embedding_dim);

  // Generate the embedding
  let guidance_embedding = scheduler.get_guidance_scale_embedding(guidance_scale, embedding_dim, &device, dtype)?;

  println!("Guidance embedding shape: {:?}", guidance_embedding.shape());

  // Save the embedding to a numpy file for comparison with Python
  if save_tensors {
    let tensor_dir = "lcm_rust_tensors";
    std::fs::create_dir_all(tensor_dir)?;

    save_tensor_as_numpy(&guidance_embedding, &format!("{}/guidance_embedding.npy", tensor_dir))?;
    println!("Saved guidance embedding to {}/guidance_embedding.npy", tensor_dir);
  }
  println!("===============================================\n");

  for idx in 0..num_samples {
    let timesteps = scheduler.timesteps().to_vec();

    // Initialize latents
    let latents = if let Some(init_latent_dist) = &init_latent_dist {
      println!("Using img2img with strength={:.4}", effective_strength);

      // LCM can be more sensitive to the starting timestep
      // Get the latents from the VAE
      let latents = (init_latent_dist.sample()? * vae_scale)?.to_device(&device)?;

      // Calculate the actual start timestep based on strength
      // In LCM, starting too late can cause artifacts, so ensure we start early enough
      let t_start_index = (timesteps.len() as f64 * (1.0 - effective_strength.max(0.5))).floor() as usize;
      let t_start = timesteps[t_start_index.min(timesteps.len() - 1)];

      println!("Starting from timestep {}/{} (index: {})", t_start, timesteps[0], t_start_index);

      // Use a fixed seed for noise to improve reproducibility
      device.set_seed(seed)?;
      let noise = (Tensor::randn(0f32, 1f32, latents.shape(), &device)?).to_dtype(dtype)?;

      // Clone the noise when passing it to add_noise
      let noised_latents = scheduler.add_noise(&latents, noise.clone(), t_start)?;

      // Now we can use noise for logging since we cloned it above
      log_tensor_stats("initial_latents", &latents)?;
      log_tensor_stats("noise", &noise)?;
      log_tensor_stats("noised_latents", &noised_latents)?;

      // Check the dtype of noised_latents
      debug_tensor("final_img2img_latents", &noised_latents)?;

      // Explicitly convert to expected dtype to avoid errors
      noised_latents.to_dtype(dtype)?
    } else {
      // Regular text-to-image generation with random noise
      let latents = Tensor::randn(0f32, 1f32, (bsize, 4, sd_config.height / 8, sd_config.width / 8), &device)?;

      // Use affine for multiplication
      let scaled_latents = latents.affine(scheduler.init_noise_sigma(), 0.0)?;
      debug_tensor("scaled_initial_latents", &scaled_latents)?;

      // Explicitly convert to expected dtype
      scaled_latents.to_dtype(dtype)?
    };
    let mut latents = latents.to_dtype(dtype)?;

    println!("Setting seed to {}", seed);
    device.set_seed(seed)?;

    if PRINT_DEBUG_TENSORS {
      println!("Initial latents shape: {:?}", latents.shape());
      println!("Initial latents first few values: {}", latents.i(0)?.i(0)?.narrow(0, 0, 5)?.narrow(1, 0, 5)?);
    }

    println!("Starting LCM sampling");
    let start_time = std::time::Instant::now();

    for (timestep_index, &timestep) in timesteps.iter().enumerate() {
      if timestep_index < raw_t_start {
        continue;
      }

      println!("\n--- Timestep {}/{} (value: {}) ---", timestep_index + 1, timesteps.len(), timestep);

      let latent_model_input = if use_guide_scale {
        println!("Using classifier-free guidance with scale: {}", guidance_scale);
        Tensor::cat(&[&latents, &latents], 0)?
      } else {
        latents.clone()
      };

      if PRINT_DEBUG_TENSORS {
        println!("Latent input shape before scaling: {:?}", latent_model_input.shape());
        println!("Latent input first few values: {}", latent_model_input.i(0)?.i(0)?.narrow(0, 0, 5)?.narrow(1, 0, 5)?);
      }

      let latent_model_input = scheduler.scale_model_input(latent_model_input, timestep);

      if PRINT_DEBUG_TENSORS {
        println!("Latent input shape after scaling: {:?}", latent_model_input.shape());
        println!("Scaled latent input first few values: {}", latent_model_input.i(0)?.i(0)?.narrow(0, 0, 5)?.narrow(1, 0, 5)?);
      }

      // Generate guidance scale embedding
      let guidance_emb = if use_guide_scale {
        // For LCM/Dreamshaper, the time embedding dimension is 1280
        let time_embed_dim = 1280; // Standard for SD models (320 base channels * 4)

        println!("Generating guidance scale embedding (scale={})", guidance_scale);
        Some(scheduler.get_guidance_scale_embedding(guidance_scale, time_embed_dim, &device, dtype)?)
      } else {
        None
      };

      // Before UNet forward call
      debug_tensor("latent_input_to_unet", &latent_model_input)?;
      debug_tensor("text_embeddings_to_unet", &text_embeddings)?;

      // Pass the guidance embedding to the UNet
      // This would require modifying the UNet forward method to accept this parameter
      println!("Running UNet forward pass with guidance embedding...");
      let noise_pred = unet.forward_with_guidance(&latent_model_input, timestep as f64, &text_embeddings, guidance_emb.as_ref())?;

      if PRINT_DEBUG_TENSORS {
        println!("Noise prediction shape: {:?}", noise_pred.shape());
        println!("Noise prediction first few values: {}", noise_pred.i(0)?.i(0)?.narrow(0, 0, 5)?.narrow(1, 0, 5)?);
      }

      let noise_pred = if use_guide_scale {
        let noise_pred = noise_pred.chunk(2, 0)?;
        let (noise_pred_uncond, noise_pred_text) = (&noise_pred[0], &noise_pred[1]);

        // LCM requires a different guidance approach than standard diffusion
        // Linear interpolation with scale factor
        let diff = (noise_pred_text - noise_pred_uncond)?;
        let scaled_diff = diff.affine(guidance_scale, 0.0)?;
        (noise_pred_uncond + &scaled_diff)?
      } else {
        noise_pred
      };

      if PRINT_DEBUG_TENSORS {
        println!("Latents before step first few values: {}", latents.i(0)?.i(0)?.narrow(0, 0, 5)?.narrow(1, 0, 5)?);
      }

      println!("Applying scheduler step...");
      latents = scheduler.step(&noise_pred, timestep, &latents)?;

      if PRINT_DEBUG_TENSORS {
        println!("Latents after step first few values: {}", latents.i(0)?.i(0)?.narrow(0, 0, 5)?.narrow(1, 0, 5)?);
      }

      println!("Step {}/{} completed", timestep_index + 1, n_steps);

      // Then use it at key points
      log_tensor_stats("latents_before_step", &latents)?;
      log_tensor_stats("noise_pred", &noise_pred)?;
      log_tensor_stats("latents_after_step", &latents)?;

      if save_tensors {
        let tensor_dir = "lcm_rust_tensors";
        std::fs::create_dir_all(tensor_dir)?;

        // Save key tensors at each step
        let step_dir = format!("{}/step_{}", tensor_dir, timestep_index);
        std::fs::create_dir_all(&step_dir)?;

        // Save various tensors as numpy arrays for later comparison
        save_tensor_as_numpy(&latent_model_input, &format!("{}/input.npy", step_dir))?;
        save_tensor_as_numpy(&noise_pred, &format!("{}/noise_pred.npy", step_dir))?;
        save_tensor_as_numpy(&latents, &format!("{}/output.npy", step_dir))?;
      }

      // After UNet forward call
      debug_tensor("noise_pred_from_unet", &noise_pred)?;
    }

    let dt = start_time.elapsed().as_secs_f32();
    println!("Sampling completed in {:.2}s", dt);

    // Generate final image
    println!("Generating final image for sample {}/{}", idx + 1, num_samples);
    save_image(&vae, &latents, vae_scale, bsize, idx, &final_image, num_samples, None)?;
  }
  Ok(())
}

// Add this debug function to check dtype at critical points
fn debug_tensor(name: &str, tensor: &Tensor) -> Result<()> {
  println!("DEBUG {}: shape={:?}, dtype={:?}", name, tensor.shape(), tensor.dtype());
  Ok(())
}

fn main() -> Result<()> {
  let args = Args::parse();
  run(args)
}
