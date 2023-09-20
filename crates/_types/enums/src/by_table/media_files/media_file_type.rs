use serde::Deserialize;
use serde::Serialize;
#[cfg(test)]
use strum::EnumCount;
#[cfg(test)]
use strum::EnumIter;

/// Used in the `media_files` table in a `VARCHAR` field.
///
/// DO NOT CHANGE VALUES WITHOUT A MIGRATION STRATEGY.
#[cfg_attr(test, derive(EnumIter, EnumCount))]
#[derive(Clone, Copy, Eq, PartialEq, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum MediaFileType {
  /// Audio files: wav, mp3, etc.
  Audio,

  /// Image files: png, jpeg, etc.
  Image,

  /// Video files: mp4, etc.
  Video,
}

// TODO(bt, 2022-12-21): This desperately needs MySQL integration tests!
impl_enum_display_and_debug_using_to_str!(MediaFileType);
impl_mysql_enum_coders!(MediaFileType);

/// NB: Legacy API for older code.
impl MediaFileType {
  pub fn to_str(&self) -> &'static str {
    match self {
      Self::Audio => "audio",
      Self::Image => "image",
      Self::Video => "video",
    }
  }

  pub fn from_str(value: &str) -> Result<Self, String> {
    match value {
      "audio" => Ok(Self::Audio),
      "image" => Ok(Self::Image),
      "video" => Ok(Self::Video),
      _ => Err(format!("invalid value: {:?}", value)),
    }
  }
}

#[cfg(test)]
mod tests {
  use crate::by_table::media_files::media_file_type::MediaFileType;
  use crate::test_helpers::assert_serialization;

  #[test]
  fn test_serialization() {
    assert_serialization(MediaFileType::Audio, "audio");
    assert_serialization(MediaFileType::Image, "image");
    assert_serialization(MediaFileType::Video, "video");
  }

  #[test]
  fn test_to_str() {
    assert_eq!(MediaFileType::Audio.to_str(), "audio");
    assert_eq!(MediaFileType::Image.to_str(), "image");
    assert_eq!(MediaFileType::Video.to_str(), "video");
  }

  #[test]
  fn test_from_str() {
    assert_eq!(MediaFileType::from_str("audio").unwrap(), MediaFileType::Audio);
    assert_eq!(MediaFileType::from_str("image").unwrap(), MediaFileType::Image);
    assert_eq!(MediaFileType::from_str("video").unwrap(), MediaFileType::Video);
    assert!(MediaFileType::from_str("foo").is_err());
  }
}
