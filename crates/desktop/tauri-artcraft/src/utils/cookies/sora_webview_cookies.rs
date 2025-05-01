use once_cell::sync::Lazy;
use reqwest::Url;
use tauri::Webview;
use tauri::webview::Cookie;
use errors::AnyhowResult;

const SORA_ROOT_COOKIE_URL_STR: &str = "https://sora.com/";

static SORA_ROOT_COOKIE_URL: Lazy<Url> = Lazy::new(|| {
  Url::parse(SORA_ROOT_COOKIE_URL_STR).expect("URL should parse")
});

pub fn get_all_sora_cookies(webview: &Webview) -> AnyhowResult<Vec<Cookie>> {
  let cookies = webview.cookies_for_url(SORA_ROOT_COOKIE_URL.clone())?;
  Ok(cookies)
}

pub fn get_all_sora_cookies_as_string(webview: &Webview) -> AnyhowResult<String> {
  let cookies = get_all_sora_cookies(webview)?;
  let cookie_string = cookies
    .iter()
    .map(|cookie| format!("{}={}", cookie.name(), cookie.value()))
    .collect::<Vec<String>>()
    .join("; ");
  Ok(cookie_string)
}
