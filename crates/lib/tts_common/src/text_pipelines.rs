//! We support a variety of text pipeline systems.

use std::collections::HashSet;
use once_cell::sync::Lazy;

// TODO: Introduce old vocodes models.
//pub const LEGACY_VOCODES : &'static str = "legacy_vocodes";

/// Introduction date: 2021.
/// Legacy FakeYou models use graphemes by default. They "can" support arpabet segments manually
/// specified by the user with curly brackets, but there is no guarantee that the model supports
/// this. By default the model will be sent grapheme symbols converted to integers.
pub const LEGACY_FAKEYOU : &'static str = "legacy_fakeyou";

/// Introduction date: July 2022, though models trained earlier on arpabet should support this.
/// Unlike "legacy_fakeyou", this forces arpabet lookup of graphemes in all cases possible. The
/// integer encoding is the same, but there are some additional normalization routines.
pub const ENGLISH_V1 : &'static str = "english_v1";

/// Introduction date: approx July 2022.
/// This was developed by Ezequiel and Mathias using a modified arpabet scheme similar to
/// "english_v1".
/// NB(2022-07-05): Technically not landed yet.
pub const SPANISH_V1 : &'static str = "spanish_v1";

/// Introduction date: approx July 2022.
/// An improvement upon "spanish_v1" that uses an entirely different phonetic system.
/// NB(2022-07-05): Technically not landed yet.
pub const SPANISH_V2 : &'static str = "spanish_v2";

static SUPPORTED_TEXT_PIPELINES : Lazy<HashSet<String>> = Lazy::new(|| {
  let text_pipeline_names = [
    LEGACY_FAKEYOU,
    ENGLISH_V1,
    SPANISH_V1,
    SPANISH_V2,
  ];
  text_pipeline_names.iter()
      .map(|tag| tag.to_string())
      .collect::<HashSet<String>>()
});

/// Check if the text pipeline name (must be lowercase) is valid and supported.
pub fn is_valid_text_pipeline(text_pipeline_name: &str) -> bool {
  SUPPORTED_TEXT_PIPELINES.contains(text_pipeline_name)
}

#[cfg(test)]
mod tests {
  use crate::text_pipelines::is_valid_text_pipeline;

  #[test]
  fn valid_text_pipelines() {
    assert!(is_valid_text_pipeline("legacy_fakeyou"));
    assert!(is_valid_text_pipeline("english_v1"));
    assert!(is_valid_text_pipeline("spanish_v1"));
    assert!(is_valid_text_pipeline("spanish_v2"));
  }

  #[test]
  fn invalid_text_pipelines() {
    // Garbage
    assert!(!is_valid_text_pipeline(""));
    assert!(!is_valid_text_pipeline("asdf"));

    // NB: Must be lower case
    assert!(!is_valid_text_pipeline("LEGACY_FAKEYOU"));
    assert!(!is_valid_text_pipeline("ENGLISH_V1"));
    assert!(!is_valid_text_pipeline("SPANISH_V1"));
    assert!(!is_valid_text_pipeline("SPANISH_V2"));

    // NB: Not yet supported
    assert!(!is_valid_text_pipeline("legacy_vocodes"));
    assert!(!is_valid_text_pipeline("spanish_v3"));
    assert!(!is_valid_text_pipeline("english_v2"));

    // Wrong names
    assert!(!is_valid_text_pipeline("english"));
    assert!(!is_valid_text_pipeline("spanish"));
    assert!(!is_valid_text_pipeline("vocodes"));
  }
}
