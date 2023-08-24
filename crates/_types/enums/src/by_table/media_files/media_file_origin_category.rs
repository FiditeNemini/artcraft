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
pub enum MediaFileOriginCategory {
  /// ML model inference output - uploaded models or zero shot.
  Inference,

  /// Processed results - (we don't have these systems yet, but eg. trim, transcode, etc).
  Processed,

  /// User uploaded files
  Upload,
}

// TODO(bt, 2022-12-21): This desperately needs MySQL integration tests!
impl_enum_display_and_debug_using_to_str!(MediaFileOriginCategory);
impl_mysql_enum_coders!(MediaFileOriginCategory);

/// NB: Legacy API for older code.
impl MediaFileOriginCategory {
  pub fn to_str(&self) -> &'static str {
    match self {
      Self::Inference => "inference",
      Self::Processed => "processed",
      Self::Upload => "upload",
    }
  }

  pub fn from_str(value: &str) -> Result<Self, String> {
    match value {
      "inference" => Ok(Self::Inference),
      "processed" => Ok(Self::Processed),
      "upload" => Ok(Self::Upload),
      _ => Err(format!("invalid value: {:?}", value)),
    }
  }
}

#[cfg(test)]
mod tests {
  use crate::by_table::media_files::media_file_origin_category::MediaFileOriginCategory;
  use crate::test_helpers::assert_serialization;

  #[test]
  fn test_serialization() {
    assert_serialization(MediaFileOriginCategory::Inference, "inference");
    assert_serialization(MediaFileOriginCategory::Processed, "processed");
    assert_serialization(MediaFileOriginCategory::Upload, "upload");
  }

  #[test]
  fn test_to_str() {
    assert_eq!(MediaFileOriginCategory::Inference.to_str(), "inference");
    assert_eq!(MediaFileOriginCategory::Processed.to_str(), "processed");
    assert_eq!(MediaFileOriginCategory::Upload.to_str(), "upload");
  }

  #[test]
  fn test_from_str() {
    assert_eq!(MediaFileOriginCategory::from_str("inference").unwrap(), MediaFileOriginCategory::Inference);
    assert_eq!(MediaFileOriginCategory::from_str("processed").unwrap(), MediaFileOriginCategory::Processed);
    assert_eq!(MediaFileOriginCategory::from_str("upload").unwrap(), MediaFileOriginCategory::Upload);
    assert!(MediaFileOriginCategory::from_str("foo").is_err());
  }
}
