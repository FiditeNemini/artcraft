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
pub enum MediaFileType {
  // TODO(bt): Deprecate and split into audio mime types; use media_class to represent broadly
  /// Audio files: wav, mp3, etc.
  Audio,

  // TODO(bt): Deprecate and split into image mime types; use media_class to represent broadly
  /// Image files: png, jpeg, etc.
  Image,

  // TODO(bt): Deprecate and split into video mime types; use media_class to represent broadly
  /// Video files: mp4, etc.
  Video,

  /// BVH files (for Bevy)
  /// NB: This is the new type to migrate to.
  Bvh,

  /// FBX files (for Bevy)
  Fbx,

  /// glTF binary files (for Bevy)
  Glb,

  /// glTF files (for Bevy)
  Gltf,

  /// Bevy's scene files (in RON; Rusty Object Notation)
  /// This will be replaced with another format in future versions of Bevy
  SceneRon,

  /// Alternate scene files.
  SceneJson,

  /// "Polygon Model Data", character data for MikuMikuDance
  /// See: https://mikumikudance.fandom.com/wiki/MMD:Polygon_Model_Data
  Pmd,

  /// "Vocaloid Motion Data", animation data for MikuMikuDance
  /// See: https://mikumikudance.fandom.com/wiki/VMD_file_format
  Vmd,

  /// "Polygon Model eXtend", character data from MikuMikuDance
  /// NB: this is often associated with external files for textures, which
  /// we'll store in the same bucket path.
  /// See: https://mikumikudance.fandom.com/wiki/MMD:Polygon_Model_eXtend
  Pmx,

  /// CSV format. (We use these for ArKit)
  Csv,
}

// TODO(bt, 2022-12-21): This desperately needs MySQL integration tests!
impl_enum_display_and_debug_using_to_str!(MediaFileType);
impl_mysql_enum_coders!(MediaFileType);
impl_mysql_from_row!(MediaFileType);

/// NB: Legacy API for older code.
impl MediaFileType {
  pub fn to_str(&self) -> &'static str {
    match self {
      Self::Audio => "audio",
      Self::Image => "image",
      Self::Video => "video",
      Self::Bvh => "bvh",
      Self::Fbx => "fbx",
      Self::Glb => "glb",
      Self::Gltf => "gltf",
      Self::SceneRon => "scene_ron",
      Self::SceneJson => "scene_json",
      Self::Pmd => "pmd",
      Self::Vmd => "vmd",
      Self::Pmx => "pmx",
      Self::Csv => "csv",
    }
  }

  pub fn from_str(value: &str) -> Result<Self, String> {
    match value {
      "audio" => Ok(Self::Audio),
      "image" => Ok(Self::Image),
      "video" => Ok(Self::Video),
      "bvh" => Ok(Self::Bvh),
      "fbx" => Ok(Self::Fbx),
      "glb" => Ok(Self::Glb),
      "gltf" => Ok(Self::Gltf),
      "scene_ron" => Ok(Self::SceneRon),
      "scene_json" => Ok(Self::SceneJson),
      "pmd" => Ok(Self::Pmd),
      "vmd" => Ok(Self::Vmd),
      "pmx" => Ok(Self::Pmx),
      "csv" => Ok(Self::Csv),
      _ => Err(format!("invalid value: {:?}", value)),
    }
  }

  pub fn all_variants() -> BTreeSet<Self> {
    // NB: BTreeSet is sorted
    // NB: BTreeSet::from() isn't const, but not worth using LazyStatic, etc.
    BTreeSet::from([
      Self::Audio,
      Self::Image,
      Self::Video,
      Self::Bvh,
      Self::Fbx,
      Self::Glb,
      Self::Gltf,
      Self::SceneRon,
      Self::SceneJson,
      Self::Pmd,
      Self::Vmd,
      Self::Pmx,
      Self::Csv,
    ])
  }
}

#[cfg(test)]
mod tests {
  use crate::by_table::media_files::media_file_type::MediaFileType;
  use crate::test_helpers::assert_serialization;

  mod serde {
    use super::*;

    #[test]
    fn test_serialization() {
      assert_serialization(MediaFileType::Audio, "audio");
      assert_serialization(MediaFileType::Image, "image");
      assert_serialization(MediaFileType::Video, "video");
      assert_serialization(MediaFileType::Bvh, "bvh");
      assert_serialization(MediaFileType::Fbx, "fbx");
      assert_serialization(MediaFileType::Glb, "glb");
      assert_serialization(MediaFileType::Gltf, "gltf");
      assert_serialization(MediaFileType::SceneRon, "scene_ron");
      assert_serialization(MediaFileType::SceneJson, "scene_json");
      assert_serialization(MediaFileType::Pmd, "pmd");
      assert_serialization(MediaFileType::Vmd, "vmd");
      assert_serialization(MediaFileType::Pmx, "pmx");
      assert_serialization(MediaFileType::Csv, "csv");
    }
  }

  mod impl_methods {
    use super::*;

    #[test]
    fn to_str() {
      assert_eq!(MediaFileType::Audio.to_str(), "audio");
      assert_eq!(MediaFileType::Image.to_str(), "image");
      assert_eq!(MediaFileType::Video.to_str(), "video");
      assert_eq!(MediaFileType::Bvh.to_str(), "bvh");
      assert_eq!(MediaFileType::Fbx.to_str(), "fbx");
      assert_eq!(MediaFileType::Glb.to_str(), "glb");
      assert_eq!(MediaFileType::Gltf.to_str(), "gltf");
      assert_eq!(MediaFileType::SceneRon.to_str(), "scene_ron");
      assert_eq!(MediaFileType::SceneJson.to_str(), "scene_json");
      assert_eq!(MediaFileType::Pmd.to_str(), "pmd");
      assert_eq!(MediaFileType::Vmd.to_str(), "vmd");
      assert_eq!(MediaFileType::Pmx.to_str(), "pmx");
      assert_eq!(MediaFileType::Csv.to_str(), "csv");
    }

    #[test]
    fn from_str() {
      assert_eq!(MediaFileType::from_str("audio").unwrap(), MediaFileType::Audio);
      assert_eq!(MediaFileType::from_str("image").unwrap(), MediaFileType::Image);
      assert_eq!(MediaFileType::from_str("video").unwrap(), MediaFileType::Video);
      assert_eq!(MediaFileType::from_str("bvh").unwrap(), MediaFileType::Bvh);
      assert_eq!(MediaFileType::from_str("fbx").unwrap(), MediaFileType::Fbx);
      assert_eq!(MediaFileType::from_str("glb").unwrap(), MediaFileType::Glb);
      assert_eq!(MediaFileType::from_str("gltf").unwrap(), MediaFileType::Gltf);
      assert_eq!(MediaFileType::from_str("scene_ron").unwrap(), MediaFileType::SceneRon);
      assert_eq!(MediaFileType::from_str("scene_json").unwrap(), MediaFileType::SceneJson);
      assert_eq!(MediaFileType::from_str("pmd").unwrap(), MediaFileType::Pmd);
      assert_eq!(MediaFileType::from_str("vmd").unwrap(), MediaFileType::Vmd);
      assert_eq!(MediaFileType::from_str("pmx").unwrap(), MediaFileType::Pmx);
      assert_eq!(MediaFileType::from_str("csv").unwrap(), MediaFileType::Csv);
      assert!(MediaFileType::from_str("foo").is_err());
    }
  }

  mod manual_variant_checks {
    use super::*;

    #[test]
    fn all_variants() {
      let mut variants = MediaFileType::all_variants();
      assert_eq!(variants.len(), 13);
      assert_eq!(variants.pop_first(), Some(MediaFileType::Audio));
      assert_eq!(variants.pop_first(), Some(MediaFileType::Image));
      assert_eq!(variants.pop_first(), Some(MediaFileType::Video));
      assert_eq!(variants.pop_first(), Some(MediaFileType::Bvh));
      assert_eq!(variants.pop_first(), Some(MediaFileType::Fbx));
      assert_eq!(variants.pop_first(), Some(MediaFileType::Glb));
      assert_eq!(variants.pop_first(), Some(MediaFileType::Gltf));
      assert_eq!(variants.pop_first(), Some(MediaFileType::SceneRon));
      assert_eq!(variants.pop_first(), Some(MediaFileType::SceneJson));
      assert_eq!(variants.pop_first(), Some(MediaFileType::Pmd));
      assert_eq!(variants.pop_first(), Some(MediaFileType::Vmd));
      assert_eq!(variants.pop_first(), Some(MediaFileType::Pmx));
      assert_eq!(variants.pop_first(), Some(MediaFileType::Csv));
      assert_eq!(variants.pop_first(), None);
    }
  }

  mod mechanical_checks {
    use super::*;

    #[test]
    fn variant_length() {
      use strum::IntoEnumIterator;
      assert_eq!(MediaFileType::all_variants().len(), MediaFileType::iter().len());
    }

    #[test]
    fn round_trip() {
      for variant in MediaFileType::all_variants() {
        assert_eq!(variant, MediaFileType::from_str(variant.to_str()).unwrap());
        assert_eq!(variant, MediaFileType::from_str(&format!("{}", variant)).unwrap());
        assert_eq!(variant, MediaFileType::from_str(&format!("{:?}", variant)).unwrap());
      }
    }

    #[test]
    fn serialized_length_ok_for_database() {
      const MAX_LENGTH : usize = 16;
      for variant in MediaFileType::all_variants() {
        let serialized = variant.to_str();
        assert!(serialized.len() > 0, "variant {:?} is too short", variant);
        assert!(serialized.len() <= MAX_LENGTH, "variant {:?} is too long", variant);
      }
    }
  }
}
