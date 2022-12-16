/// Our "generic inference" pipeline supports a wide variety of ML models and other media.
/// Each type of inference is identified by the following enum variants.
/// These types are present in the HTTP API and database columns as serialized here.
///
/// DO NOT CHANGE VALUES WITHOUT A MIGRATION STRATEGY.
#[derive(Clone, Copy, Eq, PartialEq, Debug, Deserialize, Serialize, sqlx::Type)]
pub enum GenericInferenceType {
  #[serde(rename = "text_to_speech")]
  #[sqlx(rename = "text_to_speech")]
  TextToSpeech,

  #[serde(rename = "voice_conversion")]
  #[sqlx(rename = "voice_conversion")]
  VoiceConversion,
}

/// NB: Legacy API for older code.
impl GenericInferenceType {
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
}

#[cfg(test)]
mod tests {
  use crate::db::enums::generic_inference_type::GenericInferenceType;
  use crate::test_helpers::assert_serialization;

  #[test]
  fn test_serialization() {
    assert_serialization(GenericInferenceType::TextToSpeech, "text_to_speech");
    assert_serialization(GenericInferenceType::VoiceConversion, "voice_conversion");
  }

  #[test]
  fn to_str() {
    assert_eq!(GenericInferenceType::TextToSpeech.to_str(), "text_to_speech");
    assert_eq!(GenericInferenceType::VoiceConversion.to_str(), "voice_conversion");
  }

  #[test]
  fn from_str() {
    assert_eq!(GenericInferenceType::from_str("text_to_speech").unwrap(), GenericInferenceType::TextToSpeech);
    assert_eq!(GenericInferenceType::from_str("voice_conversion").unwrap(), GenericInferenceType::VoiceConversion);
  }
}
