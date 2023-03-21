use crate::AnyhowResult;
use log::info;
use std::path::{Path, PathBuf};
use subprocess::{Popen, PopenConfig};
use subprocess_common::docker_options::DockerOptions;

/// This command is used to run tacotron2 (v1 "early fakeyou") inference
#[derive(Clone)]
pub struct Tacotron2InferenceCommand {
  /// Where the TT2 code lives
  tacotron_code_root_directory: PathBuf,

  /// The name of the inference script, eg. `vocodes_inference_updated.py`
  inference_script_name: PathBuf,

  /// eg. `source python/bin/activate`
  maybe_virtual_env_activation_command: Option<String>,

  /// If this is run under Docker (eg. in development), these are the options.
  maybe_docker_options: Option<DockerOptions>,
}

#[derive(Clone)]
pub enum VocoderForInferenceOption<P: AsRef<Path>> {
  Waveglow {
    waveglow_vocoder_checkpoint_path: P,
  },
  HifiganSuperres {
    hifigan_vocoder_checkpoint_path: P,
    hifigan_superres_vocoder_checkpoint_path: P,
  }
}

pub enum MelMultiplyFactor {
  // NB: Default is typically "1.4"
  DefaultMultiplyFactor,
  // Custom values tend to range from 1.1 to 1.5
  CustomMultiplyFactor(f64),
}

pub struct InferenceArgs <'a, P: AsRef<Path>> {
  //# Model parameters
  //parser.add_argument('--synthesizer_checkpoint_path', type=str, help='path the TTS synthesizer model', required=True)
  //parser.add_argument('--text_pipeline_type', type=str, help='', required=True)
  //parser.add_argument('--vocoder_type', type=str, help='', required=True)
  //parser.add_argument('--waveglow_vocoder_checkpoint_path', type=str, help='path the TTS vocoder model')
  //parser.add_argument('--hifigan_vocoder_checkpoint_path', type=str, help='path the TTS vocoder model')
  //parser.add_argument('--hifigan_superres_vocoder_checkpoint_path', type=str, help='path the TTS vocoder model')

  pub synthesizer_checkpoint_path: P,
  pub text_pipeline_type: &'a str, // TODO: Enum

  pub vocoder: VocoderForInferenceOption<P>,

  //pub vocoder_type: &'a str,
  //pub waveglow_vocoder_checkpoint_path: Option<P>,
  //pub hifigan_vocoder_checkpoint_path: Optin<P>,
  //pub hifigan_superres_vocoder_checkpoint_path: Option<P>,

  //# Optional mel scaling before vocoding
  //parser.add_argument('--use_default_mel_multiply_factor', type=bool, help='', action='store_true')
  //parser.add_argument('--maybe_custom_mel_multiply_factor', type=int, help='')
  //pub use_default_mel_multiply_factor: bool,
  //pub maybe_custom_mel_multiply_factor: Option<f32>,
  pub maybe_mel_multiply_factor: Option<MelMultiplyFactor>,

  //# Premium features
  //parser.add_argument('--max_decoder_steps', type=int, help='')
  pub max_decoder_steps: u32,

  //# User input
  //parser.add_argument('--input_text_filename', type=str, help='path the file containing text to run', required=True)
  pub input_text_filename: P,

  //# Output files
  //parser.add_argument('--output_audio_filename', type=str, help='where to save result audio', required=True)
  //parser.add_argument('--output_spectrogram_filename', type=str, help='where to save result spectrogram', required=True)
  //parser.add_argument('--output_metadata_filename', type=str, help='where to save extra metadata', required=True)

  pub output_audio_filename: P,
  pub output_spectrogram_filename: P,
  pub output_metadata_filename: P,
}

impl Tacotron2InferenceCommand {
  pub fn new<P: AsRef<Path>>(
    tacotron_code_root_directory: P,
    maybe_virtual_env_activation_command: Option<&str>,
    inference_script_name: P,
    maybe_docker_options: Option<DockerOptions>,
  ) -> Self {
    Self {
      tacotron_code_root_directory: tacotron_code_root_directory.as_ref().to_path_buf(),
      inference_script_name: inference_script_name.as_ref().to_path_buf(),
      maybe_virtual_env_activation_command: maybe_virtual_env_activation_command.map(|s| s.to_string()),
      maybe_docker_options,
    }
  }

  pub fn execute_inference<P: AsRef<Path>>(
    &self,
    args: InferenceArgs<'_, P>,
  ) -> AnyhowResult<()> {

    let mut command = String::new();
    command.push_str(&format!("cd {}", path_to_str(&self.tacotron_code_root_directory)));

    if let Some(venv_command) = self.maybe_virtual_env_activation_command.as_deref() {
      command.push_str(" && ");
      command.push_str(venv_command);
      command.push_str(" ");
    }

    command.push_str(" && ");
    command.push_str("python ");
    command.push_str(&path_to_str(&self.inference_script_name));

    // ===== Begin Python Inference Args =====

    command.push_str(" --synthesizer_checkpoint_path ");
    command.push_str(&path_to_str(args.synthesizer_checkpoint_path));

    command.push_str(" --text_pipeline_type ");
    command.push_str(args.text_pipeline_type);

    match args.vocoder {
      VocoderForInferenceOption::Waveglow { waveglow_vocoder_checkpoint_path } => {
        command.push_str(" --vocoder_type ");
        command.push_str("waveglow");

        command.push_str(" --waveglow_vocoder_checkpoint_path ");
        command.push_str(&path_to_str(waveglow_vocoder_checkpoint_path));
      }
      VocoderForInferenceOption::HifiganSuperres {
        hifigan_vocoder_checkpoint_path,
        hifigan_superres_vocoder_checkpoint_path
      } => {
        command.push_str(" --vocoder_type ");
        command.push_str("hifigan-superres");

        command.push_str(" --hifigan_vocoder_checkpoint_path ");
        command.push_str(&path_to_str(hifigan_vocoder_checkpoint_path));

        command.push_str(" --hifigan_superres_vocoder_checkpoint_path ");
        command.push_str(&path_to_str(hifigan_superres_vocoder_checkpoint_path));
      }
    }

    match args.maybe_mel_multiply_factor {
      None => {}
      Some(MelMultiplyFactor::DefaultMultiplyFactor) => {
        command.push_str(" --maybe_custom_mel_multiply_factor ");
        command.push_str("True");
      }
      Some(MelMultiplyFactor::CustomMultiplyFactor(factor)) => {
        command.push_str(" --custom_mel_multiply_factor ");
        command.push_str(&factor.to_string());
      }
    }

    command.push_str(" --input_text_filename ");
    command.push_str(&path_to_str(args.input_text_filename));

    command.push_str(" --output_audio_filename ");
    command.push_str(&path_to_str(args.output_audio_filename));

    command.push_str(" --output_spectrogram_filename ");
    command.push_str(&path_to_str(args.output_spectrogram_filename));

    command.push_str(" --output_metadata_filename ");
    command.push_str(&path_to_str(args.output_metadata_filename));

    // ===== End Python Inference Args =====

    if let Some(docker_options) = self.maybe_docker_options.as_ref() {
      command = docker_options.to_command_string(&command);
    }

    info!("Command: {:?}", command);

    let command_parts = [
      "bash",
      "-c",
      &command
    ];

    let mut p = Popen::create(&command_parts, PopenConfig {
      ..Default::default()
    })?;

    info!("Subprocess PID: {:?}", p.pid());

    let exit_status = p.wait()?;

    info!("Subprocess exit status: {:?}", exit_status);

    Ok(())
  }
}

fn path_to_str<P: AsRef<Path>>(path: P) -> String {
  path.as_ref().display().to_string()
}
