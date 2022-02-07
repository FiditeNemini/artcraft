use language_tags::{LanguageTag, ParseError};
use log::warn;

/// Parse out accept languages
/// Does not error so that the endpoint won't degrade
pub fn parse_accept_language(accept_languages_header: &str) -> Vec<LanguageTag> {
  let unparsed_tags = accept_languages_header.split(",")
      .into_iter()
      .map(|tag| tag.trim().to_string())
      .collect::<Vec<String>>();

  let mut parsed_tags = Vec::new();

  for tag in unparsed_tags.iter() {
    match LanguageTag::parse(tag.as_ref()) {
      Ok(t) => {
        parsed_tags.push(t);
      }
      Err(e) => {
        warn!("Error parsing language tag: {:?}", e);
      }
    }
  }

  parsed_tags
}

#[cfg(test)]
mod tests {
  use crate::request::parse_accept_language::parse_accept_language;

  #[test]
  fn test_empty() {
    assert_eq!(parse_accept_language(""), Vec::new());
  }

  #[test]
  fn test_garbage() {
    assert_eq!(parse_accept_language("HJHKDJSHJKHSF"), Vec::new());
    assert_eq!(parse_accept_language("\n\n"), Vec::new());
  }

  #[test]
  fn test_single_language() {
    let list = parse_accept_language("en-US");
    let lang = list.get(0).unwrap();
    assert_eq!(lang.primary_language(), "en");

    let list = parse_accept_language("en-GB");
    let lang = list.get(0).unwrap();
    assert_eq!(lang.primary_language(), "en");

    let list = parse_accept_language("ja-JP");
    let lang = list.get(0).unwrap();
    assert_eq!(lang.primary_language(), "ja");
  }

  #[test]
  fn test_multiple() {
    let list = parse_accept_language("en-US, es-419");
    let first = list.get(0).unwrap();
    let second = list.get(1).unwrap();
    assert_eq!(first.primary_language(), "en");
    assert_eq!(second.primary_language(), "es");

    let list = parse_accept_language("en, es, en-GB");
    let first = list.get(0).unwrap();
    let second = list.get(1).unwrap();
    let third= list.get(2).unwrap();
    assert_eq!(first.primary_language(), "en");
    assert_eq!(second.primary_language(), "es");
    assert_eq!(third.primary_language(), "en");
  }
}
