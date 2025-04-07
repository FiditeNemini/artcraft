use std::fs::read_to_string;
use base64::prelude::BASE64_STANDARD;
use errors::AnyhowResult;
use base64::Engine;
use image::codecs::png::{CompressionType, FilterType, PngEncoder};
use image::{DynamicImage, ImageReader};
use std::io::Cursor;
use log::{error, info};
use openai_sora_client::credentials::SoraCredentials;
use openai_sora_client::image_gen::common::{ImageSize, NumImages};
use openai_sora_client::image_gen::sora_image_gen_remix::{sora_image_gen_remix, SoraImageGenRemixRequest};
use openai_sora_client::upload::upload_media_from_bytes::sora_media_upload_from_bytes;
use openai_sora_client::upload::upload_media_from_file::SoraMediaUploadRequest;

#[tauri::command]
pub async fn image_generation_command(image: &str, prompt: &str) -> Result<String, String> {
  info!("image_generation_command called; processing image...");

  let bytes = BASE64_STANDARD.decode(image)
    .map_err(|err| format!("Base64 decode error: {}", err))?;

  generate_image(bytes, prompt)
    .await
    .map_err(|err| {
      error!("error: {:?}", err);
      "there was an error".to_string()
    })?;

  Ok("success".to_string())
}

pub async fn generate_image(file_bytes: Vec<u8>, prompt: &str) -> AnyhowResult<()> {
  let sora_credentials = get_credentials()?;

  let filename = "image.png".to_string();

  let response= sora_media_upload_from_bytes(file_bytes, filename, &sora_credentials)
      .await
      .map_err(|err| {
        error!("Failed to upload image to Sora: {:?}", err);
        err
      })?;

  let sora_media_tokens = vec![response.id];

  let response = sora_image_gen_remix(SoraImageGenRemixRequest {
    prompt: prompt.to_string(),
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

fn get_credentials() -> AnyhowResult<SoraCredentials> {
  let bearer = read_to_string("/Users/bt/dev/storyteller/storyteller-rust/test_data/temp/bearer.txt")?
      .trim()
      .to_string();
  let cookie= read_to_string("/Users/bt/dev/storyteller/storyteller-rust/test_data/temp/cookie.txt")?
      .trim()
      .to_string();
  let sentinel = read_to_string("/Users/bt/dev/storyteller/storyteller-rust/test_data/temp/sentinel.txt")?
      .trim()
      .to_string();
  Ok(SoraCredentials {
    bearer_token: bearer,
    cookie: cookie,
    sentinel: Some(sentinel),
  })
}