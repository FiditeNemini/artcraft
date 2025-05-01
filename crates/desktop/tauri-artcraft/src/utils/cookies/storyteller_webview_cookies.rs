use errors::AnyhowResult;
use once_cell::sync::Lazy;
use reqwest::Url;
use storyteller_client::credentials::storyteller_avt_cookie::StorytellerAvtCookie;
use storyteller_client::credentials::storyteller_credential_set::StorytellerCredentialSet;
use storyteller_client::credentials::storyteller_session_cookie::StorytellerSessionCookie;
use tauri::Webview;

const STORYTELLER_ROOT_COOKIE_URL_STR: &str = "https://api.storyteller.ai/";

static STORYTELLER_ROOT_COOKIE_URL: Lazy<Url> = Lazy::new(|| {
  Url::parse(STORYTELLER_ROOT_COOKIE_URL_STR).expect("URL should parse")
});

const AVT_COOKIE_NAME : &str = "visitor";
const SESSION_COOKIE_NAME : &str = "session";

pub fn get_storyteller_cookies(webview: &Webview) -> AnyhowResult<StorytellerCredentialSet> {
  let cookies = webview.cookies_for_url(STORYTELLER_ROOT_COOKIE_URL.clone())?;
  
  let mut avt_cookie = None;
  let mut session_cookie = None;
  
  for cookie in cookies.into_iter() {
    if let Some(avt) = StorytellerAvtCookie::maybe_from_cookie(&cookie) {
      avt_cookie = Some(avt);
    } else if let Some(session) = StorytellerSessionCookie::maybe_from_cookie(&cookie) {
      session_cookie = Some(session);
    }
  }
  
  Ok(StorytellerCredentialSet::initialize(
    avt_cookie,
    session_cookie,
  ))
}
