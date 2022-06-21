use anyhow::bail;
use crate::anyhow_result::AnyhowResult;
use log::info;
use log::warn;
use std::fs;
use std::path::Path;
use std::path::PathBuf;

pub fn check_file_exists(path: &PathBuf) -> AnyhowResult<()> {
  if !path.exists() {
    bail!("Path doesn't exist: {:?}", path);
  }
  if !path.is_file() {
    bail!("Path isn't a file: {:?}", path);
  }
  Ok(())
}
