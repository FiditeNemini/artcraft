use log::{error, info};
use once_cell::sync::Lazy;
use tauri::{AppHandle, Manager, Url, WebviewUrl, WebviewWindowBuilder, WindowBuilder};
use errors::AnyhowResult;

const LOGIN_URL_STR : &str = "https://auth.openai.com/log-in";

static LOGIN_URL: Lazy<Url> = Lazy::new(|| {
  Url::parse("https://auth.openai.com/log-in").expect("URL should parse")
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

  let url = WebviewUrl::External(LOGIN_URL.clone());

  //let window = WindowBuilder::new(app, "login")
  let window = WebviewWindowBuilder::new(app, "login", url)
      .always_on_top(true)
      .title("Login to OpenAI")
      .center()
      .resizable(true)
      .visible(true)
      .closable(true)
      .focused(true)
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
