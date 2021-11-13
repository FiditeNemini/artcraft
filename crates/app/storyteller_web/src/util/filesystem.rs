use anyhow::bail;
use crate::util::anyhow_result::AnyhowResult;
use log::info;
use log::warn;
use std::fs;
use std::path::Path;
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

pub fn safe_delete_temp_file<P: AsRef<Path>>(file_path: P) {
  // NB: We should be using a tempdir, but to make absolutely certain we don't overflow the disk...
  let printable_name = file_path.as_ref().to_str().unwrap_or("bad filename");
  match fs::remove_file(&file_path) {
    Ok(_) => info!("Temp file deleted: {}", printable_name),
    Err(e) => warn!("Could not delete temp file {:?} (not a fatal error): {:?}",
      printable_name, e),
  }
}

pub fn safe_delete_temp_directory<P: AsRef<Path>>(directory_path: P) {
  // NB: We should be using a tempdir, but to make absolutely certain we don't overflow the disk...
  let printable_name = directory_path.as_ref().to_str().unwrap_or("bad directory");
  match fs::remove_dir_all(&directory_path) {
    Ok(_) => info!("Temp directory deleted: {}", printable_name),
    Err(e) => warn!("Could not delete temp directory{:?} (not a fatal error): {:?}",
      printable_name, e),
  }
}
