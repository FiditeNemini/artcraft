use anyhow::anyhow;
use chrono::{DateTime, Utc};
use container_common::anyhow_result::AnyhowResult;
use log::info;
use sqlx::MySqlPool;

pub struct TwitchOauthTokenInsertBuilder {
  // ===== Required Fields =====

  /// Exactly an INT(10) ~= UNSIGNED INTEGER
  twitch_user_id: u32,

  access_token: String,

  // ===== Optional / Default Fields =====

  /// Other half of the access token, for renewal
  maybe_refresh_token: Option<String>,

  /// Storyteller/FakeYou username.
  maybe_user_token: Option<String>,

  /// Twitch username / channel name.
  maybe_twitch_username: Option<String>,

  /// Probably 'bearer'
  token_type: Option<String>,

  /// TTL seconds from issue
  expires_in_seconds: Option<u32>,

  has_bits_read: bool,
  has_channel_read_subscriptions: bool,
  has_channel_read_redemptions: bool,
  has_user_read_follows: bool,
}

impl TwitchOauthTokenInsertBuilder {
  pub fn new(twitch_user_id: u32, access_token: &str) -> Self {
    Self {
      twitch_user_id,
      access_token: access_token.to_string(),
      maybe_refresh_token: None,
      maybe_user_token: None,
      maybe_twitch_username: None,
      token_type: None,
      expires_in_seconds: None,
      has_bits_read: false,
      has_channel_read_subscriptions: false,
      has_channel_read_redemptions: false,
      has_user_read_follows: false
    }
  }

  pub fn set_refresh_token(mut self, refresh_token: Option<&str>) -> Self {
    self.maybe_refresh_token = refresh_token.map(|t| t.to_string());
    self
  }

  pub fn set_user_token(mut self, maybe_user_token: Option<&str>) -> Self {
    self.maybe_user_token = maybe_user_token.map(|t| t.to_string());
    self
  }

  pub fn set_twitch_username(mut self, maybe_twitch_username: Option<&str>) -> Self {
    self.maybe_twitch_username = maybe_twitch_username.map(|t| t.to_string());
    self
  }

  pub fn set_token_type(mut self, token_type: Option<&str>) -> Self {
    self.token_type = token_type.map(|t| t.to_string());
    self
  }


  pub fn set_expires_in_seconds(mut self, expires_in_seconds: Option<u32>) -> Self {
    self.expires_in_seconds = expires_in_seconds;
    self
  }

  pub fn set_has_bits_read(mut self, has_bits_read: bool) -> Self {
    self.has_bits_read = has_bits_read;
    self
  }

  pub fn has_channel_read_subscriptions(mut self, channel_read_subscriptions: bool) -> Self {
    self.has_channel_read_subscriptions = channel_read_subscriptions;
    self
  }

  pub fn has_channel_read_redemptions(mut self, channel_read_redemptions: bool) -> Self {
    self.has_channel_read_redemptions = channel_read_redemptions;
    self
  }

  pub fn has_user_read_follows(mut self, has_user_read_follows: bool) -> Self {
    self.has_user_read_follows = has_user_read_follows;
    self
  }

  pub async fn insert(&mut self, mysql_pool: &MySqlPool) -> AnyhowResult<()> {
    // NB: We have to duplicate these since the string literals must not
    // include concatenation. Boo.
    let query = if let Some(expires_in_seconds) = self.expires_in_seconds {
      sqlx::query!(
        r#"
INSERT INTO twitch_oauth_tokens
SET
  maybe_user_token = ?,
  twitch_user_id = ?,
  maybe_twitch_username = ?,
  access_token = ?,
  maybe_refresh_token = ?,
  token_type = ?,
  expires_in_seconds = ?,
  has_bits_read = ?,
  has_channel_read_subscriptions = ?,
  has_channel_read_redemptions= ?,
  has_user_read_follows = ?,
  expires_at = DATE_ADD(NOW(), INTERVAL ? SECOND)
        "#,
        self.maybe_user_token.clone(),
        self.twitch_user_id.clone(),
        self.maybe_twitch_username.clone(),
        self.access_token.clone(),
        self.maybe_refresh_token.clone(),
        self.token_type.clone(),
        expires_in_seconds,
        self.has_bits_read.clone(),
        self.has_channel_read_subscriptions.clone(),
        self.has_channel_read_redemptions.clone(),
        self.has_user_read_follows.clone(),
        expires_in_seconds,
      )
    } else {
      sqlx::query!(
        r#"
INSERT INTO twitch_oauth_tokens
SET
  maybe_user_token = ?,
  twitch_user_id = ?,
  maybe_twitch_username = ?,
  access_token = ?,
  maybe_refresh_token = ?,
  token_type = ?,
  expires_in_seconds = NULL,
  has_bits_read = ?,
  has_channel_read_subscriptions = ?,
  has_channel_read_redemptions= ?,
  has_user_read_follows = ?,
  expires_at = NULL
        "#,
        self.maybe_user_token.clone(),
        self.twitch_user_id.clone(),
        self.maybe_twitch_username.clone(),
        self.access_token.clone(),
        self.maybe_refresh_token.clone(),
        self.token_type.clone(),
        self.has_bits_read.clone(),
        self.has_channel_read_subscriptions.clone(),
        self.has_channel_read_redemptions.clone(),
        self.has_user_read_follows.clone(),
      )
    };

    let query_result = query.execute(mysql_pool)
        .await;

    let _record_id = match query_result {
      Ok(res) => {
        res.last_insert_id()
      },
      Err(err) => {
        return Err(anyhow!("Twitch token insert DB error: {:?}", err));
      }
    };

    Ok(())
  }
}
