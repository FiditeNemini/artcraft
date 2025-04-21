use base64::Engine;
use base64::prelude::BASE64_STANDARD;
use crate::state::app_dir::AppDataRoot;
use crate::state::sora::read_sora_credentials_from_disk::read_sora_credentials_from_disk;
use crate::state::sora::sora_credential_holder::SoraCredentialHolder;
use errors::AnyhowResult;
use image::codecs::png::{CompressionType, FilterType, PngEncoder};
use image::{DynamicImage, ImageReader};
use log::{error, info};
use openai_sora_client::credentials::SoraCredentials;
use openai_sora_client::image_gen::common::{ImageSize, NumImages};
use openai_sora_client::image_gen::sora_image_gen_remix::{sora_image_gen_remix, SoraImageGenRemixRequest};
use openai_sora_client::upload::upload_media_from_bytes::sora_media_upload_from_bytes;
use openai_sora_client::upload::upload_media_from_file::SoraMediaUploadRequest;
use serde_derive::Deserialize;
use std::fs::read_to_string;
use std::io::Cursor;
use tauri::{AppHandle, Manager, State};
use tokens::tokens::media_files::MediaFileToken;

#[derive(Deserialize)]
pub struct SoraImageRemixCommand {
  /// Image media file; the engine or canvas snapshot (screenshot).
  pub snapshot_media_token: MediaFileToken,

  /// The user's image generation prompt.
  pub prompt: String,

  /// Turn off the system prompt.
  pub disable_system_prompt: Option<bool>,

  /// Additional images to include (optional). Up to nine images.
  pub maybe_additional_images: Option<Vec<MediaFileToken>>,

  pub maybe_number_of_samples: Option<u32>,
}

#[tauri::command]
pub async fn sora_image_remix_command(
  _app: AppHandle,
  request: SoraImageRemixCommand,
  app_data_root: State<'_, AppDataRoot>,
  sora_creds_holder: State<'_, SoraCredentialHolder>,
) -> Result<String, String> {
  info!("image_generation_command called; processing image...");

  generate_image(request, &app_data_root, &sora_creds_holder)
    .await
    .map_err(|err| {
      error!("error: {:?}", err);
      "there was an error".to_string()
    })?;

  Ok("success".to_string())
}

pub async fn generate_image(
  request: SoraImageRemixCommand,
  app_data_root: &AppDataRoot,
  sora_creds_holder: &SoraCredentialHolder,
) -> AnyhowResult<()> {

  let sora_credentials = read_sora_credentials_from_disk(app_data_root)
    .map_err(|err| {
      error!("Failed to read Sora credentials from disk: {:?}", err);
      err
    })?;

  //let sora_credentials = sora_creds_holder.get_credentials()?;

  let sora_media_tokens = vec![];

  // TODO(bt,2025-04-21): Download media tokens.
  //  Note: This is incredibly inefficient. We should keep a local cache.
  //  Also, if they've already been uploaded to OpenAI, we shouldn't continue to re-upload.

  let response = sora_image_gen_remix(SoraImageGenRemixRequest {
    prompt: request.prompt.to_string(),
    num_images: NumImages::One,
    image_size: ImageSize::Square,
    sora_media_tokens: sora_media_tokens.clone(),
    credentials: &sora_credentials,
  }).await
      .map_err(|err| {
        error!("Failed to call Sora image generation: {:?}", err);
        err
      })?;

  println!(">> TASK ID: {:?} ", response.task_id);

  Ok(())
}
