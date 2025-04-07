use log::{error, info};
use once_cell::sync::Lazy;
use tauri::{AppHandle, Manager, Url, WebviewUrl, WebviewWindowBuilder, WindowBuilder};
use errors::AnyhowResult;
use crate::threads::login_thread::{LOGIN_WINDOW_NAME, SORA_LOGIN_URL};

#[tauri::command]
pub async fn open_login_command(
  app: AppHandle,
) -> Result<String, String> {
  info!("open_login_command called");

  do_open_login(&app)
    .await
    .map_err(|err| {
      error!("Error opening login: {:?}", err);
      format!("Error opening login: {:?}", err)
    })?;

  Ok("result".to_string())
}

async fn do_open_login(app: &AppHandle) -> AnyhowResult<()> {
  info!("Building login window...");

  let url = WebviewUrl::External(SORA_LOGIN_URL.clone());

  let _window = WebviewWindowBuilder::new(app, LOGIN_WINDOW_NAME, url)
      .always_on_top(true)
      .title("Login to OpenAI")
      .center()
      .resizable(true)
      .visible(true)
      .closable(true)
      .focused(true)
      .devtools(true)
      .build()?;

  //info!("Iterating webviews...");
  //for (name, webview) in window.webviews() {
  //  info!("Webview URL: {:?}", webview.url());
  //  webview.navigate(LOGIN_URL.clone())?;
  //  webview.eval(&format!("window.location.replace('{}');", LOGIN_URL_STR))?;
  //}

  info!("Done.");
  Ok(())
}
