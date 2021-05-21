//! Common enums in the database.
//! These may be used in one or more tables.
//! This defines the expected serializations.

#![allow(non_camel_case_types)]

#[derive(Deserialize)]
pub enum CreatorSetVisibility {
  /// public
  Public,
  /// hidden
  Hidden,
  /// private
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
