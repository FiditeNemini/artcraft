use tokens::users::user::UserToken;

use crate::user_avatars::default_avatar_color_from_username::default_avatar_color_from_username;
use crate::user_avatars::default_avatar_from_username::default_avatar_from_username;

/// Everything we need to refer to a user on the public web interface.
#[derive(Clone, Serialize)]
pub struct UserDetailsLight {
  /// The token for the user
  pub user_token: UserToken,

  /// The unique username someone logs in with
  /// As of 2023-08-23, this is always lowercase
  pub username: String,

  /// As of 2023-08-23, this is the username with capitalization
  /// (In the future, a display name can be customized by the user.)
  pub display_name: String,

  /// Email hash for Gravatar
  /// Always set for now since login is email/username+password.
  /// In the future this will need to become an optional *OR* be filled with a bogus hash.
  pub gravatar_hash: String,

  /// For users without a gravatar, we show one of our own avatars.
  pub default_avatar: DefaultAvatarInfo,

  // In the future, we'll also support user-uploaded avatars that we store on our servers.
}

#[derive(Clone, Serialize)]
pub struct DefaultAvatarInfo {
  pub image_index: u8,
  pub color_index: u8,
}

impl DefaultAvatarInfo {
  /// Default avatars are based on username, not user token.
  /// NB(bt,2023-08-23): I think the thinking here was that we'd always have the
  /// username on hand and that it was more entropic.
  pub fn from_username(username: &str) -> Self {
    Self {
      image_index: default_avatar_from_username(username),
      color_index: default_avatar_color_from_username(username),
    }
  }
}
