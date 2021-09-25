use crate::util::anyhow_result::AnyhowResult;

// TODO: Not sure I need all of these. The less I need to keep, the better.
//  Oauth delegation in particular seems not necessary.
#[derive(Clone)]
pub struct TwitchSecrets {
  pub username: String,
  pub stream_key: String,
  pub app_client_id: String,
  pub app_client_secret: String,
  pub oauth_access_token: String,
}

impl TwitchSecrets {
  pub fn new(
    username: &str,
    stream_key: &str,
    app_client_id: &str,
    app_client_secret: &str,
    oauth_access_token: &str
  ) -> Self {
    Self {
      username: username.to_string(),
      stream_key: stream_key.to_string(),
      app_client_id: app_client_id.to_string(),
      app_client_secret: app_client_secret.to_string(),
      oauth_access_token: oauth_access_token.to_string(),
    }
  }

  pub fn from_env() -> AnyhowResult<Self> {
    Ok(Self::new(
      &easyenv::get_env_string_required("TWITCH_USERNAME")?,
      &easyenv::get_env_string_required("TWITCH_STREAM_KEY")?,
      &easyenv::get_env_string_required("TWITCH_APP_CLIENT_ID")?,
      &easyenv::get_env_string_required("TWITCH_APP_CLIENT_SECRET")?,
      &easyenv::get_env_string_required("TWITCH_OAUTH_ACCESS_TOKEN")?,
    ))
  }
}

