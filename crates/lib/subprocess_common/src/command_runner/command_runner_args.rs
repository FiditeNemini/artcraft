use std::path::Path;

use crate::command_runner::command_args::CommandArgs;

#[derive(Clone, Debug)]
pub enum FileOrCreate<'a> {
  /// Open the file at the path. Overwrite if it already exists.
  NewFileWithName(&'a Path),

  // Future option(1): new file
  // /// Create a new file (and presumably return the name)
  // NewFile,

  // Future option(2): append-only file
  // Future option(3): already open file handle
}

pub struct RunAsSubprocessArgs<'a> {
  /// The args for the process we're going to call
  pub args: Box<&'a dyn CommandArgs>,

  /// If set, write stderr to this file.
  pub maybe_stderr_output_file: Option<FileOrCreate<'a>>,

  /// If set, write stdout to this file.
  pub maybe_stdout_output_file: Option<FileOrCreate<'a>>,
}
