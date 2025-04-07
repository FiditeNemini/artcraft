use log::{error, info};
use tauri::{AppHandle, Manager, Webview};
use errors::AnyhowResult;

pub async fn login_thread(app: AppHandle) -> ! {
  loop {
    /*for (w, webview) in app.webviews() {
      info!("Sending webview {}", w);
      if let Err(err) = random_behavior(&webview) {
        error!("Error in webview : {:?}", err);
      }
    }*/
    tokio::time::sleep(std::time::Duration::from_millis(5_000)).await;
  }
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
