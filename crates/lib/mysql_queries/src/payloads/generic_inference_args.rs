use enums::by_table::generic_inference_jobs::inference_category::InferenceCategory;
use errors::AnyhowResult;
use tokens::files::media_upload::MediaUploadToken;
use tokens::tokens::tts_models::TtsModelToken;
use tokens::voice_conversion::model::VoiceConversionModelToken;

/// Used to encode extra state for the `generic_inference_jobs` table.
/// This should act somewhat like a serialized protobuf stored inside a record.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GenericInferenceArgs {
  /// The category of inference (probably also present in a top-level field)
  #[serde(rename = "cat")] // NB: DO NOT CHANGE. It could break live jobs. Renamed to consume fewer bytes
  #[serde(alias = "inference_category")]
  pub inference_category: Option<InferenceCategoryAbbreviated>,

  /// REQUIRED.
  /// Actual type-specific arguments.
  #[serde(skip_serializing_if = "Option::is_none")]
  pub args: Option<PolymorphicInferenceArgs>,
}

/// Same as `InferenceCategory`, but serialized in fewer characters
/// Do not change the values.
#[derive(Clone, Copy, Debug, Eq, PartialEq, Hash, Ord, PartialOrd, Deserialize, Serialize)]
pub enum InferenceCategoryAbbreviated {
  #[serde(rename = "tts")] // NB: DO NOT CHANGE. It could break live jobs. Renamed to be fewer bytes.
  #[serde(alias = "text_to_speech")]
  TextToSpeech,

  #[serde(rename = "vc")] // NB: DO NOT CHANGE. It could break live jobs. Renamed to be fewer bytes.
  #[serde(alias = "voice_conversion")]
  VoiceConversion,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum PolymorphicInferenceArgs {
  /// Text to speech. (Short name to save space when serializing.)
  Tts {
    // No arguments yet.
    // It might be best to just not include this when not used.
  },
  /// Voice conversion. (Short name to save space when serializing.)
  Vc {
    /// Argument for so-vits-svc
    /// The python model defaults to true, but that sounds awful,
    /// so we default to false unless specified.
    #[serde(skip_serializing_if = "Option::is_none")]
    auto_predict_f0: Option<bool>,
  },
}

impl GenericInferenceArgs {

  pub fn from_json(json: &str) -> AnyhowResult<Self> {
    Ok(serde_json::from_str(json)?)
  }

  pub fn to_json(&self) -> AnyhowResult<String> {
    Ok(serde_json::to_string(self)?)
  }
}

impl InferenceCategoryAbbreviated {
  pub fn from_inference_category(category: InferenceCategory) -> Self {
    match category {
      InferenceCategory::TextToSpeech => Self::TextToSpeech,
      InferenceCategory::VoiceConversion => Self::VoiceConversion,
    }
  }

  pub fn to_inference_category(self) -> InferenceCategory {
    match self {
      Self::TextToSpeech => InferenceCategory::TextToSpeech,
      Self::VoiceConversion => InferenceCategory::VoiceConversion,
    }
  }
}

#[cfg(test)]
mod tests {
  use crate::payloads::generic_inference_args::{GenericInferenceArgs, InferenceCategoryAbbreviated, PolymorphicInferenceArgs};
  use enums::by_table::generic_inference_jobs::inference_category::InferenceCategory;
  use tokens::files::media_upload::MediaUploadToken;
  use tokens::tokens::tts_models::TtsModelToken;
  use tokens::voice_conversion::model::VoiceConversionModelToken;

  #[test]
  fn typical_tts_args_serialize() {
    let args = GenericInferenceArgs {
      inference_category: Some(InferenceCategoryAbbreviated::VoiceConversion),
      args: Some(PolymorphicInferenceArgs::Tts {
      }),
    };

    let json = serde_json::ser::to_string(&args).unwrap();

    // NB: Assert the serialized form. If this changes and the test breaks, be careful about migrating.
    assert_eq!(json, r#"{"cat":"vc","args":{"Tts":{}}}"#.to_string());

    // NB: Make sure we don't overflow the DB field capacity (TEXT column).
    assert!(json.len() < 1000);
  }

  #[test]
  fn typical_voice_conversion_args_serialize() {
    let args = GenericInferenceArgs {
      inference_category: Some(InferenceCategoryAbbreviated::VoiceConversion),
      args: Some(PolymorphicInferenceArgs::Vc {
        auto_predict_f0: Some(false),
      }),
    };

    let json = serde_json::ser::to_string(&args).unwrap();

    // NB: Assert the serialized form. If this changes and the test breaks, be careful about migrating.
    assert_eq!(json,
      r#"{"cat":"vc","args":{"Vc":{"auto_predict_f0":false}}}"#.to_string());

    // NB: Make sure we don't overflow the DB field capacity (TEXT column).
    assert!(json.len() < 1000);
  }

  #[test]
  fn voice_conversion_args_do_not_serialize_none() {
    let args = GenericInferenceArgs {
      inference_category: Some(InferenceCategoryAbbreviated::VoiceConversion),
      args: Some(PolymorphicInferenceArgs::Vc {
        auto_predict_f0: None, // NB: Do not serialize
      }),
    };

    let json = serde_json::ser::to_string(&args).unwrap();

    // NB: Assert the serialized form. If this changes and the test breaks, be careful about migrating.
    assert_eq!(json,
               r#"{"cat":"vc","args":{"Vc":{}}}"#.to_string());

    // NB: Make sure we don't overflow the DB field capacity (TEXT column).
    assert!(json.len() < 1000);
  }

  #[test]
  fn serialize_nullable_form() {
    let mut args : Option<GenericInferenceArgs> = None;
    let json = serde_json::ser::to_string(&args).unwrap();

    // NB: Assert the serialized form. If this changes and the test breaks, be careful about migrating.
    assert_eq!(json, "null");

    args = Some(GenericInferenceArgs {
      inference_category: Some(InferenceCategoryAbbreviated::VoiceConversion),
      args: Some(PolymorphicInferenceArgs::Vc {
        auto_predict_f0: Some(true),
      }),
    });

    let json = serde_json::ser::to_string(&args).unwrap();

    // NB: Assert the serialized form. If this changes and the test breaks, be careful about migrating.
    assert_eq!(json,
               r#"{"cat":"vc","args":{"Vc":{"auto_predict_f0":true}}}"#.to_string());

    // NB: Make sure we don't overflow the DB field capacity (TEXT column).
    assert!(json.len() < 1000);
  }
}
