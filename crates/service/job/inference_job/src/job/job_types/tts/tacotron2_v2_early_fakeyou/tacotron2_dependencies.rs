use errors::AnyhowResult;

use crate::job::job_types::tts::tacotron2_v2_early_fakeyou::tacotron2_inference_command::Tacotron2InferenceCommand;
use crate::job::job_types::tts::tacotron2_v2_early_fakeyou::tacotron2_inference_sidecar_client::Tacotron2InferenceSidecarClient;
use crate::job::job_types::tts::tacotron2_v2_early_fakeyou::tacotron2_sidecar_health_check_client::Tacotron2SidecarHealthCheckClient;

pub struct Tacotron2Dependencies {
  pub inference_command: Tacotron2InferenceCommand,

  /// Common pretrained waveglow vocoder filename
  pub waveglow_vocoder_model_filename: String,

  /// Common pretrained hifigan vocoder filename
  pub hifigan_vocoder_model_filename: String,

  /// Common pretrained hifigan super resolution vocoder filename
  pub hifigan_superres_vocoder_model_filename: String,

  /// Dependencies that are for the sidecar version of TT2
  pub sidecar: SidecarDeps,
}

pub struct SidecarDeps {
  pub inference_client: Tacotron2InferenceSidecarClient,
  pub health_check_client: Tacotron2SidecarHealthCheckClient,
}

impl Tacotron2Dependencies {
  pub fn setup() -> AnyhowResult<Self> {

    // The following are for TT2 that existed in inference-job but that are in an unknown state:

    let waveglow_vocoder_model_filename = easyenv::get_env_string_or_default(
      "TTS_WAVEGLOW_VOCODER_MODEL_FILENAME", "waveglow.pth");

    let hifigan_vocoder_model_filename = easyenv::get_env_string_or_default(
      "TTS_HIFIGAN_VOCODER_MODEL_FILENAME", "hifigan.pth");

    let hifigan_superres_vocoder_model_filename = easyenv::get_env_string_or_default(
      "TTS_HIFIGAN_SUPERRES_VOCODER_MODEL_FILENAME", "hifigan_superres.pth");

    // The following are for TT2 that was directly ported from tts-inference-job

    let sidecar_hostname =
        easyenv::get_env_string_required("TTS_INFERENCE_SIDECAR_HOSTNAME")?;

    let inference_client =
        Tacotron2InferenceSidecarClient::new(&sidecar_hostname);

    let health_check_client=
        Tacotron2SidecarHealthCheckClient::new(&sidecar_hostname)?;

    Ok(Self {
      inference_command: Tacotron2InferenceCommand::from_env()?,
      waveglow_vocoder_model_filename,
      hifigan_vocoder_model_filename,
      hifigan_superres_vocoder_model_filename,
      sidecar: SidecarDeps {
        inference_client,
        health_check_client,
      }
    })
  }
}
