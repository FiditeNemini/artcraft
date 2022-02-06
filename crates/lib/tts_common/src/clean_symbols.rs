use once_cell::sync::Lazy;
use std::collections::HashMap;
use unicode_segmentation::UnicodeSegmentation;

static REPLACEMENTS : Lazy<HashMap<String, String>> = Lazy::new(|| {
  let mut map = HashMap::new();
  map.insert("’".to_string(), "'".to_string());
  map.insert("‘".to_string(), "'".to_string());
  map.insert("“".to_string(), "\"".to_string());
  map.insert("”".to_string(), "\"".to_string());
  map.insert("–".to_string(), "-".to_string()); // endash
  map.insert("—".to_string(), "-".to_string()); // emdash
  map
});

pub fn clean_symbols(input_text: &str) -> String {
  let segmented= UnicodeSegmentation::graphemes(input_text, true)
      .map(|segment| {
        if let Some(replace) = REPLACEMENTS.get(segment) {
          return replace.as_str();
        }
        return segment;
      })
      .collect::<Vec<&str>>();

  segmented.join("")
}

#[cfg(test)]
mod tests {
  use crate::clean_symbols::clean_symbols;

  #[test]
  fn neutral_tests() {
    assert_eq!(clean_symbols("this should be the same."), "this should be the same.".to_string());
    assert_eq!(clean_symbols("one\ntwo\r\nthree    "), "one\ntwo\r\nthree    ".to_string());
  }

  #[test]
  fn filters_smart_quotes() {
    assert_eq!(clean_symbols("That’s ok"), "That's ok".to_string());
    assert_eq!(clean_symbols("That’s it’s new home"), "That's it's new home".to_string());
    assert_eq!(clean_symbols("‘foo’"), "'foo'".to_string());
    assert_eq!(clean_symbols("“as ‘shown’ here.”"), "\"as 'shown' here.\"".to_string());
  }

  #[test]
  fn filters_dashes() {
    assert_eq!(clean_symbols("en – dash"), "en - dash".to_string());
    assert_eq!(clean_symbols("em — dash"), "em - dash".to_string());
  }
}
