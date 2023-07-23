use enums::by_table::voice_conversion_models::voice_conversion_model_type::VoiceConversionModelType;
use tokens::voice_conversion::model::VoiceConversionModelToken;

/// This is meant to be used for quick in-memory caches,
/// particularly the one that serves the voice conversion enqueue API.
#[derive(Serialize)]
pub struct VoiceConversionModelInfoLite {
  pub token: VoiceConversionModelToken,
  pub model_type: VoiceConversionModelType,
}
