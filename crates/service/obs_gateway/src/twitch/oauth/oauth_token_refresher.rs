use anyhow::anyhow;
use container_common::anyhow_result::AnyhowResult;
use reqwest::Client;
use reqwest::redirect::Policy;
use std::time::Duration;
use twitch_oauth2::{ClientId, ClientSecret, RefreshToken, AccessToken};

/// Refresh OAuth tokens when they expire.
/// NB: This can be cloned and passed around.
#[derive(Clone)]
pub struct OauthTokenRefresher {
  http_client: Client,
  client_id: ClientId,
  client_secret: ClientSecret,
}

pub struct RefreshTokenResult {
  pub access_token: AccessToken,
  pub duration: Duration,
  pub maybe_refresh_token: Option<RefreshToken>,
}

impl OauthTokenRefresher {

  pub fn from_secrets(client_id: ClientId, client_secret: ClientSecret) -> AnyhowResult<Self> {
    let http_client = Client::builder()
        .redirect(Policy::none())
        .build()?;
    Ok(Self {
      http_client,
      client_id,
      client_secret,
    })
  }

  pub fn from_secrets_str(client_id: &str, client_secret: &str) -> AnyhowResult<Self> {
    let client_id = ClientId::new(client_id);
    let client_secret = ClientSecret::new(client_secret);
    Self::from_secrets(client_id, client_secret)
  }

  /// Perform a token refresh
  pub async fn refresh_token(&self, refresh_token: &str) -> AnyhowResult<RefreshTokenResult> {
    let refresh_token = RefreshToken::new(refresh_token);
    let result = twitch_oauth2::refresh_token(
      &self.http_client,
      &refresh_token,
      &self.client_id,
      &self.client_secret)
        .await
        .map(|(access_token, duration, maybe_refresh_token)| {
          RefreshTokenResult {
            access_token,
            duration,
            maybe_refresh_token,
          }
        })?;
    Ok(result)
  }
}