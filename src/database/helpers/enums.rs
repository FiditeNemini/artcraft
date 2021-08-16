//! Common enums in the database.
//! These may be used in one or more tables.
//! This defines the expected serializations.

#![allow(non_camel_case_types)]

#[deprecated(note = "Use `RecordVisibility` instead!")]
#[derive(Deserialize)]
pub enum CreatorSetVisibility {
  /// public
  #[deprecated(note = "Use `RecordVisibility` instead!")]
  Public,
  /// hidden
  #[deprecated(note = "Use `RecordVisibility` instead!")]
  Hidden,
  /// private
  #[deprecated(note = "Use `RecordVisibility` instead!")]
  Private,
}

#[derive(Deserialize)]
pub enum TtsModelType {
  /// tacotron2
  Tacotron2,
  /// glowtts
  GlowTts,
  /// glowtts-vocodes
  GlowTts_Vocodes,
}

#[derive(Deserialize)]
pub enum DownloadUrlType {
  /// google-drive
  Google_Drive,
  /// web
  Web,
}

#[derive(Deserialize)]
pub enum W2lTemplateType {
  /// unknown
  Unknown,
  /// video
  Video,
  /// image
  Image,
}
