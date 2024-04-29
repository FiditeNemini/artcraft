use std::collections::BTreeSet;

use serde::Deserialize;
use serde::Serialize;
#[cfg(test)]
use strum::EnumCount;
#[cfg(test)]
use strum::EnumIter;
use utoipa::ToSchema;

/// Used in the `media_files` table in a `VARCHAR` field.
///
/// DO NOT CHANGE VALUES WITHOUT A MIGRATION STRATEGY.
#[cfg_attr(test, derive(EnumIter, EnumCount))]
#[derive(Clone, Copy, Eq, PartialEq, Hash, Ord, PartialOrd, Deserialize, Serialize, ToSchema)]
#[serde(rename_all = "snake_case")]
pub enum MediaFileEngineCategory {
  /// A 3D scene full of objects, characters, animations, etc.
  Scene,

  /// A 3D character model.
  Character,

  /// A 3D animation.
  Animation,

  /// A 3D object that doesn't fit with the other types.
  Object,

  /// A 3D skybox.
  Skybox,
}

// TODO(bt, 2022-12-21): This desperately needs MySQL integration tests!
impl_enum_display_and_debug_using_to_str!(MediaFileEngineCategory);
impl_mysql_enum_coders!(MediaFileEngineCategory);
impl_mysql_from_row!(MediaFileEngineCategory);

/// NB: Legacy API for older code.
impl MediaFileEngineCategory {
  pub fn to_str(&self) -> &'static str {
    match self {
      Self::Scene => "scene",
      Self::Character => "character",
      Self::Animation => "animation",
      Self::Object => "object",
      Self::Skybox => "skybox",
    }
  }

  pub fn from_str(value: &str) -> Result<Self, String> {
    match value {
      "scene" => Ok(Self::Scene),
      "character" => Ok(Self::Character),
      "animation" => Ok(Self::Animation),
      "object" => Ok(Self::Object),
      "skybox" => Ok(Self::Skybox),
      _ => Err(format!("invalid value: {:?}", value)),
    }
  }

  pub fn all_variants() -> BTreeSet<Self> {
    // NB: BTreeSet is sorted
    // NB: BTreeSet::from() isn't const, but not worth using LazyStatic, etc.
    BTreeSet::from([
      Self::Scene,
      Self::Character,
      Self::Animation,
      Self::Object,
      Self::Skybox,
    ])
  }
}

#[cfg(test)]
mod tests {
  use crate::by_table::media_files::media_file_engine_category::MediaFileEngineCategory;
  use crate::test_helpers::assert_serialization;

  mod explicit_checks {
    use super::*;

    #[test]
    fn test_serialization() {
      assert_serialization(MediaFileEngineCategory::Scene, "scene");
      assert_serialization(MediaFileEngineCategory::Character, "character");
      assert_serialization(MediaFileEngineCategory::Animation, "animation");
      assert_serialization(MediaFileEngineCategory::Object, "object");
      assert_serialization(MediaFileEngineCategory::Skybox, "skybox");
    }

    #[test]
    fn test_to_str() {
      assert_eq!(MediaFileEngineCategory::Scene.to_str(), "scene");
      assert_eq!(MediaFileEngineCategory::Character.to_str(), "character");
      assert_eq!(MediaFileEngineCategory::Animation.to_str(), "animation");
      assert_eq!(MediaFileEngineCategory::Object.to_str(), "object");
      assert_eq!(MediaFileEngineCategory::Skybox.to_str(), "skybox");
    }

    #[test]
    fn test_from_str() {
      assert_eq!(MediaFileEngineCategory::from_str("scene").unwrap(), MediaFileEngineCategory::Scene);
      assert_eq!(MediaFileEngineCategory::from_str("character").unwrap(), MediaFileEngineCategory::Character);
      assert_eq!(MediaFileEngineCategory::from_str("animation").unwrap(), MediaFileEngineCategory::Animation);
      assert_eq!(MediaFileEngineCategory::from_str("object").unwrap(), MediaFileEngineCategory::Object);
      assert_eq!(MediaFileEngineCategory::from_str("skybox").unwrap(), MediaFileEngineCategory::Skybox);
      assert!(MediaFileEngineCategory::from_str("foo").is_err());
    }

    #[test]
    fn all_variants() {
      let mut variants = MediaFileEngineCategory::all_variants();
      assert_eq!(variants.len(), 5);
      assert_eq!(variants.pop_first(), Some(MediaFileEngineCategory::Scene));
      assert_eq!(variants.pop_first(), Some(MediaFileEngineCategory::Character));
      assert_eq!(variants.pop_first(), Some(MediaFileEngineCategory::Animation));
      assert_eq!(variants.pop_first(), Some(MediaFileEngineCategory::Object));
      assert_eq!(variants.pop_first(), Some(MediaFileEngineCategory::Skybox));
      assert_eq!(variants.pop_first(), None);
    }
  }

  mod mechanical_checks {
    use super::*;

    #[test]
    fn variant_length() {
      use strum::IntoEnumIterator;
      assert_eq!(MediaFileEngineCategory::all_variants().len(), MediaFileEngineCategory::iter().len());
    }

    #[test]
    fn round_trip() {
      for variant in MediaFileEngineCategory::all_variants() {
        assert_eq!(variant, MediaFileEngineCategory::from_str(variant.to_str()).unwrap());
        assert_eq!(variant, MediaFileEngineCategory::from_str(&format!("{}", variant)).unwrap());
        assert_eq!(variant, MediaFileEngineCategory::from_str(&format!("{:?}", variant)).unwrap());
      }
    }

    #[test]
    fn serialized_length_ok_for_database() {
      const MAX_LENGTH : usize = 16;
      for variant in MediaFileEngineCategory::all_variants() {
        let serialized = variant.to_str();
        assert!(serialized.len() > 0, "variant {:?} is too short", variant);
        assert!(serialized.len() <= MAX_LENGTH, "variant {:?} is too long", variant);
      }
    }
  }
}
