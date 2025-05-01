use log::info;
use tauri::Window;
use errors::AnyhowResult;
use crate::state::data_dir::app_data_root::AppDataRoot;
use crate::state::main_window_size::MainWindowSize;

pub async fn persist_window_resize_task(
  window: &Window,
  app_data_root: &AppDataRoot,
) -> AnyhowResult<()> {
  let mut window_size = MainWindowSize::from_window(window)?;

  let new_size = window.inner_size()?;

  // TODO: Temporary regression. This used to work, but we no longer have old state to compare against.
  // if !window_size.matches_physical_size(&new_size) {
  //   let old_size = window_size.to_physical_size();
  //   info!("Window size changed from {:?} to {:?}", old_size, new_size);
  //   window_size = MainWindowSize::from_window(&window)?;
  //   info!("Saving window size configs to disk...");
  //   window_size.persist_to_filesystem(app_data_root)?;
  // }

  Ok(())
}

