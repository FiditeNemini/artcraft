
/// Numeric denominations are concrete types.
#[derive(Debug, Clone, Copy, Eq, PartialEq)]
pub enum UserBadgeType {
  /// Granted for early vocodes users
  EarlyUser,

  /// Granted for uploading tts models
  TtsModelUploader,

  /// Granted for uploading vocoder models
  VocoderModelUploader,

  /// Granted for uploading W2L templates
  W2lTemplateUploader,

}
