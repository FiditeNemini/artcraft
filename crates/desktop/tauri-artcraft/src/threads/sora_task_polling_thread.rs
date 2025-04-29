use crate::state::app_dir::AppDataRoot;
use crate::state::sora::sora_credential_manager::SoraCredentialManager;
use errors::AnyhowResult;
use log::{error, info};
use openai_sora_client::recipes::list_sora_task_status_with_session_auto_renew::{list_sora_task_status_with_session_auto_renew, StatusRequestArgs};
use tauri::AppHandle;

pub async fn sora_session_login_thread(
  app_data_root: AppDataRoot,
  sora_creds_manager: SoraCredentialManager
) -> ! {
  loop {
    if let Err(err) = polling_loop(&sora_creds_manager).await {
      error!("An error occurred: {:?}", err);
    }
    tokio::time::sleep(std::time::Duration::from_millis(30_000)).await;
  }
}

async fn polling_loop(sora_creds_manager: &SoraCredentialManager) -> AnyhowResult<()> {
  loop {
    let creds = sora_creds_manager.get_credentials_required()?;

    let (response, maybe_new_creds) = list_sora_task_status_with_session_auto_renew(StatusRequestArgs {
      limit: None,
      before: None,
      credentials: creds,
    }).await?;

    if let Some(new_creds) = maybe_new_creds {
      info!("Saving new credentials.");
      sora_creds_manager.set_credentials(&new_creds)?;
    }

    // TODO: The cursoring logic likely needs to improve.
    for task in response.task_responses {
      info!("Task ID: {}", task.id);
      info!("Task Status: {:?}", task.status);
      // Handle the task status as needed
    }

    tokio::time::sleep(std::time::Duration::from_millis(10_000)).await;
  }
}
