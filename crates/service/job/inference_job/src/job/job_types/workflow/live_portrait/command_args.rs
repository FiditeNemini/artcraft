use std::path::Path;

use filesys::path_to_string::path_to_string;
use subprocess_common::command_runner::command_args::CommandArgs;

#[derive(Debug)]
pub struct LivePortraitCommandArgs<'a> {
  pub portrait_file: &'a Path,
  pub driver_file: &'a Path,
  pub tempdir: &'a Path,
  pub output_file: &'a Path,

  pub stderr_output_file: &'a Path,
  pub stdout_output_file: &'a Path,
}

impl CommandArgs for LivePortraitCommandArgs<'_> {
  fn to_command_string(&self) -> String {
    let mut command = String::new();

    command.push_str(" --portrait ");
    command.push_str(&path_to_string(self.portrait_file));

    command.push_str(" --driver ");
    command.push_str(&path_to_string(self.driver_file));

    command.push_str(" --tempdir ");
    command.push_str(&path_to_string(self.tempdir));

    command.push_str(" --output ");
    command.push_str(&path_to_string(self.output_file));

    command.push_str(" ");

    command
  }
}
