use std::collections::BTreeSet;

#[cfg(test)]
use strum::EnumCount;
#[cfg(test)]
use strum::EnumIter;
use utoipa::ToSchema;

/// Used in the `media_files` table in a `VARCHAR(16)` field.
///
/// DO NOT CHANGE VALUES WITHOUT A MIGRATION STRATEGY.
#[cfg_attr(test, derive(EnumIter, EnumCount))]
#[derive(Clone, Copy, Eq, PartialEq, Ord, PartialOrd, Hash, Deserialize, Serialize, ToSchema)]
#[serde(rename_all = "snake_case")]
pub enum MediaFileClass {
  /// Unknown (default value)
  /// This will be present until we migrate all old files.
  Unknown,

  /// Audio files: wav, mp3, etc.
  Audio,

  /// Image files: png, jpeg, etc.
  Image,

  /// Video files: mp4, etc.
  Video,

  // TODO(bt): IN the future we may have a "volumetric" type.
  /// 3D engine data: glb, gltf, etc.
  Dimensional,

  // TODO(bt): This was a bad idea.
  /// Engine "animations"
  Animation,

  // TODO(bt): This was a bad idea.
  /// Engine "characters"
  Character,

  // TODO(bt): This was a bad idea.
  /// Engine "prop" items
  Prop,

  // TODO(bt): This was a bad idea.
  /// Engine scenes (internal and external scenes)
  Scene,
}

// TODO(bt, 2022-12-21): This desperately needs MySQL integration tests!
impl_enum_display_and_debug_using_to_str!(MediaFileClass);
impl_mysql_enum_coders!(MediaFileClass);
impl_mysql_from_row!(MediaFileClass);

/// NB: Legacy API for older code.
impl MediaFileClass {
  pub fn to_str(&self) -> &'static str {
    match self {
      Self::Unknown => "unknown",
      Self::Audio => "audio",
      Self::Image => "image",
      Self::Video => "video",
      Self::Dimensional => "dimensional",
      Self::Animation => "animation",
      Self::Character => "character",
      Self::Prop => "prop",
      Self::Scene => "scene",
    }
  }

  pub fn from_str(value: &str) -> Result<Self, String> {
    match value {
      "unknown" => Ok(Self::Unknown),
      "audio" => Ok(Self::Audio),
      "image" => Ok(Self::Image),
      "video" => Ok(Self::Video),
      "dimensional" => Ok(Self::Dimensional),
      "animation" => Ok(Self::Animation),
      "character" => Ok(Self::Character),
      "prop" => Ok(Self::Prop),
      "scene" => Ok(Self::Scene),
      _ => Err(format!("invalid value: {:?}", value)),
    }
  }

  pub fn all_variants() -> BTreeSet<Self> {
    // NB: BTreeSet is sorted
    // NB: BTreeSet::from() isn't const, but not worth using LazyStatic, etc.
    BTreeSet::from([
      Self::Unknown,
      Self::Audio,
      Self::Image,
      Self::Video,
      Self::Dimensional,
      Self::Animation,
      Self::Character,
      Self::Prop,
      Self::Scene,
    ])
  }
}

#[cfg(test)]
mod tests {
  use crate::by_table::media_files::media_file_class::MediaFileClass;
  use crate::test_helpers::assert_serialization;

  mod serde {
    use super::*;

    #[test]
    fn test_serialization() {
      assert_serialization(MediaFileClass::Unknown, "unknown");
      assert_serialization(MediaFileClass::Audio, "audio");
      assert_serialization(MediaFileClass::Image, "image");
      assert_serialization(MediaFileClass::Video, "video");
      assert_serialization(MediaFileClass::Dimensional, "dimensional");
      assert_serialization(MediaFileClass::Animation, "animation");
      assert_serialization(MediaFileClass::Character, "character");
      assert_serialization(MediaFileClass::Prop, "prop");
      assert_serialization(MediaFileClass::Scene, "scene");
    }
  }

  mod impl_methods {
    use super::*;

    #[test]
    fn to_str() {
      assert_eq!(MediaFileClass::Unknown.to_str(), "unknown");
      assert_eq!(MediaFileClass::Audio.to_str(), "audio");
      assert_eq!(MediaFileClass::Image.to_str(), "image");
      assert_eq!(MediaFileClass::Video.to_str(), "video");
      assert_eq!(MediaFileClass::Dimensional.to_str(), "dimensional");
      assert_eq!(MediaFileClass::Animation.to_str(), "animation");
      assert_eq!(MediaFileClass::Character.to_str(), "character");
      assert_eq!(MediaFileClass::Prop.to_str(), "prop");
      assert_eq!(MediaFileClass::Scene.to_str(), "scene");
    }

    #[test]
    fn from_str() {
      assert_eq!(MediaFileClass::from_str("unknown").unwrap(), MediaFileClass::Unknown);
      assert_eq!(MediaFileClass::from_str("audio").unwrap(), MediaFileClass::Audio);
      assert_eq!(MediaFileClass::from_str("image").unwrap(), MediaFileClass::Image);
      assert_eq!(MediaFileClass::from_str("video").unwrap(), MediaFileClass::Video);
      assert_eq!(MediaFileClass::from_str("dimensional").unwrap(), MediaFileClass::Dimensional);
      assert_eq!(MediaFileClass::from_str("animation").unwrap(), MediaFileClass::Animation);
      assert_eq!(MediaFileClass::from_str("character").unwrap(), MediaFileClass::Character);
      assert_eq!(MediaFileClass::from_str("prop").unwrap(), MediaFileClass::Prop);
      assert_eq!(MediaFileClass::from_str("scene").unwrap(), MediaFileClass::Scene);
      assert!(MediaFileClass::from_str("foo").is_err());
    }
  }

  mod manual_variant_checks {
    use super::*;

    #[test]
    fn all_variants() {
      let mut variants = MediaFileClass::all_variants();
      assert_eq!(variants.len(), 9);
      assert_eq!(variants.pop_first(), Some(MediaFileClass::Unknown));
      assert_eq!(variants.pop_first(), Some(MediaFileClass::Audio));
      assert_eq!(variants.pop_first(), Some(MediaFileClass::Image));
      assert_eq!(variants.pop_first(), Some(MediaFileClass::Video));
      assert_eq!(variants.pop_first(), Some(MediaFileClass::Dimensional));
      assert_eq!(variants.pop_first(), Some(MediaFileClass::Animation));
      assert_eq!(variants.pop_first(), Some(MediaFileClass::Character));
      assert_eq!(variants.pop_first(), Some(MediaFileClass::Prop));
      assert_eq!(variants.pop_first(), Some(MediaFileClass::Scene));
      assert_eq!(variants.pop_first(), None);
    }
  }

  mod mechanical_checks {
    use super::*;

    #[test]
    fn variant_length() {
      use strum::IntoEnumIterator;
      assert_eq!(MediaFileClass::all_variants().len(), MediaFileClass::iter().len());
    }

    #[test]
    fn round_trip() {
      for variant in MediaFileClass::all_variants() {
        assert_eq!(variant, MediaFileClass::from_str(variant.to_str()).unwrap());
        assert_eq!(variant, MediaFileClass::from_str(&format!("{}", variant)).unwrap());
        assert_eq!(variant, MediaFileClass::from_str(&format!("{:?}", variant)).unwrap());
      }
    }

    #[test]
    fn serialized_length_ok_for_database() {
      const MAX_LENGTH : usize = 16;
      for variant in MediaFileClass::all_variants() {
        let serialized = variant.to_str();
        assert!(serialized.len() > 0, "variant {:?} is too short", variant);
        assert!(serialized.len() <= MAX_LENGTH, "variant {:?} is too long", variant);
      }
    }
  }
}
