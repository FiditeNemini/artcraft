use once_cell::sync::Lazy;
use std::collections::HashMap;
use unicode_segmentation::UnicodeSegmentation;
use user_input_common::latin_alphabet::LATIN_TO_ASCII_CHARACTER_MAP;

// Used to insert tables into hashmap
fn deref_to_owned(item: (&String, &String)) -> (String, String) {
  (item.0.to_string(), item.1.to_string())
}

fn to_owned(item: &(&str, &str)) -> (String, String) {
  (item.0.to_string(), item.1.to_string())
}

// https://unicodelookup.com/#quo
// http://www.geocities.ws/click2speak/unicode/chars_es.html
static REPLACEMENTS : Lazy<HashMap<String, String>> = Lazy::new(|| {
  let mut map = HashMap::new();

  // Latin characters such as àáâãäå
  map.extend(LATIN_TO_ASCII_CHARACTER_MAP.iter().map(&deref_to_owned));

  // Weird spacing character replacements
  map.extend([
    ("\u{00a0}", " "), // Non-break space (aka &nbsp;) \xa0
    ("\u{2005}", " "), // Four-Per-Em Space
    ("\u{205F}", " "), // Medium Mathematical Space (MMSP)
    ("\u{2588}", " "), // Full Block
  ].iter().map(&to_owned));

  // Quotes (single)
  map.extend([
    ("\u{0060}", "'"), // Grave Accent
    ("\u{00B4}", "'"), // Acute Accent
    ("\u{2018}", "'"), // Left Single Quotation Mark
    ("\u{2019}", "'"), // Right Single Quotation Mark
    ("\u{201A}", "'"), // Single Low-9 Quotation Mark
    ("\u{201B}", "'"), // Single High-Revered-9 Quotation Mark
  ].iter().map(&to_owned));

  // Quotes (double)
  map.extend([
    ("\u{201C}", "\""), // Left Double Quotation Mark
    ("\u{201D}", "\""), // Right Double Quotation Mark
    ("\u{201E}", "\""), // Double Low-9 Quotation Mark
    ("\u{201F}", "\""), // Double High-Reversed-9 Quotation Mark
    ("\u{301D}", "\""), // Reversed Double Prime Quotation Mark
    ("\u{301E}", "\""), // Double Prime Quotation Mark
    ("\u{301F}", "\""), // Low Double Prime Quotation Mark
    ("\u{FF02}", "\""), // Fullwidth Quotation Mark
  ].iter().map(&to_owned));

  // Dashes
  map.extend([
    ("\u{2010}", "-"), // Hyphen
    ("\u{2011}", "-"), // Non-Breaking Hyphen
    ("\u{2013}", "-"), // En Dash
    ("\u{2014}", "-"), // Em Dash
    ("\u{2015}", "-"), // Horizontal Bar
    ("\u{2E3A}", "-"), // Two-Em Dash
    ("\u{2E3B}", "-"), // Three-Em Dash
    ("\u{FE58}", "-"), // Small Em Dash
    ("\u{FE63}", "-"), // Small Hyphen-Minus
    ("\u{FF0D}", "-"), // Fullwidth Hyphen-Minus
  ].iter().map(&to_owned));

  // Spanish special characters
  map.extend([
    ("\u{A1}", "!"), // Inverted exclamation mark
    ("\u{BF}", "?"), // Inverted question mark
    ("\u{AA}", "a"), // Feminine ordinal
    ("\u{BA}", "o"), // Masculine ordinal
  ].iter().map(&to_owned));

  // Misc
  map.insert("…".to_string(), "...".to_string()); // Ellipsis
  map.insert("\u{3001}".to_string(), ",".to_string()); // Commas

  // Misc characters that frequently occur
  map.insert("\u{203C}".to_string(), "!!".to_string());  // Double Exclamation Mark

  // Close enough to existing allowed punctuation
  map.extend([
    ("\u{3002}", "."), // idiographic full stop
  ].iter().map(&to_owned));

  // Symbols we can insert as words
  map.extend([
    ("\u{B0}", " degrees "), // degree sign
    ("\u{03C0}", " pie "), // greek small letter pi
    ("\u{2122}", " trademark "), // trade mark sign
  ].iter().map(&to_owned));

  // These shouldn't be in the output at all
  map.extend([
    ("\u{b7}", ""), // middle dot
    ("\u{2022}", ""), // bullet
  ].iter().map(&to_owned));

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
  fn symbol_expansion() {
    assert_eq!(clean_symbols("Pokémon™ is a popular video game series"),
               "Pokemon trademark  is a popular video game series".to_string()); // NB: Extra space
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
    assert_eq!(clean_symbols("ú"), "u".to_string());
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
