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
#[serde(rename_all = "snake_case")]
pub enum MediaFileOriginModelType {
  /// SadTalker -- v1, we may add another enum value for future versions
  SadTalker,
}

// TODO(bt, 2022-12-21): This desperately needs MySQL integration tests!
impl_enum_display_and_debug_using_to_str!(MediaFileOriginModelType);
impl_mysql_enum_coders!(MediaFileOriginModelType);

/// NB: Legacy API for older code.
impl MediaFileOriginModelType {
  pub fn to_str(&self) -> &'static str {
    match self {
      Self::SadTalker => "sad_talker",
    }
  }

  pub fn from_str(value: &str) -> Result<Self, String> {
    match value {
      "sad_talker" => Ok(Self::SadTalker),
      _ => Err(format!("invalid value: {:?}", value)),
    }
  }
}

#[cfg(test)]
mod tests {
  use crate::by_table::media_files::media_file_origin_model_type::MediaFileOriginModelType;
  use crate::test_helpers::assert_serialization;

  #[test]
  fn test_serialization() {
    assert_serialization(MediaFileOriginModelType::SadTalker, "sad_talker");
  }

  #[test]
  fn test_to_str() {
    assert_eq!(MediaFileOriginModelType::SadTalker.to_str(), "sad_talker");
  }

  #[test]
  fn test_from_str() {
    assert_eq!(MediaFileOriginModelType::from_str("sad_talker").unwrap(), MediaFileOriginModelType::SadTalker);
    assert!(MediaFileOriginModelType::from_str("foo").is_err());
  }
}
