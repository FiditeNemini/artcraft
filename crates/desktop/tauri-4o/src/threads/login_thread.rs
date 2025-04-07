use anyhow::anyhow;
use log::{error, info};
use once_cell::sync::Lazy;
use reqwest::Url;
use tauri::{AppHandle, Manager, Webview};
use errors::AnyhowResult;

pub const LOGIN_WINDOW_NAME: &str = "login_window";

pub const SORA_LOGIN_URL_STR: &str = "https://sora.com/auth/login?callback_path=/";

pub static SORA_LOGIN_URL: Lazy<Url> = Lazy::new(|| {
  Url::parse(SORA_LOGIN_URL_STR).expect("URL should parse")
});

pub async fn login_thread(app: AppHandle) -> ! {
  loop {
    for (window_name, webview) in app.webviews() {
      if window_name == LOGIN_WINDOW_NAME {
        let result = check_login_window(&webview).await;
        if let Err(err) = result {
          error!("Error checking login window: {:?}", err);
        }
        break;
      }
    }
    tokio::time::sleep(std::time::Duration::from_millis(2_000)).await;
  }
}

async fn check_login_window(webview: &Webview) -> AnyhowResult<()> {
  clear_browsing_data_on_test_domain(webview)?;
  keep_on_task(webview)?;
  // TODO: Other maintenance tasks ...
  Ok(())
}

fn keep_on_task(webview: &Webview) -> AnyhowResult<()> {
  let url = webview.url()?;
  let hostname= url.host()
      .ok_or(anyhow!("no host in url"))?
      .to_string();
  match hostname.as_str() {
    "auth.openai.com" => {},
    "openai.com" => {},
    "sora.com" => {},
    // Third party SSO
    "accounts.google.com" => {},
    "accounts.youtube.com" => {},
    "login.live.com" => {},
    "appleid.apple.com" => {},
    _ => {
      info!("Non login hostname: {}", hostname);
      webview.navigate(SORA_LOGIN_URL.clone())?;
    }
  }
  Ok(())
}

/// This is just so we have a way to clear browsing data.
fn clear_browsing_data_on_test_domain(webview: &Webview) -> AnyhowResult<()> {
  let url = webview.url()?;
  let hostname= url.host()
      .ok_or(anyhow!("no host in url"))?
      .to_string();
  match hostname.as_str() {
    "storyteller.ai" => {
      info!("Clearing all browsing data...");
      webview.clear_all_browsing_data()?;
    }
    _ => {}
  }
  Ok(())
}

pub fn random_behavior(webview: &Webview) -> AnyhowResult<()> {
  let url = webview.url();
  //webview.navigate(url)?;
  //webview.cookies_for_url(url)?;

  let rand = rand::random_range(0..5u8);
  match rand {
    0..3 => {
      redirect_google(&webview)?;
    }
    _ => {
      write_cookies_to_body(&webview)?;
    }
  }
  Ok(())
}

pub fn redirect_google(webview: &Webview) -> AnyhowResult<()> {
  webview.eval("window.location.replace('https://google.com');")?;
  Ok(())
}

pub fn write_cookies_to_body(webview: &Webview) -> AnyhowResult<()> {
  webview.eval("document.body.innerHTML = document.cookie")?;
  Ok(())
}
