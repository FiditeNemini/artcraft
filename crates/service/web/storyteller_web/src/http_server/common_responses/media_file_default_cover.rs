use std::hash::{DefaultHasher, Hash, Hasher};
use utoipa::ToSchema;
use tokens::tokens::media_files::MediaFileToken;

use tokens::tokens::users::UserToken;

const NUMBER_OF_IMAGES : u64 = 10;
const NUMBER_OF_IMAGES_SALT_OFFSET : u8 = 5;

const NUMBER_OF_COLORS : u64 = 5;
const NUMBER_OF_COLORS_SALT_OFFSET : u8 = 1;

#[derive(Clone, Serialize,ToSchema)]
pub struct MediaFileDefaultCover {
  pub image_index: u8,
  pub color_index: u8,
}

impl MediaFileDefaultCover {
  pub fn from_token(token: &MediaFileToken) -> Self {
    Self {
      image_index: hash(token.as_str(), NUMBER_OF_IMAGES, NUMBER_OF_IMAGES_SALT_OFFSET),
      color_index: hash(token.as_str(), NUMBER_OF_COLORS, NUMBER_OF_COLORS_SALT_OFFSET),
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
    let token = MediaFileToken::new_from_str("asdf");
    let cover = MediaFileDefaultCover::from_token(&token);

    assert_eq!(cover.color_index, 3);
    assert_eq!(cover.image_index, 16);
  }
}
