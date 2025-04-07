use log::{error, info};
use tauri::{AppHandle, WindowBuilder};

#[tauri::command]
pub async fn open_login_command(
  app: AppHandle,
) -> Result<String, String> {
  info!("open_login_command called");

  let _window_builder = WindowBuilder::new(&app, "login")
      .always_on_top(true)
      .title("Login")
      .resizable(true)
      .visible(true)
      .build()
      .map_err(|err| {
        error!("Failed to create window: {}", err);
        format!("Failed to create window: {}", err)
      })?;


  /*app.create_tao_window(move || {
    let window = tauri::window::WindowBuilder::from_config(&app, &app.config().app.windows.get(0).unwrap().clone())

    ("WGPU Target".to_string(), window_builder)
  });*/
/*    "login",
    tauri::WindowUrl::App("https://google.com".into()),
    tauri::WindowBuilder::new(
      &app,
      "login",
      tauri::WindowUrl::App("https://google.com".into()),
    )
    .title("Login")
    .inner_size(800.0, 600.0)
    .decorations(true)
    .resizable(true)
  ).map_err(|err| format!("Failed to create window: {}", err))?;*/

  Ok("result".to_string())
}