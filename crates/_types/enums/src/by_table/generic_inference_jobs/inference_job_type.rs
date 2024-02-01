use std::collections::BTreeSet;

#[cfg(test)]
use strum::EnumCount;
#[cfg(test)]
use strum::EnumIter;

/// Used in the `generic_inference_jobs` table in `VARCHAR(32)` field `job_type`.
///
/// TODO(bt,2024-02-01): This will replace "inference_category" and "maybe_model_type" for job control and dispatch,
/// since those mechanisms are overloaded and inconsistent.
///
/// YOU CAN ADD NEW VALUES, BUT DO NOT CHANGE EXISTING VALUES WITHOUT A MIGRATION STRATEGY.
#[cfg_attr(test, derive(EnumIter, EnumCount))]
#[derive(Clone, Copy, Eq, PartialEq, Hash, Ord, PartialOrd, Deserialize, Serialize, Default)]
pub enum InferenceJobType {
  /// A job that turns "FBX" game engine files into "GLTF" files (Bevy-compatible).
  #[serde(rename = "convert_fbx_gltf")]
  ConvertFbxToGltf,

  #[serde(rename = "rerender_a_video")]
  RerenderAVideo,

  /// A value we may use in the future for historical jobs
  #[serde(rename = "unknown")]
  #[default]
  Unknown,
}

// TODO(bt, 2022-12-21): This desperately needs MySQL integration tests!
impl_enum_display_and_debug_using_to_str!(InferenceJobType);
impl_mysql_enum_coders!(InferenceJobType);

/// NB: Legacy API for older code.
impl InferenceJobType {
  pub fn to_str(&self) -> &'static str {
    match self {
      Self::ConvertFbxToGltf => "convert_fbx_gltf",
      Self::RerenderAVideo => "rerender_a_video",
      Self::Unknown => "unknown",
    }
  }

  pub fn from_str(value: &str) -> Result<Self, String> {
    match value {
      "convert_fbx_gltf" => Ok(Self::ConvertFbxToGltf),
      "unknown" => Ok(Self::Unknown),
      _ => Err(format!("invalid value: {:?}", value)),
    }
  }

  pub fn all_variants() -> BTreeSet<Self> {
    // NB: BTreeSet is sorted
    // NB: BTreeSet::from() isn't const, but not worth using LazyStatic, etc.
    BTreeSet::from([
      Self::ConvertFbxToGltf,
      Self::Unknown,
    ])
  }
}

#[cfg(test)]
mod tests {
  use crate::by_table::generic_inference_jobs::inference_job_type::InferenceJobType;
  use crate::test_helpers::assert_serialization;

  mod explicit_checks {
    use super::*;

    #[test]
    fn default() {
      assert_eq!(InferenceJobType::default(), InferenceJobType::Unknown);
    }

    #[test]
    fn test_serialization() {
      assert_serialization(InferenceJobType::ConvertFbxToGltf, "convert_fbx_gltf");
      assert_serialization(InferenceJobType::RerenderAVideo, "rerender_a_video");
      assert_serialization(InferenceJobType::Unknown, "unknown");
    }

    #[test]
    fn to_str() {
      assert_eq!(InferenceJobType::ConvertFbxToGltf.to_str(), "convert_fbx_gltf");
      assert_eq!(InferenceJobType::RerenderAVideo.to_str(), "rerender_a_video");
      assert_eq!(InferenceJobType::Unknown.to_str(), "unknown");
    }

    #[test]
    fn from_str() {
      assert_eq!(InferenceJobType::from_str("convert_fbx_gltf").unwrap(), InferenceJobType::ConvertFbxToGltf);
      assert_eq!(InferenceJobType::from_str("rerender_a_video").unwrap(), InferenceJobType::RerenderAVideo);
      assert_eq!(InferenceJobType::from_str("unknown").unwrap(), InferenceJobType::Unknown);
    }

    #[test]
    fn all_variants() {
      // Static check
      let mut variants = InferenceJobType::all_variants();
      assert_eq!(variants.len(), 3);
      assert_eq!(variants.pop_first(), Some(InferenceJobType::ConvertFbxToGltf));
      assert_eq!(variants.pop_first(), Some(InferenceJobType::RerenderAVideo));
      assert_eq!(variants.pop_first(), Some(InferenceJobType::Unknown));
      assert_eq!(variants.pop_first(), None);

      // Generated check
      use strum::IntoEnumIterator;
      assert_eq!(InferenceJobType::all_variants().len(), InferenceJobType::iter().len());
    }
  }

  mod mechanical_checks {
    use super::*;

    #[test]
    fn variant_length() {
      use strum::IntoEnumIterator;
      assert_eq!(InferenceJobType::all_variants().len(), InferenceJobType::iter().len());
    }

    #[test]
    fn round_trip() {
      for variant in InferenceJobType::all_variants() {
        assert_eq!(variant, InferenceJobType::from_str(variant.to_str()).unwrap());
        assert_eq!(variant, InferenceJobType::from_str(&format!("{}", variant)).unwrap());
        assert_eq!(variant, InferenceJobType::from_str(&format!("{:?}", variant)).unwrap());
      }
    }

    #[test]
    fn serialized_length_ok_for_database() {
      const MAX_LENGTH : usize = 32;
      for variant in InferenceJobType::all_variants() {
        let serialized = variant.to_str();
        assert!(serialized.len() > 0, "variant {:?} is too short", variant);
        assert!(serialized.len() <= MAX_LENGTH, "variant {:?} is too long", variant);
      }
    }
  }
}
