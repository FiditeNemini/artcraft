use crate::ml::downloads::download_all_models::download_all_models;
use crate::state::app_config::AppConfig;
use tauri::{AppHandle, State};

#[tauri::command]
pub async fn download_models(
  model_config: State<'_, AppConfig>,
  app: AppHandle,
) -> Result<String, String> {
  
  download_all_models().await
    .map_err(|err| {
      "error downloading models".to_string()
    })?;
  
  Ok(("downloaded".to_string()))
}
