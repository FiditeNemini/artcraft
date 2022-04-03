use once_cell::sync::Lazy;
use std::collections::{HashSet, HashMap};

/// These are language tags we try to support.
static SUPPORTED_LANGUAGES_FOR_MODELS : Lazy<HashSet<String>> = Lazy::new(|| {
  let language_tags = [

    // ========== Technically, we only support these so far ==========

    // English
    "en",
    "en-AU",
    "en-CA",
    "en-GB",
    "en-US",
    // Spanish
    "es",
    "es-419",
    "es-AR",
    "es-CL",
    "es-CO",
    "es-ES",
    "es-MX",
    "es-PE",
    "es-US",
    // Portuguese
    "pt",
    "pt-BR",

    // ========== But these are on the horizon ==========

    // French
    "fr",
    "fr-FR",
    // German
    "de",
    "de-DE",
    // Japanese
    "ja",
    "ja-JP",
    // Misc
    "id",
    "id-ID",
    "it",
    "it-IT",
    "ru",
    "ru-RU",
    "th-TH",
    "tr",
    "tr-TR",
    "zh-CN",
    "zh-HK",
  ];
  language_tags.iter()
      .map(|tag| tag.to_string())
      .collect::<HashSet<String>>()
});

/// Convert lower case tags to canonical form
static SUPPORTED_LANGUAGES_FOR_MODELS_CANONICAL_MAP : Lazy<HashMap<String, String>> = Lazy::new(|| {
  SUPPORTED_LANGUAGES_FOR_MODELS.iter()
      .map(|tag| (tag.to_lowercase(), tag.clone()))
      .collect::<HashMap<_,_>>()
});

/// Take a full IETF BCP 47 language tag and return the canonicalized form *IF* we support it
pub fn get_canonicalized_language_tag_for_model(language_tag: &str) -> Option<&'static str> {
  let lowercase = language_tag.to_lowercase();
  SUPPORTED_LANGUAGES_FOR_MODELS_CANONICAL_MAP.get(&lowercase).map(|v| v.as_str())
}

/// Take a full IETF BCP 47 language tag and return true *IF* we support it
/// It must be the correct case.
pub fn is_valid_language_for_models(language_tag: &str) -> bool {
  SUPPORTED_LANGUAGES_FOR_MODELS.contains(language_tag)
}

#[cfg(test)]
mod tests {
  use crate::i18n::supported_languages_for_models::{get_canonicalized_language_tag_for_model, is_valid_language_for_models};

  #[test]
  fn get_canonical_language_for_model_success() {
    assert_eq!("en", get_canonicalized_language_tag_for_model("EN").unwrap());
    assert_eq!("es-419", get_canonicalized_language_tag_for_model("ES-419").unwrap());
    assert_eq!("en-US", get_canonicalized_language_tag_for_model("En-Us").unwrap());
  }

  #[test]
  fn get_canonical_language_for_model_failure() {
    assert!(get_canonicalized_language_tag_for_model("").is_none());
    assert!(get_canonicalized_language_tag_for_model("en-JP").is_none());
    assert!(get_canonicalized_language_tag_for_model("es-Lots-Of-Tags").is_none());
  }

  #[test]
  fn test_valid_language_for_model() {
    // Valid
    assert!(is_valid_language_for_models("en"));
    assert!(is_valid_language_for_models("es-419"));
    assert!(is_valid_language_for_models("ja-JP"));
    // Invalid due to case
    assert!(!is_valid_language_for_models("EN"));
    assert!(!is_valid_language_for_models("ES-419"));
    assert!(!is_valid_language_for_models("JA-jp"));
    // Invalid misc
    assert!(!is_valid_language_for_models(""));
    assert!(!is_valid_language_for_models("foo"));
    assert!(!is_valid_language_for_models("en-FOO"));
  }
}

