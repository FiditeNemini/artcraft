pub mod commands;
pub mod events;
pub mod state;
pub mod threads;
pub mod transfer;
pub mod utils;

use crate::commands::flip_image::flip_image;
use crate::commands::image_generation_command::image_generation_command;
use crate::state::app_config::AppConfig;
use crate::threads::login_thread::login_thread;

use tauri_plugin_log::Target;
use tauri_plugin_log::TargetKind;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  // NB: Tauri wants to install the logger itself, so we can't rely on the logger crate 
  // until the tauri runtime begins.
  println!("Loading model config...");

  let config = AppConfig::init()
    .expect("config should load");


  let app_data_root = config.app_data_root.clone();
  let app_data_root2 = config.app_data_root.clone();

  println!("Initializing backend runtime...");

  tauri::Builder::default()
    .plugin(tauri_plugin_log::Builder::new()
      .level(log::LevelFilter::Info)
      .targets(vec![
        Target::new(TargetKind::Stdout),
        Target::new(TargetKind::LogDir { file_name: Some(app_data_root.log_file_name_str().to_string()) }),
      ])
      .build())
    .setup(|app| {
      // TODO(bt): This is broken on windows
      // log_environment_details();

      //if cfg!(debug_assertions) {
      //  app.handle().plugin(
      //    tauri_plugin_log::Builder::default()
      //      .level(log::LevelFilter::Info)
      //      .build(),
      //  )?;
      //}
      let app = app.handle().clone();

      tauri::async_runtime::spawn(login_thread(app));

      Ok(())
    })
    .manage(config)
    .manage(app_data_root)
    .invoke_handler(tauri::generate_handler![
      flip_image,
      image_generation_command,
    ])
    .run(tauri::generate_context!("tauri.conf.json"))
    .expect("error while running tauri application");
}
