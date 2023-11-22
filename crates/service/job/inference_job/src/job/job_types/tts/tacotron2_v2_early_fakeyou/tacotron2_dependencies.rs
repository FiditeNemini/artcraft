use errors::AnyhowResult;
use crate::job::job_types::tts::tacotron2_v2_early_fakeyou::tacotron2_inference_command::Tacotron2InferenceCommand;

pub struct Tacotron2Dependencies {
  pub inference_command: Tacotron2InferenceCommand,

  /// Common pretrained waveglow vocoder filename
  pub waveglow_vocoder_model_filename: String,

  /// Common pretrained hifigan vocoder filename
  pub hifigan_vocoder_model_filename: String,

  /// Common pretrained hifigan super resolution vocoder filename
  pub hifigan_superres_vocoder_model_filename: String,
}

impl Tacotron2Dependencies {
  pub fn setup() -> AnyhowResult<Self> {

    let waveglow_vocoder_model_filename = easyenv::get_env_string_or_default(
      "TTS_WAVEGLOW_VOCODER_MODEL_FILENAME", "waveglow.pth");

    let hifigan_vocoder_model_filename = easyenv::get_env_string_or_default(
      "TTS_HIFIGAN_VOCODER_MODEL_FILENAME", "hifigan.pth");

    let hifigan_superres_vocoder_model_filename = easyenv::get_env_string_or_default(
      "TTS_HIFIGAN_SUPERRES_VOCODER_MODEL_FILENAME", "hifigan_superres.pth");

    Ok(Self {
      inference_command: Tacotron2InferenceCommand::from_env()?,
      waveglow_vocoder_model_filename,
      hifigan_vocoder_model_filename,
      hifigan_superres_vocoder_model_filename,
    })
  }
}
