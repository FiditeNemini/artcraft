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
pub enum MediaFileSubtype {
  /// Animation file from Mixamo
  /// Primarily used for FBX and GLB.
  Mixamo,

  /// Animation file from MocapNet
  /// Primarily used for BVH.
  MocapNet,

  /// Generic 3D scene file.
  /// Can pertain to BVH, GLB, FBX, etc.
  Scene,
}

// TODO(bt, 2022-12-21): This desperately needs MySQL integration tests!
impl_enum_display_and_debug_using_to_str!(MediaFileSubtype);
impl_mysql_enum_coders!(MediaFileSubtype);
impl_mysql_from_row!(MediaFileSubtype);

/// NB: Legacy API for older code.
impl MediaFileSubtype {
  pub fn to_str(&self) -> &'static str {
    match self {
      Self::Mixamo => "mixamo",
      Self::Scene => "scene",
      Self::MocapNet => "mocap_net",
    }
  }

  pub fn from_str(value: &str) -> Result<Self, String> {
    match value {
      "mixamo" => Ok(Self::Mixamo),
      "mocap_net" => Ok(Self::MocapNet),
      "scene" => Ok(Self::Scene),
      _ => Err(format!("invalid value: {:?}", value)),
    }
  }

  pub fn all_variants() -> BTreeSet<Self> {
    // NB: BTreeSet is sorted
    // NB: BTreeSet::from() isn't const, but not worth using LazyStatic, etc.
    BTreeSet::from([
      Self::Mixamo,
      Self::MocapNet,
      Self::Scene,
    ])
  }
}

#[cfg(test)]
mod tests {
  use crate::by_table::media_files::media_file_subtype::MediaFileSubtype;
  use crate::test_helpers::assert_serialization;

  mod explicit_checks {
    use super::*;

    #[test]
    fn test_serialization() {
      assert_serialization(MediaFileSubtype::Mixamo, "mixamo");
      assert_serialization(MediaFileSubtype::MocapNet, "mocap_net");
      assert_serialization(MediaFileSubtype::Scene, "scene");
    }

    #[test]
    fn test_to_str() {
      assert_eq!(MediaFileSubtype::Mixamo.to_str(), "mixamo");
      assert_eq!(MediaFileSubtype::MocapNet.to_str(), "mocap_net");
      assert_eq!(MediaFileSubtype::Scene.to_str(), "scene");
    }

    #[test]
    fn test_from_str() {
      assert_eq!(MediaFileSubtype::from_str("mixamo").unwrap(), MediaFileSubtype::Mixamo);
      assert_eq!(MediaFileSubtype::from_str("mocap_net").unwrap(), MediaFileSubtype::MocapNet);
      assert_eq!(MediaFileSubtype::from_str("scene").unwrap(), MediaFileSubtype::Scene);
      assert!(MediaFileSubtype::from_str("foo").is_err());
    }

    #[test]
    fn all_variants() {
      let mut variants = MediaFileSubtype::all_variants();
      assert_eq!(variants.len(), 3);
      assert_eq!(variants.pop_first(), Some(MediaFileSubtype::Mixamo));
      assert_eq!(variants.pop_first(), Some(MediaFileSubtype::MocapNet));
      assert_eq!(variants.pop_first(), Some(MediaFileSubtype::Scene));
      assert_eq!(variants.pop_first(), None);
    }
  }

  mod mechanical_checks {
    use super::*;

    #[test]
    fn variant_length() {
      use strum::IntoEnumIterator;
      assert_eq!(MediaFileSubtype::all_variants().len(), MediaFileSubtype::iter().len());
    }

    #[test]
    fn round_trip() {
      for variant in MediaFileSubtype::all_variants() {
        assert_eq!(variant, MediaFileSubtype::from_str(variant.to_str()).unwrap());
        assert_eq!(variant, MediaFileSubtype::from_str(&format!("{}", variant)).unwrap());
        assert_eq!(variant, MediaFileSubtype::from_str(&format!("{:?}", variant)).unwrap());
      }
    }

    #[test]
    fn serialized_length_ok_for_database() {
      const MAX_LENGTH : usize = 32;
      for variant in MediaFileSubtype::all_variants() {
        let serialized = variant.to_str();
        assert!(serialized.len() > 0, "variant {:?} is too short", variant);
        assert!(serialized.len() <= MAX_LENGTH, "variant {:?} is too long", variant);
      }
    }
  }
}
