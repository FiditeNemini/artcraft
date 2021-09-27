//! The Helix client is independent of PubSub
//! This just wraps `twitch_api2` for more convenience.

use crate::util::anyhow_result::AnyhowResult;
use twitch_api2::helix::users::GetUsersRequest;
use anyhow::anyhow;
use twitch_api2::TwitchClient;
use twitch_oauth2::{ClientSecret, ClientId, AccessToken, AppAccessToken, Scope};
use twitch_api2::types::{Nickname, UserId};

pub struct TwitchClientWrapper<'a> {
  client_id: ClientId,
  client_secret: ClientSecret,
  twitch_client: TwitchClient<'a, reqwest::Client>,
  access_token: Option<AppAccessToken>,
}

impl <'a> TwitchClientWrapper <'a> {
  pub fn new(client_id: ClientId, client_secret: ClientSecret) -> Self {
    Self {
      client_id,
      client_secret,
      twitch_client: TwitchClient::default(),
      access_token: None,
    }
  }

  pub async fn request_access_token(&mut self, scopes: Vec<Scope>) -> AnyhowResult<()> {
    self.get_access_token(scopes).await?;
    Ok(())
  }

  async fn get_access_token(&mut self, scopes: Vec<Scope>) -> AnyhowResult<()> {
    let mut http_client = reqwest::Client::new();
    let access_token = twitch_oauth2::AppAccessToken::get_app_access_token(
      &http_client,
      self.client_id.clone(),
      self.client_secret.clone(),
      scopes,
    ).await?;

    self.access_token = Some(access_token);
    Ok(())
  }

  /// We frequently need to look up IDs from usernames.
  pub async fn get_user_id_from_username(&self, username: &str) -> AnyhowResult<u64> {
    let access_token = match self.access_token {
      None => return Err(anyhow!("no access token has been granted")),
      Some(ref token) => token,
    };

    let req = GetUsersRequest::builder()
        .login(vec![Nickname::new(username)])
        .build();

    let response = &self.twitch_client.helix.req_get(req, access_token)
        .await?;

    match response.data.get(0) {
      None => Err(anyhow!("No such user: `{}`.", username)),
      Some(user) => Ok(user.id.as_str().parse::<u64>()?),
    }
  }
}
