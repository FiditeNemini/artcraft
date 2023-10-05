use std::collections::HashSet;
use std::env;
use std::ffi::OsString;
use std::fs::File;
use std::path::{Path, PathBuf};
use std::time::Duration;

use anyhow::anyhow;
use log::info;
use once_cell::sync::Lazy;
use subprocess::{Popen, PopenConfig, Redirection};

use container_common::anyhow_result::AnyhowResult;
use filesys::path_to_string::path_to_string;
use subprocess_common::docker_options::{DockerFilesystemMount, DockerGpu, DockerOptions};

use crate::job::job_loop::command_exit_status::CommandExitStatus;

#[derive(Clone)]
pub enum ExecutableOrCommand {
  /// Eg. `inference.py`
  Executable(PathBuf),

  /// Eg. `python3 inference.py`
  Command(String),
}


pub struct InferenceArgs<'s, P: AsRef<Path>> {
    /// --driven_audio: path to the input audio
    pub input_audio: P,
  
    /// --source_image: path to the input image (or video)
    pub input_image: P,
  
    /// --result_dir: path to directory work is performed
    pub work_dir: P,
  
    /// --result_file: path to final file output
    pub output_file: P,
  
    pub stderr_output_file: P,
  
    /// --still: less animation
    pub make_still: bool,
  
    /// --enhancer: "gfpgan"
    pub maybe_enhancer: Option<&'s str>,
  
    /// --preprocess: "crop", etc.
    pub maybe_preprocess: Option<&'s str>,
  
    // TODO: Other SadTalker args
  }


pub impl VallEXInferenceCommand {
    pub fn new<P: AsRef<Path>>(
        root_code_directory: P,
        executable_or_command: ExecutableOrCommand,
        maybe_virtual_env_activation_command: Option<&str>,
        maybe_default_config_path: Option<P>,
        maybe_docker_options: Option<DockerOptions>,
        maybe_execution_timeout: Option<Duration>,
        alternate_checkpoint_dir: Option<PathBuf>
      ) -> Self {
        Self {
          root_code_directory: root_code_directory.as_ref().to_path_buf(),
          executable_or_command,
          maybe_virtual_env_activation_command: maybe_virtual_env_activation_command.map(|s| s.to_string()),
          maybe_default_config_path: maybe_default_config_path.map(|p| p.as_ref().to_path_buf()),
          maybe_docker_options,
          maybe_execution_timeout,
          alternate_checkpoint_dir,
        }
      }
}

pub impl VallEXCreateEmbeddingCommand {
    pub fn new<P: AsRef<Path>>(
        root_code_directory: P,
        executable_or_command: ExecutableOrCommand,
        maybe_virtual_env_activation_command: Option<&str>,
        maybe_default_config_path: Option<P>,
        maybe_docker_options: Option<DockerOptions>,
        maybe_execution_timeout: Option<Duration>,
        alternate_checkpoint_dir: Option<PathBuf>
      ) -> Self {
        Self {
          root_code_directory: root_code_directory.as_ref().to_path_buf(),
          executable_or_command,
          maybe_virtual_env_activation_command: maybe_virtual_env_activation_command.map(|s| s.to_string()),
          maybe_default_config_path: maybe_default_config_path.map(|p| p.as_ref().to_path_buf()),
          maybe_docker_options,
          maybe_execution_timeout,
          alternate_checkpoint_dir,
        }
      }
}