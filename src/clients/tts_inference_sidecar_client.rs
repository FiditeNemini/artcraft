//use actix_web::client::Client;
use actix_web::http::header;
use anyhow::anyhow;
use crate::util::anyhow_result::AnyhowResult;
use hyper::client::Client;
use log::info;
use std::path::Path;
use hyper::{Body, Request};

pub struct TtsInferenceSidecarClient {
  hostname: String,
  //client: Client,
}

#[derive(Serialize)]
struct InferenceRequest {
  pub vocoder_checkpoint_path : String,
  pub synthesizer_checkpoint_path : String,
  pub inference_text : String,
  pub output_audio_filename : String,
  pub output_spectrogram_filename : String,
  pub output_metadata_filename : String,

  /// To instruct the sidecar to unload the model from memory
  pub maybe_clear_synthesizer_checkpoint_path: Option<String>,
}

impl TtsInferenceSidecarClient {
  pub fn new(hostname: &str) -> Self {
    //let client = Client::builder()
    //    .header("User-Agent", "actix/tts_inference_job")
    //    .finish();
    Self {
      hostname: hostname.to_string(),
    //  client,
    }
  }

  pub async fn request_inference<P: AsRef<Path>>(
    &self,
    raw_text: &str,
    synthesizer_checkpoint_path: P,
    vocoder_checkpoint_path: P,
    output_audio_filename: P,
    output_spectrogram_filename: P,
    output_metadata_filename: P,
    maybe_unload_model_path: Option<String>,
  ) -> AnyhowResult<()> {

    let vocoder_checkpoint_path = vocoder_checkpoint_path
        .as_ref()
        .to_str()
        .map(|s| s.to_string())
        .ok_or(anyhow!("bad vocoder path"))?;

    let synthesizer_checkpoint_path = synthesizer_checkpoint_path
        .as_ref()
        .to_str()
        .map(|s| s.to_string())
        .ok_or(anyhow!("bad synthesizer path"))?;

    let output_audio_filename = output_audio_filename
        .as_ref()
        .to_str()
        .map(|s| s.to_string())
        .ok_or(anyhow!("bad output audio path"))?;

    let output_spectrogram_filename = output_spectrogram_filename
        .as_ref()
        .to_str()
        .map(|s| s.to_string())
        .ok_or(anyhow!("bad output spectrogram path"))?;

    let output_metadata_filename = output_metadata_filename
        .as_ref()
        .to_str()
        .map(|s| s.to_string())
        .ok_or(anyhow!("bad output metadata path"))?;

    let request = InferenceRequest {
      inference_text: raw_text.to_string(),
      vocoder_checkpoint_path,
      synthesizer_checkpoint_path,
      output_audio_filename,
      output_spectrogram_filename,
      output_metadata_filename,
      maybe_clear_synthesizer_checkpoint_path: maybe_unload_model_path,
    };

    let url = format!("http://{}/infer", self.hostname);
    info!("Requesting {}", url);

    //let maybe_response = self.client.get(&url)
    //    .header(header::CONTENT_TYPE, "application/json")
    //    .send_json(&request)
    //    .await;

    let request = serde_json::to_string(&request)?;

    let req = Request::builder()
        .method(hyper::Method::POST)
        .uri(url)
        .header("content-type", "application/json")
        .body(Body::from(request))?;

    let client = Client::new();

    let maybe_response = client.request(req).await?;

    //match maybe_response {
    //  Err(e) => Err(anyhow!("Error talking to sidecar: {:?}", e)),
    //  Ok(_) => Ok(()),
    //}
    Ok(())
  }
}