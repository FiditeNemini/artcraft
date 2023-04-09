use std::collections::BTreeSet;

#[cfg(test)]
use strum::EnumCount;
#[cfg(test)]
use strum::EnumIter;


/// Used in the `generic_inference_jobs` table in `VARCHAR(32)` field `on_success_result_entity_type`.
///
/// Our "generic inference" pipeline supports a wide variety of output types.
/// Each "result type" is identified by the following enum variants.
///
/// These types are present in the HTTP API and database columns as serialized here.
///
/// DO NOT CHANGE VALUES WITHOUT A MIGRATION STRATEGY.
#[cfg_attr(test, derive(EnumIter, EnumCount))]
#[derive(Clone, Copy, Eq, PartialEq, Hash, Ord, PartialOrd, Deserialize, Serialize)]
pub enum InferenceResultType {
  #[serde(rename = "text_to_speech")]
  TextToSpeech,

  #[serde(rename = "voice_conversion")]
  VoiceConversion,
}

// TODO(bt, 2022-12-21): This desperately needs MySQL integration tests!
impl_enum_display_and_debug_using_to_str!(InferenceResultType);
impl_mysql_enum_coders!(InferenceResultType);

/// NB: Legacy API for older code.
impl InferenceResultType {
  pub fn to_str(&self) -> &'static str {
    match self {
      Self::TextToSpeech => "text_to_speech",
      Self::VoiceConversion => "voice_conversion",
    }
  }

  pub fn from_str(value: &str) -> Result<Self, String> {
    match value {
      "text_to_speech" => Ok(Self::TextToSpeech),
      "voice_conversion" => Ok(Self::VoiceConversion),
      _ => Err(format!("invalid value: {:?}", value)),
    }
  }

  pub fn all_variants() -> BTreeSet<InferenceResultType> {
    // NB: BTreeSet is sorted
    // NB: BTreeSet::from() isn't const, but not worth using LazyStatic, etc.
    BTreeSet::from([
      InferenceResultType::TextToSpeech,
      InferenceResultType::VoiceConversion,
    ])
  }
}

#[cfg(test)]
mod tests {
  use crate::by_table::generic_inference_jobs::inference_result_type::InferenceResultType;
  use crate::test_helpers::assert_serialization;

  #[test]
  fn test_serialization() {
    assert_serialization(InferenceResultType::TextToSpeech, "text_to_speech");
    assert_serialization(InferenceResultType::VoiceConversion, "voice_conversion");
  }

  #[test]
  fn to_str() {
    assert_eq!(InferenceResultType::TextToSpeech.to_str(), "text_to_speech");
    assert_eq!(InferenceResultType::VoiceConversion.to_str(), "voice_conversion");
  }

  #[test]
  fn from_str() {
    assert_eq!(InferenceResultType::from_str("text_to_speech").unwrap(), InferenceResultType::TextToSpeech);
    assert_eq!(InferenceResultType::from_str("voice_conversion").unwrap(), InferenceResultType::VoiceConversion);
  }

  #[test]
  fn all_variants() {
    // Static check
    let mut variants = InferenceResultType::all_variants();
    assert_eq!(variants.len(), 2);
    assert_eq!(variants.pop_first(), Some(InferenceResultType::TextToSpeech));
    assert_eq!(variants.pop_first(), Some(InferenceResultType::VoiceConversion));
    assert_eq!(variants.pop_first(), None);

    // Generated check
    use strum::IntoEnumIterator;
    assert_eq!(InferenceResultType::all_variants().len(), InferenceResultType::iter().len());
  }
}
