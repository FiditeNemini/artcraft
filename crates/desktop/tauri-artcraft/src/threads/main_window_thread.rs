use crate::state::app_dir::AppDataRoot;
use crate::state::main_window_size::MainWindowSize;
use errors::AnyhowResult;
use log::{error, info};
use tauri::{AppHandle, Manager, Webview, Window};

const MAIN_WINDOW_NAME : &str = "main";

pub async fn main_window_thread(
  app: AppHandle,
  app_data_root: AppDataRoot,
) -> ! {
  loop {
    for (window_name, window) in app.windows() {
      if window_name == MAIN_WINDOW_NAME {
        let result = handle_main_window(
          &window,
          &app_data_root,
        ).await;
        if let Err(err) = result {
          error!("Error handling main window: {:?}", err);
        }
      }
    }
    tokio::time::sleep(std::time::Duration::from_millis(1_000)).await;
  }
}

pub async fn handle_main_window(
  window: &Window,
  app_data_root: &AppDataRoot,
) -> AnyhowResult<()> {
  let mut window_size = MainWindowSize::from_window(window)?;

  loop {
    let old_size = window_size.to_physical_size();
    let new_size = window.inner_size()?;

    if !window_size.matches_physical_size(&new_size) {
      info!("Window size changed from {:?} to {:?}", old_size, new_size);
      window_size = MainWindowSize::from_window(&window)?;
      info!("Saving window size configs to disk...");
      window_size.persist_to_filesystem(app_data_root)?;
    }

    tokio::time::sleep(std::time::Duration::from_millis(10_000)).await;
  }
}