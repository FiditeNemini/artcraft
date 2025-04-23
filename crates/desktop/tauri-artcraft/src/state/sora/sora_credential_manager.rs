use crate::state::app_dir::AppDataRoot;
use crate::state::sora::read_sora_credentials_from_disk::read_sora_credentials_from_disk;
use crate::state::sora::sora_credential_holder::SoraCredentialHolder;
use errors::AnyhowResult;
use log::{error, info, warn};
use openai_sora_client::credentials::SoraCredentials;
use openai_sora_client::sentinel_refresh::refresh_sentinel;
use std::fs::OpenOptions;
use std::io::Write;
use anyhow::anyhow;
use openai_sora_client::sentinel_refresh::generate::token::generate_token;

#[derive(Clone)]
pub struct SoraCredentialManager {
  holder: SoraCredentialHolder,
  app_data_root: AppDataRoot,
}

impl SoraCredentialManager {

  pub fn initialize_from_disk_infallible(app_data_root: &AppDataRoot) -> Self {
    let holder = SoraCredentialHolder::new();

    match read_sora_credentials_from_disk(app_data_root) {
      Err(err) => warn!("Failed to read credentials from disk: {:?}", err),
      Ok(creds) => {
        holder.set_credentials(&creds).expect("Failed to set credentials");
      }
    }

    Self {
      holder,
      app_data_root: app_data_root.clone(),
    }
  }

  pub fn set_credentials(&self, creds: &SoraCredentials) -> AnyhowResult<()> {
    self.holder.set_credentials(creds)
  }

  pub fn clear_credentials(&self) -> AnyhowResult<()> {
    self.holder.clear_credentials()
  }

  pub fn get_credentials(&self) -> AnyhowResult<Option<SoraCredentials>> {
    self.holder.get_credentials()
  }

  pub fn get_credentials_required(&self) -> AnyhowResult<SoraCredentials> {
    self.holder.get_credentials_required()
  }

  pub fn reset_from_disk(&self) -> AnyhowResult<SoraCredentials> {
    let creds = read_sora_credentials_from_disk(&self.app_data_root)?;
    self.holder.set_credentials(&creds)?;
    Ok(creds)
  }

  /// Refresh the sentinel token from Sora's API
  pub async fn call_sentinel_refresh(&self) -> AnyhowResult<SoraCredentials> {
    // NB(bt,2025-04-21): Technically we don't need credentials to get a sentinel.
    let mut creds = self.holder.get_credentials_required()?;

    info!("Generating token...");

    let sentinel = generate_token()
        .await
        .map_err(|err| {
          error!("Failed to refresh: {:?}", err);
          err
        })?;

    info!("Token obtained.");

    creds.sentinel = Some(sentinel.clone());

    self.holder.set_credentials(&creds)?;

    let mut file = OpenOptions::new()
        .create(true)
        .write(true)
        .truncate(true)
        .open(self.app_data_root.get_sora_sentinel_file_path())?;

    file.write_all(sentinel.as_bytes())?;
    file.flush()?;

    Ok(creds)
  }
}
