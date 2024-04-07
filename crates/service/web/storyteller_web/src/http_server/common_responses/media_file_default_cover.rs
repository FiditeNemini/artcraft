use std::hash::{DefaultHasher, Hash, Hasher};

use utoipa::ToSchema;

use tokens::tokens::media_files::MediaFileToken;

/// There are currently 25 cover images numbered 0 to 24 (0-indexed).
/// The original dataset was numbered 1 - 25, but I renamed 25 to 0.
const NUMBER_OF_IMAGES : u64 = 25;
const NUMBER_OF_IMAGES_SALT_OFFSET : u8 = 5;

const NUMBER_OF_COLORS : u64 = 8;
const NUMBER_OF_COLORS_SALT_OFFSET : u8 = 1;

#[derive(Clone, Serialize,ToSchema)]
pub struct MediaFileDefaultCover {
  pub image_index: u8,
  pub color_index: u8,
}

impl MediaFileDefaultCover {
  /// Typical constructor
  pub fn from_token(token: &MediaFileToken) -> Self {
    Self::from_token_str(token.as_str())
  }

  /// For non-media file tokens (eg. emulated TTS results)
  pub fn from_token_str(token: &str) -> Self {
    Self {
      image_index: hash(token, NUMBER_OF_IMAGES, NUMBER_OF_IMAGES_SALT_OFFSET),
      color_index: hash(token, NUMBER_OF_COLORS, NUMBER_OF_COLORS_SALT_OFFSET),
    }
  }
}

fn hash(token: &str, max_number: u64, salt: u8) -> u8 {
  let mut hasher = DefaultHasher::new();

  token.hash(&mut hasher);
  salt.hash(&mut hasher);

  let hash = hasher.finish();

  let index= hash % max_number;
  index as u8
}

#[cfg(test)]
mod tests {
  use tokens::tokens::media_files::MediaFileToken;

  use crate::http_server::common_responses::media_file_default_cover::MediaFileDefaultCover;

  #[test]
  fn test() {
    let token = MediaFileToken::new_from_str("foo");
    let cover = MediaFileDefaultCover::from_token(&token);
    assert_eq!(cover.color_index, 5);
    assert_eq!(cover.image_index, 2);

    let token = MediaFileToken::new_from_str("bar");
    let cover = MediaFileDefaultCover::from_token(&token);
    assert_eq!(cover.color_index, 5);
    assert_eq!(cover.image_index, 3);

    let token = MediaFileToken::new_from_str("asdf");
    let cover = MediaFileDefaultCover::from_token(&token);
    assert_eq!(cover.color_index, 0);
    assert_eq!(cover.image_index, 23);
  }
}
