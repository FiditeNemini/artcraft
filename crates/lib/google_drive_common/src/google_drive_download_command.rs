use anyhow::anyhow;
use container_common::anyhow_result::AnyhowResult;
use container_common::token::random_crockford_token::random_crockford_token;
use log::{info, warn};
use std::io::{BufReader, Read};
use std::path::{PathBuf, Path};
use std::process::Command;
use subprocess_common::docker_options::DockerOptions;
use tempdir::TempDir;

/// This is a Python script that uses the `gdown` package to download from Google Drive.
/// We're using this because it's a hack that gets around OAuth gateways. All the Rust
/// crates require OAuth permissions. Ugh.
///
/// This script lives here: https://github.com/storytold/web-downloader
///
/// Filename: `download_internet_file.py`
/// Arguments:
///   --url (google drive, web, or youtube url)
///   --output_filename (local download filename)
#[derive(Clone)]
pub struct GoogleDriveDownloadCommand {
  download_script: String,
  maybe_venv_activation_script: Option<String>,
  maybe_docker_options: Option<DockerOptions>,
}

impl GoogleDriveDownloadCommand {
  pub fn new(download_script: &str) -> Self {
    Self {
      download_script: download_script.to_string(),
      maybe_venv_activation_script: None,
      maybe_docker_options: None,
    }
  }

  pub fn new_local_dev_docker(
    download_script: &str,
    venv_activation_script: &str,
    docker_options: DockerOptions
  ) -> Self {
    Self {
      download_script: download_script.to_string(),
      maybe_venv_activation_script: Some(venv_activation_script.to_string()),
      maybe_docker_options: Some(docker_options),
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

    let mut command = format!("{} --url {} --output_filename {}",
                          &self.download_script,
                          download_url,
                          &temp_filename);

    if let Some(venv_activation_script) = self.maybe_venv_activation_script.as_deref() {
      // NB: "." is source for non-bash shells
      command = format!(". {} && {}",
                        venv_activation_script,
                        &command);
    }

    if let Some(docker_options) = self.maybe_docker_options.as_ref() {
      let fuse_command = match docker_options.maybe_bind_mount.as_ref()  {
        None => "".to_string(),
        Some(mount) => format!(" --mount type=bind,source={},target={}",
          &mount.local_filesystem,
          &mount.container_filesystem),
      };

      command = format!("docker run --rm {} {} /bin/bash -c \"{}\"",
        &fuse_command,
        &docker_options.image_name,
        command
      )
    }

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
