use std::time::Duration;
use log::{error, info};
use once_cell::sync::Lazy;
use tauri::{AppHandle, Manager, Url, WebviewUrl, WebviewWindowBuilder, WindowBuilder};
use tokio::time::sleep_until;
use errors::AnyhowResult;
use crate::threads::login_thread::{LOGIN_WINDOW_NAME, SORA_LOGIN_URL};
use crate::utils::clear_all_webview_cookies::clear_all_webview_cookies;

pub const START_URL_STR: &str = "https://storyteller.ai/";

pub static START_URL: Lazy<Url> = Lazy::new(|| {
  Url::parse(START_URL_STR).expect("URL should parse")
});

pub const SORA_HOMEPAGE_URL_STR: &str = "https://sora.com/";

pub static SORA_HOMEPAGE_URL : Lazy<Url> = Lazy::new(|| {
  Url::parse(SORA_HOMEPAGE_URL_STR).expect("URL should parse")
});

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

  let url = WebviewUrl::External(START_URL.clone());

  let window = WebviewWindowBuilder::new(app, LOGIN_WINDOW_NAME, url)
      //.user_agent(openai_sora_client::credentials::USER_AGENT)
      .always_on_top(true)
      .title("Login to OpenAI")
      .center()
      .resizable(true)
      .visible(true)
      .closable(true)
      .focused(true)
      .devtools(true)
      .build()?;

  for (name, webview) in window.webviews() {
    if name != LOGIN_WINDOW_NAME {
      continue;
    }

    clear_all_webview_cookies(&webview)?;

    // NB: We're starting to get Cloudflare protection screens. Let's try to avoid.
    webview.navigate(SORA_HOMEPAGE_URL.clone())?;
    tokio::time::sleep(Duration::from_millis(100)).await;

    webview.navigate(SORA_LOGIN_URL.clone())?;
    break;
  }

  info!("Done.");
  Ok(())
}
