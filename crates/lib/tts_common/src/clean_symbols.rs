use once_cell::sync::Lazy;
use std::collections::HashMap;
use unicode_segmentation::UnicodeSegmentation;
use user_input_common::latin_alphabet::LATIN_TO_ASCII_CHARACTER_MAP;

// https://unicodelookup.com/#quo
// http://www.geocities.ws/click2speak/unicode/chars_es.html
static REPLACEMENTS : Lazy<HashMap<String, String>> = Lazy::new(|| {
  let mut map = HashMap::new();

  // Latin characters such as àáâãäå
  map.extend(LATIN_TO_ASCII_CHARACTER_MAP.iter()
      .map(|(k, v)| (k.to_string(), v.to_string())));

  // Weird spacing characters
  map.insert("\u{00a0}".to_string(), " ".to_string());  // Non-break space (aka &nbsp;) \xa0
  map.insert("\u{2005}".to_string(), " ".to_string());  // Four-Per-Em Space
  map.insert("\u{2588}".to_string(), " ".to_string());  // Full Block
  map.insert("\u{205F}".to_string(), " ".to_string());  // Medium Mathematical Space (MMSP)
  // Quotes (single)
  map.insert("\u{0060}".to_string(), "'".to_string()); // Grave Accent
  map.insert("\u{00B4}".to_string(), "'".to_string()); // Acute Accent
  map.insert("\u{2018}".to_string(), "'".to_string()); // Left Single Quotation Mark
  map.insert("\u{2019}".to_string(), "'".to_string()); // Right Single Quotation Mark
  map.insert("\u{201A}".to_string(), "'".to_string()); // Single Low-9 Quotation Mark
  map.insert("\u{201B}".to_string(), "'".to_string()); // Single High-Revered-9 Quotation Mark
  // Quotes (double)
  map.insert("\u{201C}".to_string(), "\"".to_string()); // Left Double Quotation Mark
  map.insert("\u{201D}".to_string(), "\"".to_string()); // Right Double Quotation Mark
  map.insert("\u{201E}".to_string(), "\"".to_string()); // Double Low-9 Quotation Mark
  map.insert("\u{201F}".to_string(), "\"".to_string()); // Double High-Reversed-9 Quotation Mark
  map.insert("\u{301D}".to_string(), "\"".to_string()); // Reversed Double Prime Quotation Mark
  map.insert("\u{301E}".to_string(), "\"".to_string()); // Double Prime Quotation Mark
  map.insert("\u{301F}".to_string(), "\"".to_string()); // Low Double Prime Quotation Mark
  map.insert("\u{FF02}".to_string(), "\"".to_string()); // Fullwidth Quotation Mark
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
  // Commas
  map.insert("\u{3001}".to_string(), ",".to_string());
  // Spanish special characters
  map.insert("\u{A1}".to_string(), "!".to_string());  // Inverted exclamation mark
  map.insert("\u{BF}".to_string(), "?".to_string());  // Inverted question mark
  map.insert("\u{AA}".to_string(), "a".to_string());  // Feminine ordinal
  map.insert("\u{BA}".to_string(), "o".to_string());  // Masculine ordinal
  // Misc characters that frequently occur
  map.insert("\u{203C}".to_string(), "!!".to_string());  // Double Exclamation Mark
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
    assert_eq!(clean_symbols(""), "".to_string()); // Empty check
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

  #[test]
  fn filters_latin_characters() {
    assert_eq!(clean_symbols("pokémon"), "pokemon".to_string());
    assert_eq!(clean_symbols("POKÉMON"), "POKEMON".to_string());
    assert_eq!(clean_symbols("Æther"), "AEther".to_string());
    assert_eq!(clean_symbols("æther"), "aether".to_string());
    // Almost exhaustive
    assert_eq!(clean_symbols("ÀÁÂÃÄÅ"), "AAAAAA".to_string());
    assert_eq!(clean_symbols("Æ"), "AE".to_string());
    assert_eq!(clean_symbols("Ç"), "C".to_string());
    assert_eq!(clean_symbols("ÈÉÊË"), "EEEE".to_string());
    assert_eq!(clean_symbols("ÌÍÎÏ"), "IIII".to_string());
    assert_eq!(clean_symbols("ÒÓÔÕÖØ"), "OOOOOO".to_string());
    assert_eq!(clean_symbols("ÙÚÛÜ"), "UUUU".to_string());
    assert_eq!(clean_symbols("Ý"), "Y".to_string());
    assert_eq!(clean_symbols("àáâãäå"), "aaaaaa".to_string());
    assert_eq!(clean_symbols("æ"), "ae".to_string());
    assert_eq!(clean_symbols("ç"), "c".to_string());
    assert_eq!(clean_symbols("èéêë"), "eeee".to_string());
    assert_eq!(clean_symbols("ìíîï"), "iiii".to_string());
  }

  #[test]
  fn filters_spanish_characters() {
    assert_eq!(clean_symbols("¡"), "!".to_string());
    assert_eq!(clean_symbols("¿"), "?".to_string());
  }

  #[test]
  fn actual_database_failures() {
    assert_eq!(clean_symbols(
      "Sabías que?,tu papá es el tercer planeta del sistema solar"),
               "Sabias que?,tu papa es el tercer planeta del sistema solar".to_string());
    assert_eq!(clean_symbols("señoras"), "senoras".to_string());

    // Most frequent according to partial histogram
    assert_eq!(clean_symbols("á"), "a".to_string());
    assert_eq!(clean_symbols("í"), "i".to_string());
    assert_eq!(clean_symbols("ó"), "o".to_string());
    assert_eq!(clean_symbols("é"), "e".to_string());
    assert_eq!(clean_symbols("ñ"), "n".to_string());
    assert_eq!(clean_symbols("ú"), "ú".to_string());
    assert_eq!(clean_symbols("ı"), "i".to_string()); // Dotless i
    assert_eq!(clean_symbols("ü"), "u".to_string());
    assert_eq!(clean_symbols("¿"), "?".to_string());
    assert_eq!(clean_symbols("…"), "...".to_string());
    assert_eq!(clean_symbols("¡"), "!".to_string());
    assert_eq!(clean_symbols("ş"), "s".to_string());
    assert_eq!(clean_symbols("ç"), "c".to_string());
    assert_eq!(clean_symbols("”"), "\"".to_string());
    assert_eq!(clean_symbols("“"), "\"".to_string());
    assert_eq!(clean_symbols("ö"), "o".to_string());
    assert_eq!(clean_symbols("ğ"), "g".to_string());
    assert_eq!(clean_symbols("\u{00a0}"), " ".to_string());
    assert_eq!(clean_symbols("ã"), "a".to_string());
    assert_eq!(clean_symbols("à"), "a".to_string());
    assert_eq!(clean_symbols("Á"), "A".to_string());
    assert_eq!(clean_symbols("İ"), "I".to_string());
    assert_eq!(clean_symbols(" "), " ".to_string());
    assert_eq!(clean_symbols(" "), " ".to_string());
    assert_eq!(clean_symbols("—"), "-".to_string());
    assert_eq!(clean_symbols("Ñ"), "N".to_string());
    assert_eq!(clean_symbols("´"), "'".to_string());
    assert_eq!(clean_symbols("ê"), "e".to_string());
    assert_eq!(clean_symbols("ə"), "e".to_string());
    assert_eq!(clean_symbols("è"), "e".to_string());
    assert_eq!(clean_symbols("ī"), "i".to_string());
    assert_eq!(clean_symbols("ᴺ"), "n".to_string());
    assert_eq!(clean_symbols(" "), " ".to_string());
    assert_eq!(clean_symbols("ä"), "a".to_string());
    assert_eq!(clean_symbols("ǐ"), "i".to_string());
    assert_eq!(clean_symbols("█"), " ".to_string());
    assert_eq!(clean_symbols("ō"), "o".to_string());
    assert_eq!(clean_symbols("‘"), "'".to_string());
    assert_eq!(clean_symbols("Í"), "I".to_string());
    assert_eq!(clean_symbols("É"), "E".to_string());
    assert_eq!(clean_symbols("ā"), "a".to_string());
    assert_eq!(clean_symbols("ù"), "u".to_string());
    assert_eq!(clean_symbols("、"), ",".to_string());
    assert_eq!(clean_symbols("ǎ"), "a".to_string());
    assert_eq!(clean_symbols("‼"), "!!".to_string());

    // TODO: assert_eq!(clean_symbols("ß"), "B".to_string());
    // TODO: assert_eq!(clean_symbols("°"), "degrees".to_string());
  }
}
