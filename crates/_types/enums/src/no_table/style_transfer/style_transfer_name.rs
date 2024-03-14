use std::collections::BTreeSet;

#[cfg(test)]
use strum::EnumCount;
#[cfg(test)]
use strum::EnumIter;
use utoipa::ToSchema;

/// This enum is not backed by a particular database table.
/// It's used in APIs and Jobs to agree upon ComfyUI style transfer style configurations.
///
/// DO NOT CHANGE VALUES WITHOUT A MIGRATION STRATEGY.
#[cfg_attr(test, derive(EnumIter, EnumCount))]
#[derive(Clone, Copy, Eq, PartialEq, Ord, PartialOrd, Hash, Deserialize, Serialize, ToSchema)]
#[serde(rename_all = "snake_case")]
pub enum StyleTransferName {
  #[serde(rename = "anime_2d")]
  Anime2d,
  #[serde(rename = "cartoon_3d")]
  Cartoon3d,
  Ink,
  Origami,
}

// TODO(bt, 2022-12-21): This desperately needs MySQL integration tests!
impl_enum_display_and_debug_using_to_str!(StyleTransferName);
//impl_mysql_enum_coders!(StyleTransferName);
//impl_mysql_from_row!(StyleTransferName);

/// NB: Legacy API for older code.
impl StyleTransferName {
  pub fn to_str(&self) -> &'static str {
    match self {
      Self::Anime2d => "anime_2d",
      Self::Cartoon3d => "cartoon_3d",
      Self::Ink => "ink",
      Self::Origami => "origami",
    }
  }

  pub fn from_str(value: &str) -> Result<Self, String> {
    match value {
      "anime_2d" => Ok(Self::Anime2d),
      "cartoon_3d" => Ok(Self::Cartoon3d),
      "ink" => Ok(Self::Ink),
      "origami" => Ok(Self::Origami),
      _ => Err(format!("invalid value: {:?}", value)),
    }
  }

  pub fn all_variants() -> BTreeSet<Self> {
    // NB: BTreeSet is sorted
    // NB: BTreeSet::from() isn't const, but not worth using LazyStatic, etc.
    BTreeSet::from([
      Self::Anime2d,
      Self::Cartoon3d,
      Self::Ink,
      Self::Origami,
    ])
  }
}

#[cfg(test)]
mod tests {
  use crate::no_table::style_transfer::style_transfer_name::StyleTransferName;
  use crate::test_helpers::assert_serialization;

  mod serde {
    use super::*;

    #[test]
    fn test_serialization() {
      assert_serialization(StyleTransferName::Anime2d, "anime_2d");
      assert_serialization(StyleTransferName::Cartoon3d, "cartoon_3d");
      assert_serialization(StyleTransferName::Ink, "ink");
      assert_serialization(StyleTransferName::Origami, "origami");
    }
  }

  mod impl_methods {
    use super::*;

    #[test]
    fn to_str() {
      assert_eq!(StyleTransferName::Anime2d.to_str(), "anime_2d");
      assert_eq!(StyleTransferName::Cartoon3d.to_str(), "cartoon_3d");
      assert_eq!(StyleTransferName::Ink.to_str(), "ink");
      assert_eq!(StyleTransferName::Origami.to_str(), "origami");
    }

    #[test]
    fn from_str() {
      assert_eq!(StyleTransferName::from_str("anime_2d").unwrap(), StyleTransferName::Anime2d);
      assert_eq!(StyleTransferName::from_str("cartoon_3d").unwrap(), StyleTransferName::Cartoon3d);
      assert_eq!(StyleTransferName::from_str("ink").unwrap(), StyleTransferName::Ink);
      assert_eq!(StyleTransferName::from_str("origami").unwrap(), StyleTransferName::Origami);
      assert!(StyleTransferName::from_str("foo").is_err());
    }
  }

  mod manual_variant_checks {
    use super::*;

    #[test]
    fn all_variants() {
      let mut variants = StyleTransferName::all_variants();
      assert_eq!(variants.len(), 4);
      assert_eq!(variants.pop_first(), Some(StyleTransferName::Anime2d));
      assert_eq!(variants.pop_first(), Some(StyleTransferName::Cartoon3d));
      assert_eq!(variants.pop_first(), Some(StyleTransferName::Ink));
      assert_eq!(variants.pop_first(), Some(StyleTransferName::Origami));
      assert_eq!(variants.pop_first(), None);
    }
  }

  mod mechanical_checks {
    use super::*;

    #[test]
    fn variant_length() {
      use strum::IntoEnumIterator;
      assert_eq!(StyleTransferName::all_variants().len(), StyleTransferName::iter().len());
    }

    #[test]
    fn round_trip() {
      for variant in StyleTransferName::all_variants() {
        assert_eq!(variant, StyleTransferName::from_str(variant.to_str()).unwrap());
        assert_eq!(variant, StyleTransferName::from_str(&format!("{}", variant)).unwrap());
        assert_eq!(variant, StyleTransferName::from_str(&format!("{:?}", variant)).unwrap());
      }
    }
  }
}
