use anyhow::bail;
use crate::util::anyhow_result::AnyhowResult;
use std::path::PathBuf;

pub fn check_directory_exists(path: &PathBuf) -> AnyhowResult<()> {
  if !path.exists() {
    bail!("Path doesn't exist: {:?}", path);
  }
  if !path.is_dir() {
    bail!("Path isn't a directory: {:?}", path);
  }
  Ok(())
}

pub fn check_file_exists(path: &PathBuf) -> AnyhowResult<()> {
  if !path.exists() {
    bail!("Path doesn't exist: {:?}", path);
  }
  if !path.is_file() {
    bail!("Path isn't a file: {:?}", path);
  }
  Ok(())
}
