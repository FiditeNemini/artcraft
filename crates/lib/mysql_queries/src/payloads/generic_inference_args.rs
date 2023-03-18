use enums::workers::generic_inference_type::GenericInferenceType;
use tokens::files::media_upload::MediaUploadToken;
use tokens::voice_conversion::model::VoiceConversionModelToken;

/// Used to encode extra state for the `generic_inference_jobs` table.
/// This should act somewhat like a serialized protobuf stored inside a record.
#[derive(Clone, Serialize, Deserialize)]
pub struct GenericInferenceArgs {
  /// The type of inference (probably also present in a top-level field)
  pub inference_type: Option<GenericInferenceType>,

  /// REQUIRED.
  /// Actual type-specific arguments.
  pub args: Option<PolymorphicInferenceArgs>,
}

#[derive(Clone, Serialize, Deserialize)]
pub enum PolymorphicInferenceArgs {
  TextToSpeechInferenceArgs {
    // TODO
  },
  VoiceConversionInferenceArgs {
    /// REQUIRED.
    /// The voice conversion model to use.
    model_token: Option<VoiceConversionModelToken>,

    /// OPTIONAL.
    /// If set, the media file to use as the source in the conversion.
    /// It's "optional" in case we use other types of records in the future.
    maybe_media_token: Option<MediaUploadToken>,
  },
}

#[cfg(test)]
mod tests {
  use crate::payloads::generic_inference_args::{GenericInferenceArgs, PolymorphicInferenceArgs};
  use enums::workers::generic_inference_type::GenericInferenceType;
  use tokens::files::media_upload::MediaUploadToken;
  use tokens::voice_conversion::model::VoiceConversionModelToken;

  #[test]
  fn typical_voice_conversion_args_serialize() {
    let args = GenericInferenceArgs {
      inference_type: Some(GenericInferenceType::VoiceConversion),
      args: Some(PolymorphicInferenceArgs::VoiceConversionInferenceArgs {
        model_token: Some(VoiceConversionModelToken::new_from_str("vc_model_token")),
        maybe_media_token: Some(MediaUploadToken::new_from_str("media_token")),
      }),
    };

    let json = serde_json::ser::to_string(&args).unwrap();

    // NB: Assert the serialized form. If this changes and the test breaks, be careful about migrating.
    assert_eq!(json,
      r#"{"inference_type":"voice_conversion","args":{"VoiceConversionInferenceArgs":{"model_token":"vc_model_token","maybe_media_token":"media_token"}}}"#.to_string());

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
      inference_type: Some(GenericInferenceType::VoiceConversion),
      args: Some(PolymorphicInferenceArgs::VoiceConversionInferenceArgs {
        model_token: Some(VoiceConversionModelToken::new_from_str("vc_model_token")),
        maybe_media_token: Some(MediaUploadToken::new_from_str("media_token")),
      }),
    });

    let json = serde_json::ser::to_string(&args).unwrap();

    // NB: Assert the serialized form. If this changes and the test breaks, be careful about migrating.
    assert_eq!(json,
               r#"{"inference_type":"voice_conversion","args":{"VoiceConversionInferenceArgs":{"model_token":"vc_model_token","maybe_media_token":"media_token"}}}"#.to_string());

    // NB: Make sure we don't overflow the DB field capacity (TEXT column).
    assert!(json.len() < 1000);
  }
}
