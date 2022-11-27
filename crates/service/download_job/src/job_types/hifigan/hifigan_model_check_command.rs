use crate::AnyhowResult;
use log::info;
use subprocess::{Popen, PopenConfig};
use std::path::Path;

/// This command is used to check hifigan for being a real model
#[derive(Clone)]
pub struct HifiGanModelCheckCommand {
  /// Where the HifiGan code lives
  hifigan_root_code_directory: String,
  
  /// eg. `source python/bin/activate`
  virtual_env_activation_command: String,
  
  hifigan_model_check_script_name: String,
}

impl HifiGanModelCheckCommand {
  pub fn new(
    hifigan_root_code_directory: &str,
    virtual_env_activation_command: &str,
    hifigan_model_check_script_name: &str,
  ) -> Self {
    Self {
      hifigan_root_code_directory: hifigan_root_code_directory.to_string(),
      virtual_env_activation_command: virtual_env_activation_command.to_string(),
      hifigan_model_check_script_name: hifigan_model_check_script_name.to_string(),
    }
  }

  pub fn execute<P: AsRef<Path>>(
    &self,
    checkpoint_path: P,
    output_metadata_filename: P,
  ) -> AnyhowResult<()> {

    let mut command = String::new();
    command.push_str(&format!("cd {}", self.hifigan_root_code_directory));
    command.push_str(" && ");
    command.push_str(&self.virtual_env_activation_command);
    command.push_str(" && ");
    command.push_str("python ");
    command.push_str(&self.hifigan_model_check_script_name);
    command.push_str(" --checkpoint_path ");
    command.push_str(&checkpoint_path.as_ref().display().to_string());
    command.push_str(" --output_metadata_filename ");
    command.push_str(&output_metadata_filename.as_ref().display().to_string());

    info!("Command: {:?}", command);

    let command_parts = [
      "bash",
      "-c",
      &command
    ];

    let mut p = Popen::create(&command_parts, PopenConfig {
      ..Default::default()
    })?;

    info!("Pid : {:?}", p.pid());

    let exit_status = p.wait()?;

    info!("Exit status: {:?}", exit_status);

    Ok(())
  }
}
