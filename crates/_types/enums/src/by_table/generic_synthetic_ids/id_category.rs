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

  /// Results from voice conversion (which may live in the media_files table)
  /// Applies for RVC and SVC
  #[serde(rename = "voice_conversion")]
  VoiceConversion,

  /// Results from the zero shot tts
  #[serde(rename = "zs_audio_tts")]
  ZeroShotTTS,

  /// Zs dataset which lives in the zs_voice_datasets table
  #[serde(rename = "zs_dataset")]
  ZsDataset,

  /// Zs voice which lives in the zs_voices table
  #[serde(rename = "zs_voice")]
  ZsVoice,
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
      Self::VoiceConversion => "voice_conversion",
      Self::ZsDataset => "zs_dataset",
      Self::ZsVoice => "zs_voice",
      Self::ZeroShotTTS => "zs_audio_tts"
    }
  }

  pub fn from_str(value: &str) -> Result<Self, String> {
    match value {
      "media_file" => Ok(Self::MediaFile),
      "lipsync_animation" => Ok(Self::LipsyncAnimation),
      "voice_conversion" => Ok(Self::VoiceConversion),
      "zs_dataset" => Ok(Self::ZsDataset),
      "zs_voice" => Ok(Self::ZsVoice),
      "zs_audio_tts" => Ok(Self::ZeroShotTTS),
      _ => Err(format!("invalid value: {:?}", value)),
    }
  }

  pub fn all_variants() -> BTreeSet<Self> {
    // NB: BTreeSet is sorted
    // NB: BTreeSet::from() isn't const, but not worth using LazyStatic, etc.
    BTreeSet::from([
      Self::MediaFile,
      Self::LipsyncAnimation,
      Self::VoiceConversion,
      Self::ZeroShotTTS,
      Self::ZsDataset,
      Self::ZsVoice,
    ])
  }
}

#[cfg(test)]
mod tests {
  use crate::by_table::generic_synthetic_ids::id_category::IdCategory;
  use crate::test_helpers::assert_serialization;

  mod explicit_checks {
    use super::*;

  #[test]
  fn test_serialization() {
    assert_serialization(IdCategory::MediaFile, "media_file");
    assert_serialization(IdCategory::LipsyncAnimation, "lipsync_animation");
    assert_serialization(IdCategory::VoiceConversion, "voice_conversion");
    assert_serialization(IdCategory::ZsDataset, "zs_dataset");
    assert_serialization(IdCategory::ZsVoice, "zs_voice");
  }

    #[test]
    fn to_str() {
      assert_eq!(IdCategory::MediaFile.to_str(), "media_file");
      assert_eq!(IdCategory::LipsyncAnimation.to_str(), "lipsync_animation");
      assert_eq!(IdCategory::VoiceConversion.to_str(), "voice_conversion");
      assert_eq!(IdCategory::ZsDataset.to_str(), "zs_dataset");
      assert_eq!(IdCategory::ZsVoice.to_str(), "zs_voice");
      assert_eq!(IdCategory::ZeroShotTTS.to_str(),"zs_audio_tts");
    }

    #[test]
    fn from_str() {
      assert_eq!(IdCategory::from_str("media_file").unwrap(), IdCategory::MediaFile);
      assert_eq!(IdCategory::from_str("lipsync_animation").unwrap(), IdCategory::LipsyncAnimation);
      assert_eq!(IdCategory::from_str("voice_conversion").unwrap(), IdCategory::VoiceConversion);
      assert_eq!(IdCategory::from_str("zs_dataset").unwrap(), IdCategory::ZsDataset);
      assert_eq!(IdCategory::from_str("zs_voice").unwrap(), IdCategory::ZsVoice);
      assert_eq!(IdCategory::from_str("zs_audio_tts").unwrap(), IdCategory::ZeroShotTTS);
    }

    #[test]
    fn all_variants() {
      // Static check
      let mut variants = IdCategory::all_variants();
      assert_eq!(variants.len(), 6);
      assert_eq!(variants.pop_first(), Some(IdCategory::MediaFile));
      assert_eq!(variants.pop_first(), Some(IdCategory::LipsyncAnimation));
      assert_eq!(variants.pop_first(), Some(IdCategory::VoiceConversion));
      assert_eq!(variants.pop_first(), Some(IdCategory::ZeroShotTTS));
      assert_eq!(variants.pop_first(), Some(IdCategory::ZsDataset));
      assert_eq!(variants.pop_first(), Some(IdCategory::ZsVoice));
      assert_eq!(variants.pop_first(), None);

      // Generated check
      use strum::IntoEnumIterator;
      assert_eq!(IdCategory::all_variants().len(), IdCategory::iter().len());
    }
  }

  mod mechanical_checks {
    use super::*;

    #[test]
    fn variant_length() {
      use strum::IntoEnumIterator;
      assert_eq!(IdCategory::all_variants().len(), IdCategory::iter().len());
    }

    #[test]
    fn round_trip() {
      for variant in IdCategory::all_variants() {
        assert_eq!(variant, IdCategory::from_str(variant.to_str()).unwrap());
        assert_eq!(variant, IdCategory::from_str(&format!("{}", variant)).unwrap());
        assert_eq!(variant, IdCategory::from_str(&format!("{:?}", variant)).unwrap());
      }
    }
  }
}
