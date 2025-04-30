use crate::state::app_dir::AppDataRoot;
use crate::state::sora::sora_credential_manager::SoraCredentialManager;
use crate::state::sora::sora_task_queue::SoraTaskQueue;
use errors::AnyhowResult;
use log::{error, info};
use openai_sora_client::recipes::list_sora_task_status_with_session_auto_renew::{list_sora_task_status_with_session_auto_renew, StatusRequestArgs};
use openai_sora_client::requests::image_gen::image_gen_status::{TaskId, TaskStatus};
use tauri::AppHandle;

pub async fn sora_task_polling_thread(
  app_data_root: AppDataRoot,
  sora_creds_manager: SoraCredentialManager,
  sora_task_queue: SoraTaskQueue,
) -> ! {
  loop {
    let res = polling_loop(&sora_creds_manager, &sora_task_queue).await;
    if let Err(err) = res {
      error!("An error occurred: {:?}", err);
    }
    tokio::time::sleep(std::time::Duration::from_millis(30_000)).await;
  }
}

async fn polling_loop(
  sora_creds_manager: &SoraCredentialManager,
  sora_task_queue: &SoraTaskQueue,
) -> AnyhowResult<()> {
  loop {
    if sora_task_queue.is_empty()? {
      // No need to poll if we don't have pending tasks.
      tokio::time::sleep(std::time::Duration::from_millis(1_000)).await;
      continue;
    }

    info!("Task queue has {} pending tasks.", sora_task_queue.len()?);

    let creds = sora_creds_manager.get_credentials_required()?;

    let (response, maybe_new_creds) = list_sora_task_status_with_session_auto_renew(StatusRequestArgs {
      limit: None,
      // TODO: How can we use the task id to poll better? Our existing code doesn't seem to illuminate this.
      before: None,
      credentials: creds,
    }).await?;

    if let Some(new_creds) = maybe_new_creds {
      info!("Saving new credentials.");
      sora_creds_manager.set_credentials(&new_creds)?;
    }

    let mut succeeded_tasks = Vec::new();
    let mut failed_tasks = Vec::new();

    // TODO: The cursoring logic likely needs to improve.
    for task in response.task_responses {
      let status = TaskStatus::from_str(&task.status);

      match status {
        TaskStatus::Succeeded => {
          succeeded_tasks.push(task);
        }
        TaskStatus::Failed => {
          failed_tasks.push(task);
        }
        TaskStatus::Queued => {}
        TaskStatus::Running => {}
        TaskStatus::Unknown(_) => {}
      }
    }

    let failed_task_ids: Vec<&TaskId> = failed_tasks
        .iter()
        .map(|task| &task.id)
        .collect();

    sora_task_queue.remove_list(&failed_task_ids)?;

    // TODO: Handle succeeded tasks.

    let succeeded_task_ids : Vec<&TaskId> = succeeded_tasks
        .iter()
        .map(|task| &task.id)
        .collect();

    sora_task_queue.remove_list(&succeeded_task_ids)?;

    tokio::time::sleep(std::time::Duration::from_millis(2_000)).await;
  }
}
