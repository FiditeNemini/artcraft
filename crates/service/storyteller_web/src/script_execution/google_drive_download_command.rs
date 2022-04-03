use anyhow::anyhow;
use container_common::anyhow_result::AnyhowResult;
use container_common::token::random_crockford_token::random_crockford_token;
use log::{info, warn};
use std::io::{BufReader, Read};
use std::path::{PathBuf, Path};
use std::process::Command;
use tempdir::TempDir;

/// This is a Python script that uses the `gdown` package to download from Google Drive.
/// We're using this because it's a hack that gets around OAuth gateways. All the Rust
/// crates require OAuth permissions. Ugh.
///
/// Filename: `download_internet_file.py`
/// Arguments:
///   --url (google drive, web, or youtube url)
///   --output_file (local download filename)
pub struct GoogleDriveDownloadCommand {
  command: String,
}

impl GoogleDriveDownloadCommand {
  pub fn new(command: &str) -> Self {
    Self {
      command: command.to_string(),
    }
  }

  /// Download file from Google Drive into the `TempDir`.
  /// Return the local filesystem filename.
  pub async fn download_file(&self,
                         download_url: &str,
                         temp_dir: &TempDir) -> AnyhowResult<String>
  {
    let temp_dir_path = temp_dir.path()
      .to_str()
      .unwrap_or("/tmp")
      .to_string();

    let temp_filename = random_crockford_token(10);
    let temp_filename = format!("{}/{}.bin", temp_dir_path, temp_filename);

    info!("Downloading {} to: {}", download_url, temp_filename);

    let command = format!("{} --url {} --output_file {}",
                          &self.command,
                          &download_url,
                          &temp_filename);

    info!("Running command: {}", command);

    let result = Command::new("sh")
      .arg("-c")
      .arg(command)
      .output()?;

    info!("Downloader Result: {:?}", result);

    if !result.status.success() {
      let reason = String::from_utf8(result.stderr).unwrap_or("UNKNOWN".to_string());
      return Err(anyhow!("Failure to execute command: {:?}", reason))
    }

    Ok(temp_filename)
  }
}
