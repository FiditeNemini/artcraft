use std::path::PathBuf;

use anyhow::bail;

use crate::anyhow_result::AnyhowResult;

pub fn check_file_exists(path: &PathBuf) -> AnyhowResult<()> {
  if !path.exists() {
    bail!("Path doesn't exist: {:?}", path);
  }
  if !path.is_file() {
    bail!("Path isn't a file: {:?}", path);
  }
  Ok(())
}
