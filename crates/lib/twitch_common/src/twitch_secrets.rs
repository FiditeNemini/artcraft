use container_common::anyhow_result::AnyhowResult;

/// Standardized way to read Twitch secrets.
/// These are used in several different apps.
#[derive(Clone, serde::Deserialize)]
pub struct TwitchSecrets {
  pub app_client_id: String,
  pub app_client_secret: String,
}

impl TwitchSecrets {
  pub fn new(
    app_client_id: &str,
    app_client_secret: &str,
  ) -> Self {
    Self {
      app_client_id: app_client_id.to_string(),
      app_client_secret: app_client_secret.to_string(),
    }
  }

  pub fn from_env() -> AnyhowResult<Self> {
    Ok(Self::new(
      &easyenv::get_env_string_required("TWITCH_APP_CLIENT_ID")?,
      &easyenv::get_env_string_required("TWITCH_APP_CLIENT_SECRET")?,
    ))
  }
}

