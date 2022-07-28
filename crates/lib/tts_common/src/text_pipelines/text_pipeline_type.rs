use anyhow::anyhow;
use container_common::anyhow_result::AnyhowResult;

/// Text Pipelines for TTS
/// The system only tolerates the following values for TTS text pipelines.
///
/// This is *not* a database enum, but the text serializations get stored in the database in a
/// varchar field and communicated over the API.
#[derive(Clone, Copy, PartialEq, Eq, Debug, Serialize, Deserialize)]
pub enum TextPipelineType {

  // TODO: Introduce old vocodes models.
  //#[serde(rename = "legacy_vocodes")]
  //LegacyVocodes,

  /// Introduction date: 2021.
  /// Legacy FakeYou models use graphemes by default. They "can" support arpabet segments manually
  /// specified by the user with curly brackets, but there is no guarantee that the model supports
  /// this. By default the model will be sent grapheme symbols converted to integers.
  #[serde(rename = "legacy_fakeyou")]
  LegacyFakeYou,

  /// Introduction date: July 2022, though models trained earlier on arpabet should support this.
  /// Unlike "legacy_fakeyou", this forces arpabet lookup of graphemes in all cases possible. The
  /// integer encoding is the same, but there are some additional normalization routines.
  #[serde(rename = "english_v1")]
  EnglishV1,

  /// Introduction date: approx July 2022.
  /// This was developed by Ezequiel and Mathias using a modified arpabet scheme similar to
  /// "english_v1".
  /// NB(2022-07-05): not landed or supported landed yet.
  #[serde(rename = "spanish_v1")]
  SpanishV1,

  /// Introduction date: approx July 2022.
  /// An improvement upon "spanish_v1" that uses Ezequiel's Espeak system.
  /// (Technically "spanish_v1" has not been introduced.)
  #[serde(rename = "spanish_v2")]
  SpanishV2,
}

// TODO: Sucks to redefine enum variants. `serde_variant` looks like a fix, but it's GPL3.
const LEGACY_FAKEYOU : &'static str = "legacy_fakeyou";
const ENGLISH_V1 : &'static str = "english_v1";
const SPANISH_V1 : &'static str = "spanish_v1";
const SPANISH_V2 : &'static str = "spanish_v2";

impl TextPipelineType {

  /// Check if the text pipeline name is valid and supported.
  pub fn is_valid_name(tts_text_pipeline: &str) -> bool {
    Self::from_str(tts_text_pipeline).is_ok()
  }

  // TODO: There has to be a better way to extract serde variant info.
  //  `serde_variant` looks like a fix, but it's GPL3.
  pub fn to_str(&self) -> &'static str {
    match self {
      TextPipelineType::LegacyFakeYou => LEGACY_FAKEYOU,
      TextPipelineType::EnglishV1 => ENGLISH_V1,
      TextPipelineType::SpanishV1 => SPANISH_V1,
      TextPipelineType::SpanishV2 => SPANISH_V2,
    }
  }

  pub fn from_str(tts_text_pipeline: &str) -> AnyhowResult<Self> {
    match tts_text_pipeline {
      LEGACY_FAKEYOU => Ok(Self::LegacyFakeYou),
      ENGLISH_V1 => Ok(Self::EnglishV1),
      SPANISH_V1 => Ok(Self::SpanishV1),
      SPANISH_V2 => Ok(Self::SpanishV2),
      _ => Err(anyhow!("invalid variant: {}", tts_text_pipeline)),
    }
  }
}

#[cfg(test)]
mod tests {
  use crate::text_pipelines::text_pipeline_type::TextPipelineType;

  #[test]
  fn valid_text_pipeline_names() {
    assert!(TextPipelineType::is_valid_name("legacy_fakeyou"));
    assert!(TextPipelineType::is_valid_name("english_v1"));
    assert!(TextPipelineType::is_valid_name("spanish_v1"));
    assert!(TextPipelineType::is_valid_name("spanish_v2"));
  }

  #[test]
  fn invalid_text_pipeline_names() {
    // Garbage
    assert!(!TextPipelineType::is_valid_name(""));
    assert!(!TextPipelineType::is_valid_name("asdf"));

    // NB: Must be lower case
    assert!(!TextPipelineType::is_valid_name("LEGACY_FAKEYOU"));
    assert!(!TextPipelineType::is_valid_name("ENGLISH_V1"));
    assert!(!TextPipelineType::is_valid_name("SPANISH_V1"));
    assert!(!TextPipelineType::is_valid_name("SPANISH_V2"));

    // NB: Not yet supported
    assert!(!TextPipelineType::is_valid_name("legacy_vocodes"));
    assert!(!TextPipelineType::is_valid_name("spanish_v3"));
    assert!(!TextPipelineType::is_valid_name("english_v2"));

    // Wrong names
    assert!(!TextPipelineType::is_valid_name("english"));
    assert!(!TextPipelineType::is_valid_name("spanish"));
    assert!(!TextPipelineType::is_valid_name("vocodes"));
  }
}
