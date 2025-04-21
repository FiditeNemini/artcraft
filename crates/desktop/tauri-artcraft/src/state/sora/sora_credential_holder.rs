use std::sync::{Arc, RwLock};
use anyhow::anyhow;
use errors::AnyhowResult;
use openai_sora_client::credentials::SoraCredentials;

/// Hold credentials for the application.
#[derive(Clone)]
pub struct SoraCredentialHolder {
  credentials: Arc<RwLock<Option<SoraCredentials>>>
}

impl SoraCredentialHolder {
  pub fn new() -> Self {
    Self {
      credentials: Arc::new(RwLock::new(None))
    }
  }

  pub fn set_credentials(&self, credentials: SoraCredentials) -> AnyhowResult<()> {
    match self.credentials.write() {
      Err(err) => Err(anyhow!("Failed to acquire write lock: {:?}", err)),
      Ok(mut creds) => {
        *creds = Some(credentials);
        Ok(())
      }
    }
  }

  pub fn clear_credentials(&self) -> AnyhowResult<()> {
    match self.credentials.write() {
      Err(err) => Err(anyhow!("Failed to acquire write lock: {:?}", err)),
      Ok(mut creds) => {
        *creds = None;
        Ok(())
      }
    }
  }

  pub fn get_credentials(&self) -> AnyhowResult<Option<SoraCredentials>> {
    match self.credentials.read() {
      Err(err) => Err(anyhow!("Failed to acquire read lock: {:?}", err)),
      Ok(creds) => {
        Ok(creds.clone())
      }
    }
  }
}
