use anyhow::bail;
use crate::anyhow_result::AnyhowResult;
use log::info;
use log::warn;
use std::fs;
use std::path::Path;
use std::path::PathBuf;

pub fn safe_delete_temp_directory<P: AsRef<Path>>(directory_path: P) {
  // NB: We should be using a tempdir, but to make absolutely certain we don't overflow the disk...
  let printable_name = directory_path.as_ref().to_str().unwrap_or("bad directory");
  match fs::remove_dir_all(&directory_path) {
    Ok(_) => info!("Temp directory deleted: {}", printable_name),
    Err(e) => warn!("Could not delete temp directory{:?} (not a fatal error): {:?}",
                    printable_name, e),
  }
}
