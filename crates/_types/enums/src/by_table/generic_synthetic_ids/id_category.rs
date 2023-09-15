use std::collections::BTreeSet;

#[cfg(test)]
use strum::EnumCount;
#[cfg(test)]
use strum::EnumIter;


/// Used in the `generic_synthetic_ids` table in `VARCHAR(32)` field `id_category`.
///
/// This lets us create synthetic increment IDs on a per-user, per-category basis.
///
/// DO NOT CHANGE VALUES WITHOUT A MIGRATION STRATEGY.
#[cfg_attr(test, derive(EnumIter, EnumCount))]
#[derive(Clone, Copy, Eq, PartialEq, Hash, Ord, PartialOrd, Deserialize, Serialize)]
pub enum IdCategory {
  /// media_files table
  #[serde(rename = "media_file")]
  MediaFile,

  /// Results from lipsync animations (which may live in the media_files table)
  #[serde(rename = "lipsync_animation")]
  LipsyncAnimation,
}

// TODO(bt, 2022-12-21): This desperately needs MySQL integration tests!
impl_enum_display_and_debug_using_to_str!(IdCategory);
impl_mysql_enum_coders!(IdCategory);

/// NB: Legacy API for older code.
impl IdCategory {
  pub fn to_str(&self) -> &'static str {
    match self {
      Self::MediaFile => "media_file",
      Self::LipsyncAnimation => "lipsync_animation",
    }
  }

  pub fn from_str(value: &str) -> Result<Self, String> {
    match value {
      "media_file" => Ok(Self::MediaFile),
      "lipsync_animation" => Ok(Self::LipsyncAnimation),
      _ => Err(format!("invalid value: {:?}", value)),
    }
  }

  pub fn all_variants() -> BTreeSet<Self> {
    // NB: BTreeSet is sorted
    // NB: BTreeSet::from() isn't const, but not worth using LazyStatic, etc.
    BTreeSet::from([
      Self::MediaFile,
      Self::LipsyncAnimation,
    ])
  }
}

#[cfg(test)]
mod tests {
  use crate::by_table::generic_synthetic_ids::id_category::IdCategory;
  use crate::test_helpers::assert_serialization;

  #[test]
  fn test_serialization() {
    assert_serialization(IdCategory::MediaFile, "media_file");
    assert_serialization(IdCategory::LipsyncAnimation, "lipsync_animation");
  }

  #[test]
  fn to_str() {
    assert_eq!(IdCategory::MediaFile.to_str(), "media_file");
    assert_eq!(IdCategory::LipsyncAnimation.to_str(), "lipsync_animation");
  }

  #[test]
  fn from_str() {
    assert_eq!(IdCategory::from_str("media_file").unwrap(), IdCategory::MediaFile);
    assert_eq!(IdCategory::from_str("lipsync_animation").unwrap(), IdCategory::LipsyncAnimation);
  }

  #[test]
  fn all_variants() {
    // Static check
    let mut variants = IdCategory::all_variants();
    assert_eq!(variants.len(), 2);
    assert_eq!(variants.pop_first(), Some(IdCategory::MediaFile));
    assert_eq!(variants.pop_first(), Some(IdCategory::LipsyncAnimation));
    assert_eq!(variants.pop_first(), None);

    // Generated check
    use strum::IntoEnumIterator;
    assert_eq!(IdCategory::all_variants().len(), IdCategory::iter().len());
  }
}
