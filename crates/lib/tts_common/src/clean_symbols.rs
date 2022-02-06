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
  // Latin characters with accent (A)
  map.insert("\u{C0}".to_string(), "A".to_string()); // Latin capital letter a with grave
  map.insert("\u{C1}".to_string(), "A".to_string()); // Latin capital letter a with acute
  map.insert("\u{C2}".to_string(), "A".to_string()); // Latin capital letter a with circumflex
  map.insert("\u{C3}".to_string(), "A".to_string()); // Latin capital letter a with tilde
  map.insert("\u{C4}".to_string(), "A".to_string()); // Latin capital letter a diaeresis
  map.insert("\u{C5}".to_string(), "A".to_string()); // Latin capital letter a with ring above
  // Latin characters with accent (AE)
  map.insert("\u{C6}".to_string(), "AE".to_string()); // Latin capital letter ae
  // Latin characters with accent (C)
  map.insert("\u{C7}".to_string(), "C".to_string()); // Latin capital letter c with cedilla
  // Latin characters with accent (E)
  map.insert("\u{C8}".to_string(), "E".to_string()); // Latin capital letter e with grave
  map.insert("\u{C9}".to_string(), "E".to_string()); // Latin capital letter e with acute
  map.insert("\u{CA}".to_string(), "E".to_string()); // Latin capital letter e with circumflex
  map.insert("\u{CB}".to_string(), "E".to_string()); // Latin capital letter e with diaeresis
  // Latin characters with accent (I)
  map.insert("\u{CC}".to_string(), "I".to_string()); // Latin capital letter i with grave
  map.insert("\u{CD}".to_string(), "I".to_string()); // Latin capital letter i with acute
  map.insert("\u{CE}".to_string(), "I".to_string()); // Latin capital letter i with circumflex
  map.insert("\u{CF}".to_string(), "I".to_string()); // Latin capital letter i with diaeresis
  // Latin characters with accent (ETH)
  // map.insert("\u{D0}".to_string(), "D".to_string()); // Latin capital letter eth
  // Latin characters with accent (N)
  map.insert("\u{D1}".to_string(), "N".to_string()); // Latin capital letter n with tilde
  // Latin characters with accent (O)
  map.insert("\u{D2}".to_string(), "O".to_string()); // Latin capital letter o with grave
  map.insert("\u{D3}".to_string(), "O".to_string()); // Latin capital letter o with acute
  map.insert("\u{D4}".to_string(), "O".to_string()); // Latin capital letter o with circumflex
  map.insert("\u{D5}".to_string(), "O".to_string()); // Latin capital letter o with tilde
  map.insert("\u{D6}".to_string(), "O".to_string()); // Latin capital letter o with diaeresis
  map.insert("\u{D8}".to_string(), "O".to_string()); // Latin capital letter o with stroke (NB: Skips D7)
  // Latin characters with accent (U)
  map.insert("\u{D9}".to_string(), "U".to_string()); // Latin capital letter u with grave
  map.insert("\u{DA}".to_string(), "U".to_string()); // Latin capital letter u with acute
  map.insert("\u{DB}".to_string(), "U".to_string()); // Latin capital letter u with circumflex
  map.insert("\u{DC}".to_string(), "U".to_string()); // Latin capital letter u with diaeresis
  // Latin characters with accent (Y)
  map.insert("\u{DD}".to_string(), "Y".to_string()); // Latin capital letter y with acute
  // Latin characters with accent (THORN)
  // map.insert("\u{DE}".to_string(), "P".to_string()); // Latin capital letter thorn
  // Latin characters with accent (SHARP S)
  // map.insert("\u{DF}".to_string(), "B".to_string()); // Latin capital letter sharp s
  // Latin characters with accent (a)
  map.insert("\u{E0}".to_string(), "a".to_string()); // Latin small letter a with grave
  map.insert("\u{E1}".to_string(), "a".to_string()); // Latin small letter a with acute
  map.insert("\u{E2}".to_string(), "a".to_string()); // Latin small letter a with circumflex
  map.insert("\u{E3}".to_string(), "a".to_string()); // Latin small letter a with tilde
  map.insert("\u{E4}".to_string(), "a".to_string()); // Latin small letter a with diaeresis
  map.insert("\u{E5}".to_string(), "a".to_string()); // Latin small letter a with ring above
  // Latin characters with accent (ae)
  map.insert("\u{E6}".to_string(), "ae".to_string()); // Latin small letter ae
  // Latin characters with accent (c)
  map.insert("\u{E7}".to_string(), "c".to_string()); // Latin small letter c with cedilla
  // Latin characters with accent (e)
  map.insert("\u{E8}".to_string(), "e".to_string()); // Latin small letter e with grave
  map.insert("\u{E9}".to_string(), "e".to_string()); // Latin small letter e with acute
  map.insert("\u{EA}".to_string(), "e".to_string()); // Latin small letter e with circumflex
  map.insert("\u{EB}".to_string(), "e".to_string()); // Latin small letter e with diaeresis
  // Latin characters with accent (i)
  map.insert("\u{EC}".to_string(), "i".to_string()); // Latin small letter i with grave
  map.insert("\u{ED}".to_string(), "i".to_string()); // Latin small letter i with acute
  map.insert("\u{EE}".to_string(), "i".to_string()); // Latin small letter i with circumflex
  map.insert("\u{EF}".to_string(), "i".to_string()); // Latin small letter i with diaeresis
  // Latin characters with accent (eth)
  // map.insert("\u{F0}".to_string(), "d".to_string()); // Latin small letter eith
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
}
