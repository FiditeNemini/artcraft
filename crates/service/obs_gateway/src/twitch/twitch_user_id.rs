use container_common::anyhow_result::AnyhowResult;

/// Twitch says to encode these as strings, but the Twitch libraries
/// still deal in integers. This centralizes type juggling.
#[derive(Clone)]
pub struct TwitchUserId {
  string_user_id: String,
  numeric_user_id: u32,
}

impl TwitchUserId {

  pub fn from_str(twitch_user_id: &str) -> AnyhowResult<Self> {
    let numeric_id = twitch_user_id.parse::<u32>()?;
    Ok(Self {
      string_user_id: twitch_user_id.to_string(),
      numeric_user_id: numeric_id,
    })
  }

  pub fn from_numeric(twitch_user_id: u32) -> Self {
    Self {
      string_user_id: twitch_user_id.to_string(),
      numeric_user_id: twitch_user_id,
    }
  }

  pub fn get_numeric(&self) -> u32 {
    self.numeric_user_id
  }

  pub fn get_str(&self) -> &str {
    &self.string_user_id
  }
}
