use crate::state::data_dir::app_data_root::AppDataRoot;
use crate::state::storyteller::storyteller_credential_manager::StorytellerCredentialManager;
use crate::threads::sora_session_login_thread::LOGIN_WINDOW_NAME;
use crate::utils::cookies::storyteller_webview_cookies::get_storyteller_cookies;
use anyhow::anyhow;
use errors::AnyhowResult;
use log::{error, info};
use openai_sora_client::creds::sora_credential_set::SoraCredentialSet;
use openai_sora_client::recipes::maybe_upgrade_or_renew_session::maybe_upgrade_or_renew_session;
use openai_sora_client::utils::has_session_cookie::{has_session_cookie, SessionCookiePresence};
use std::fs;
use tauri::{AppHandle, Manager, Webview, Window};

const MAIN_WEBVIEW_NAME: &str = "main";

pub async fn persist_storyteller_cookies_task(
  window: &Window,
  app_data_root: &AppDataRoot,
  storyteller_credential_manager: &StorytellerCredentialManager,
) -> AnyhowResult<()> {
  for webview in window.webviews() {
    let label = webview.label();
    info!("Webview label: {:?}", label);
    if label == MAIN_WEBVIEW_NAME {
      persist_webview_cookies(&webview, app_data_root, storyteller_credential_manager).await?;
      break;
    }
  }
  Ok(())
}
async fn persist_webview_cookies(
  webview: &Webview,
  app_data_root: &AppDataRoot,
  storyteller_credential_manager: &StorytellerCredentialManager,
) -> AnyhowResult<()> {
  let current_webview_credentials = get_storyteller_cookies(webview)?;

  if current_webview_credentials.is_empty() {
    // TODO: handle logout / cookie deletion
    return Ok(());
  }
  
  let mut replace_credentials = true;
  
  let maybe_old_credentials = storyteller_credential_manager.get_credentials()?;
  
  if let Some(old_credentials) = maybe_old_credentials {
    if old_credentials.equals(&current_webview_credentials) {
      replace_credentials = false;
    }
  }
  
  if replace_credentials {
    info!("Writing ArtCraft credentials to disk...");
    storyteller_credential_manager.set_credentials(&current_webview_credentials)?;
    storyteller_credential_manager.persist_all_to_disk()?;
  }
  
  Ok(())
}
