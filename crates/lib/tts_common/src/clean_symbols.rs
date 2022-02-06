use once_cell::sync::Lazy;
use std::collections::HashMap;
use unicode_segmentation::UnicodeSegmentation;

// https://unicodelookup.com/#quo
static REPLACEMENTS : Lazy<HashMap<String, String>> = Lazy::new(|| {
  let mut map = HashMap::new();
  // Quotes (single)
  map.insert("\u{0060}".to_string(), "'".to_string()); // Grave Accent
  map.insert("\u{00B4}".to_string(), "'".to_string()); // Acute Accent
  map.insert("\u{2018}".to_string(), "'".to_string()); // Left Single Quotation Mark
  map.insert("\u{2019}".to_string(), "'".to_string()); // Right Single Quotation Mark
  map.insert("\u{201A}".to_string(), "'".to_string()); // Single Low-9 Quotation Mark
  // Quotes (double)
  map.insert("\u{201C}".to_string(), "\"".to_string()); // Left Double Quotation Mark
  map.insert("\u{201D}".to_string(), "\"".to_string()); // Right Double Quotation Mark
  map.insert("\u{201E}".to_string(), "\"".to_string()); // Double Low-9 Quotation Mark
  // Dashes
  map.insert("\u{2010}".to_string(), "-".to_string()); // Hyphen
  map.insert("\u{2011}".to_string(), "-".to_string()); // Non-Breaking Hyphen
  map.insert("\u{2013}".to_string(), "-".to_string()); // En Dash
  map.insert("\u{2014}".to_string(), "-".to_string()); // Em Dash
  map.insert("\u{2015}".to_string(), "-".to_string()); // Horizontal Bar
  map.insert("\u{2E3A}".to_string(), "-".to_string()); // Two-Em Dash
  map.insert("\u{2E3B}".to_string(), "-".to_string()); // Three-Em Dash
  map.insert("\u{FE58}".to_string(), "-".to_string()); // Small Em Dash
  map.insert("\u{FE63}".to_string(), "-".to_string()); // Small Hyphen-Minus
  map.insert("\u{FF0D}".to_string(), "-".to_string()); // Fullwidth Hyphen-Minus
  // Ellipsis
  map.insert("…".to_string(), "...".to_string());
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
    assert_eq!(clean_symbols("three em ⸻ dash"), "three em - dash".to_string());
  }

  #[test]
  fn filters_ellipsis() {
    assert_eq!(clean_symbols("test…"), "test...".to_string());
  }
}
