use std::env;
use std::ffi::OsString;
use std::fs::File;
use std::path::PathBuf;
use std::time::Duration;

use log::info;
use subprocess::{Popen, PopenConfig, Redirection};

use errors::AnyhowResult;
use filesys::path_to_string::path_to_string;

use crate::command_exit_status::CommandExitStatus;
use crate::command_runner::command_runner_args::{FileOrCreate, RunAsSubprocessArgs};
use crate::docker_options::DockerOptions;
use crate::executable_or_command::ExecutableOrShellCommand;

#[derive(Clone)]
pub struct CommandRunner {
  /// The script, executable, or command to run.
  pub executable_or_command: ExecutableOrShellCommand,

  /// The directory to change to before running the command.
  /// The parent process won't change directory here - only the subprocess will.
  pub maybe_execution_directory: Option<PathBuf>,

  /// If the command needs to run with a Python virtual env, this can be run.
  /// eg. `source python/bin/activate`
  pub maybe_virtual_env_activation_command: Option<String>,

  /// If this is run under Docker (eg. in development), these are the options.
  /// Typically, this is not done in production.
  pub maybe_docker_options: Option<DockerOptions>,

  /// If the execution should be ended after a certain point.
  pub maybe_execution_timeout: Option<Duration>,
}


impl CommandRunner {

  /// Run the command with the `subprocess` crate utilities
  pub fn run_with_subprocess(&self, args: RunAsSubprocessArgs<'_>) -> AnyhowResult<CommandExitStatus> {

    let mut command = String::new();

    if let Some(execution_directory) = self.maybe_execution_directory.as_deref() {
      command.push_str("cd ");
      command.push_str(&path_to_string(execution_directory));
      command.push_str(" && ");
    }

    if let Some(venv_command) = self.maybe_virtual_env_activation_command.as_deref() {
      command.push_str(venv_command);
      command.push_str(" && ");
    }

    match self.executable_or_command {
      ExecutableOrShellCommand::Executable(ref executable) => {
        command.push_str(&path_to_string(executable));
        command.push_str(" ");
      }
      ExecutableOrShellCommand::ShShellCommand(ref cmd) => {
        command.push_str(cmd);
        command.push_str(" ");
      }
      ExecutableOrShellCommand::BashShellCommand(ref cmd) => {
        command.push_str(cmd);
        command.push_str(" ");
      }
    }

    let command_arguments = args.args.to_command_string();
    command.push_str(&command_arguments);
    command.push_str(" ");

    if let Some(docker_options) = self.maybe_docker_options.as_ref() {
      command = docker_options.to_command_string(&command);
    }

    info!("Command: {:?}", command);

    let command_parts = [
      "bash",
      "-c",
      &command
    ];

    let mut env_vars = Vec::new();

    // Copy all environment variables from the parent process.
    // This is necessary to send all the kubernetes settings for Nvidia / CUDA.
    for (env_key, env_value) in env::vars() {
      // TODO(bt,2024-01-27): Env var sanitization
      //if IGNORED_ENVIRONMENT_VARS.contains(&env_key) {
      //  continue;
      //}
      env_vars.push((
        OsString::from(env_key),
        OsString::from(env_value),
      ));
    }

    let mut config = PopenConfig::default();

    if !env_vars.is_empty() {
      config.env = Some(env_vars);
    }

    match args.maybe_stderr_output_file {
      Some(FileOrCreate::NewFileWithName(stderr_output_file)) => {
        info!("stderr will be written to file: {:?}", stderr_output_file);

        let stderr_file = File::create(stderr_output_file)?;
        config.stderr = Redirection::File(stderr_file);
      },
      _ => {},
    }

    match args.maybe_stdout_output_file {
      Some(FileOrCreate::NewFileWithName(stdout_output_file)) => {
        info!("stdout will be written to file: {:?}", stdout_output_file);

        let stdout_file = File::create(stdout_output_file)?;
        config.stdout = Redirection::File(stdout_file);
      },
      _ => {},
    }

    let mut popen_handle = Popen::create(&command_parts, config)?;

    info!("Subprocess PID: {:?}", popen_handle.pid());

    let maybe_exit_status = match self.maybe_execution_timeout {
      None => {
        let exit_status = popen_handle.wait()?;
        info!("Subprocess exit status: {:?}", exit_status);
        return Ok(CommandExitStatus::from_exit_status(exit_status));
      }
      Some(timeout) => {
        info!("Executing with timeout: {:?}", &timeout);
        popen_handle.wait_timeout(timeout.clone())?
      }
    };

    match maybe_exit_status {
      None => {
        // NB: If the program didn't successfully terminate, kill it.
        info!("Subprocess didn't end after timeout; terminating...");
        let _r = popen_handle.terminate()?;
        Ok(CommandExitStatus::Timeout)
      }
      Some(exit_status) => {
        info!("Subprocess timed wait exit status: {:?}", exit_status);
        Ok(CommandExitStatus::from_exit_status(exit_status))
      }
    }
  }
}
