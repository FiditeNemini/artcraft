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
  TextToSpeechInferenceArgs {
    // No arguments yet.
    // It might be best to just not include this when not used.
  },
  VoiceConversionInferenceArgs {
    /// OPTIONAL. (*Technically required until we add other inference inputs - eg TTS audio out, stems, etc.)
    /// If set, the media file to use as the source in the conversion.
    /// It's "optional" in case we use other types of records in the future.
    maybe_media_token: Option<MediaUploadToken>,
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
      args: Some(PolymorphicInferenceArgs::TextToSpeechInferenceArgs {
      }),
    };

    let json = serde_json::ser::to_string(&args).unwrap();

    // NB: Assert the serialized form. If this changes and the test breaks, be careful about migrating.
    assert_eq!(json, r#"{"cat":"vc","args":{"TextToSpeechInferenceArgs":{}}}"#.to_string());

    // NB: Make sure we don't overflow the DB field capacity (TEXT column).
    assert!(json.len() < 1000);
  }

  #[test]
  fn typical_voice_conversion_args_serialize() {
    let args = GenericInferenceArgs {
      inference_category: Some(InferenceCategoryAbbreviated::VoiceConversion),
      args: Some(PolymorphicInferenceArgs::VoiceConversionInferenceArgs {
        maybe_media_token: Some(MediaUploadToken::new_from_str("media_token")),
      }),
    };

    let json = serde_json::ser::to_string(&args).unwrap();

    // NB: Assert the serialized form. If this changes and the test breaks, be careful about migrating.
    assert_eq!(json,
      r#"{"cat":"vc","args":{"VoiceConversionInferenceArgs":{"maybe_media_token":"media_token"}}}"#.to_string());

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
      args: Some(PolymorphicInferenceArgs::VoiceConversionInferenceArgs {
        maybe_media_token: Some(MediaUploadToken::new_from_str("media_token")),
      }),
    });

    let json = serde_json::ser::to_string(&args).unwrap();

    // NB: Assert the serialized form. If this changes and the test breaks, be careful about migrating.
    assert_eq!(json,
               r#"{"cat":"vc","args":{"VoiceConversionInferenceArgs":{"maybe_media_token":"media_token"}}}"#.to_string());

    // NB: Make sure we don't overflow the DB field capacity (TEXT column).
    assert!(json.len() < 1000);
  }
}
