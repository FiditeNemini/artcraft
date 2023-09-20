use std::path::PathBuf;

use anyhow::bail;

use crate::anyhow_result::AnyhowResult;

pub fn check_directory_exists(path: &PathBuf) -> AnyhowResult<()> {
  if !path.exists() {
    bail!("Path doesn't exist: {:?}", path);
  }
  if !path.is_dir() {
    bail!("Path isn't a directory: {:?}", path);
  }
  Ok(())
}
