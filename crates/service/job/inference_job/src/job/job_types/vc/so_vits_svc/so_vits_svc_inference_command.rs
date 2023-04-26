use container_common::anyhow_result::AnyhowResult;
use filesys::path_to_string::path_to_string;
use log::info;
use std::fs::OpenOptions;
use std::path::{Path, PathBuf};
use anyhow::anyhow;
use subprocess::{Popen, PopenConfig, Redirection};
use subprocess_common::docker_options::{DockerFilesystemMount, DockerGpu, DockerOptions};

/// This command is used to check tacotron for being a real model
#[derive(Clone)]
pub struct SoVitsSvcInferenceCommand {
  /// Where the so-vits-svc code lives
  so_vits_svc_root_code_directory: PathBuf,

  // /// The name of the check/process script, eg. `export_ts.py`
  // inference_script_name: PathBuf,

  executable_or_command: ExecutableOrCommand,

  /// eg. `source python/bin/activate`
  maybe_virtual_env_activation_command: Option<String>,

  ///// eg. `python3`
  //maybe_override_python_interpreter: Option<String>,

  /// If this is run under Docker (eg. in development), these are the options.
  maybe_docker_options: Option<DockerOptions>,
}

#[derive(Clone)]
pub enum ExecutableOrCommand {
  /// Eg. `infer.py`
  Executable(PathBuf),

  /// Eg. `python3 -m so_vits_svc_fork.fakeyou_infer`
  Command(String),
}

pub enum Device {
  Cuda,
  Cpu,
}

pub struct InferenceArgs<P: AsRef<Path>> {
  /// --model-path: model path
  pub model_path: P,

  /// (positional arg): input wav path
  pub input_path: P,

  /// --config-path: path of the hparams json file
  pub config_path: P,

  /// --output_path: output path of converting model to onnx (which we use to test validity)
  pub output_path: P,

  /// --device: cpu or cuda
  pub device: Device,
}

impl SoVitsSvcInferenceCommand {
  pub fn new<P: AsRef<Path>>(
    so_vits_svc_root_code_directory: P,
    executable_or_command: ExecutableOrCommand,
    maybe_virtual_env_activation_command: Option<&str>,
    maybe_docker_options: Option<DockerOptions>,
  ) -> Self {
    Self {
      so_vits_svc_root_code_directory: so_vits_svc_root_code_directory.as_ref().to_path_buf(),
      executable_or_command,
      maybe_virtual_env_activation_command: maybe_virtual_env_activation_command.map(|s| s.to_string()),
      maybe_docker_options,
    }
  }

  pub fn from_env() -> AnyhowResult<Self> {
    let so_vits_svc_root_code_directory = easyenv::get_env_pathbuf_required(
      "SO_VITS_SVC_INFERENCE_ROOT_DIRECTORY")?;

    // NB: The command is installed (typically as `svc`) rather than called as a python script.
    // Lately we've had to call it as `python3 -m so_vits_svc_fork.fakeyou_infer`
    let maybe_inference_command = easyenv::get_env_string_optional(
      "SO_VITS_SVC_INFERENCE_COMMAND");

    // Optional, eg. `./infer.py`. Typically we'll use the command form instead.
    let maybe_inference_executable = easyenv::get_env_pathbuf_optional(
      "SO_VITS_SVC_INFERENCE_EXECUTABLE");

    let executable_or_command = match maybe_inference_command {
      Some(command) => ExecutableOrCommand::Command(command),
      None => match maybe_inference_executable {
        Some(executable) => ExecutableOrCommand::Executable(executable),
        None => return Err(anyhow!("neither command nor executable passed")),
      },
    };

    let maybe_virtual_env_activation_command = easyenv::get_env_string_optional(
      "SO_VITS_SVC_INFERENCE_MAYBE_VENV_COMMAND");

    //let maybe_override_python_interpreter = easyenv::get_env_string_optional(
    //  "SO_VITS_SVC_MODEL_CHECK_MAYBE_PYTHON_INTERPRETER");

    let maybe_docker_options = easyenv::get_env_string_optional(
      "SO_VITS_SVC_INFERENCE_MAYBE_DOCKER_IMAGE")
        .map(|image_name| {
          DockerOptions {
            image_name,
            maybe_bind_mount: Some(DockerFilesystemMount::tmp_to_tmp()),
            maybe_environment_variables: None,
            maybe_gpu: Some(DockerGpu::All),
          }
        });

    Ok(Self {
      so_vits_svc_root_code_directory,
      executable_or_command,
      maybe_virtual_env_activation_command,
      maybe_docker_options,
    })
  }

  pub fn execute_check<P: AsRef<Path>>(
    &self,
    args: InferenceArgs<P>,
  ) -> AnyhowResult<()> {

    let mut command = String::new();
    command.push_str(&format!("cd {}", path_to_string(&self.so_vits_svc_root_code_directory)));

    if let Some(venv_command) = self.maybe_virtual_env_activation_command.as_deref() {
      command.push_str(" && ");
      command.push_str(venv_command);
      command.push_str(" ");
    }

    // NB: We can't use `onnx` for model integrity checking (that might take long anyway), so
    // we'll just run inference instead. That's flexible and works.
    command.push_str(" && ");

    match self.executable_or_command {
      ExecutableOrCommand::Executable(ref executable) => {
        command.push_str(&path_to_string(executable));
        command.push_str(" infer ");
      }
      ExecutableOrCommand::Command(ref cmd) => {
        command.push_str(cmd);
        command.push_str(" ");
      }
    }

    // ===== Begin Python Args =====

    command.push_str(" --model-path ");
    command.push_str(&path_to_string(args.model_path));
    command.push_str(" --output-path ");
    command.push_str(&path_to_string(args.output_path));

    command.push_str(" --config-path ");
    command.push_str(&path_to_string(args.config_path));

    let device = match args.device {
      Device::Cuda => "cuda",
      Device::Cpu => "cpu",
    };

    command.push_str(" --device ");
    command.push_str(&path_to_string(device));

    // NB: Input wav path is not a named arg
    command.push_str(" ");
    command.push_str(&path_to_string(args.input_path));
    command.push_str(" ");

    // ===== End Python Args =====

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
