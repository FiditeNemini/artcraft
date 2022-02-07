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

  // Spacing character replacements
  map.extend([
    ("\u{00A0}", " "), // Non-break space (aka &nbsp;) \xa0
    ("\u{2005}", " "), // Four-Per-Em Space
    ("\u{205F}", " "), // Medium Mathematical Space (MMSP)
    ("\u{2588}", " "), // Full Block
    ("\u{3000}", " "), // Ideographic Space
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
    ("\u{3002}", "."), // Ideographic full stop
    ("\u{FF01}", "!"), // Fullwidth Exclamation Mark
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

  fn assert_converted(original: &str, expected: &str) {
    assert_eq!(clean_symbols(original), expected.to_string());
  }

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

  #[test]
  pub fn most_frequent_failures_10k_usages() {
    // The leftmost number is the number of occurrences in our histogram of TTS failures
    // The order of the lines is reversed.
    assert_converted("ş", "s"); // b'\\u015f' 10006
    assert_converted(" ", " "); // b'\\u2005' 10118
    assert_converted("—", "-"); // b'\\u2014' 10555
    assert_converted("ã", "a"); // b'\xe3' 10586
    assert_converted("ǎ", "a"); // b'\\u01ce' 10843
    assert_converted("ə", "e"); // b'\\u0259' 11508
    assert_converted("ö", "o"); // b'\xf6' 11908
    assert_converted("¿", "?"); // b'\xbf' 13501
    assert_converted("ç", "c"); // b'\xe7' 13784
    assert_converted(" ", " "); //  b'\xa0' 14184
    assert_converted("ō", "o"); //  b'\\u014d' 14329
    assert_converted("ā", "a"); //  b'\\u0101' 15927
    assert_converted("¡", "!"); //  b'\xa1' 17933
    assert_converted("ǐ", "i"); //  b'\\u01d0' 20236
    assert_converted("ī", "i"); //  b'\\u012b' 20257
    assert_converted("è", "e"); //  b'\xe8' 21121
    assert_converted("°", " degrees "); //  b'\xb0' 22808
    assert_converted("“", "\""); //  b'\\u201c' 27343
    assert_converted("ü", "u"); // b'\xfc' 27955
    assert_converted("”", "\""); // b'\\u201d' 28171
    assert_converted("à", "a"); // b'\xe0' 34414
    assert_converted("ı", "i"); // b'\\u0131' 44032
    assert_converted("ú", "u"); // b'\xfa' 44043
    assert_converted("…", "..."); // b'\\u2026' 49348
    assert_converted("ñ", "n"); // b'\xf1' 105898
    assert_converted("ó", "o"); // b'\xf3' 127099
    assert_converted("í", "i"); // b'\xed' 132716
    assert_converted("é", "e"); // b'\xe9' 140278
    assert_converted("á", "a"); // b'\xe1' 184138
    assert_converted("’", "'"); // b'\\u2019' 739079
  }

  #[test]
  pub fn most_frequent_failures_1k_usages() {
    assert_converted("　", " "); // b'\\u3000' 1005
    //assert_converted("🤣", " laugh "); // b'\\U0001f923' 1010
    assert_converted("ø", "o"); // b'\xf8' 1017
    assert_converted("！", "!"); // b'\\uff01' 1019
    //assert_converted("¥", " yen "); // b'\xa5' 1033
    //assert_converted("😭", "cry "); // b'\\U0001f62d' 1061
    assert_converted("Ü", "U"); // b'\xdc' 1062
    assert_converted("č", "c"); // b'\\u010d' 1092
    assert_converted("ν", "v"); // b'\\u03bd' 1096
    assert_converted("ż", "z"); // b'\\u017c' 1099
    assert_converted("⠀", " "); // b'\\u2800' 1166
    assert_converted("ą", "a"); // b'\\u0105' 1169
    //assert_converted("£", " pounds "); // b'\xa3' 1186
    assert_converted("ë", "e"); // b'\xeb' 1189
    assert_converted("Ç", "C"); // b'\xc7' 1213
    assert_converted("τ", "t"); // b'\\u03c4' 1217
    assert_converted("ẹ", "e"); // b'\\u1eb9' 1228
    assert_converted("î", "i"); // b'\xee' 1349
    assert_converted("ś", "s"); // b'\\u015b' 1402
    assert_converted("ạ", "a"); // b'\\u1ea1' 1413
    assert_converted("Í", "I"); // b'\xcd' 1434
    assert_converted("·", "."); // b'\xb7' 1514
    assert_converted("š", "s"); // b'\\u0161' 1514
    assert_converted("ο", "o"); // b'\\u03bf' 1515
    assert_converted("ū", "u"); // b'\\u016b' 1523
    assert_converted("Ö", "O"); // b'\xd6' 1543
    assert_converted("ι", "l"); // b'\\u03b9' 1559
    assert_converted("ε", "e"); // b'\\u03b5' 1575
    assert_converted("ă", "a"); // b'\\u0103' 1576
    //assert_converted("😂", ""); // b'\\U0001f602' 1741
    assert_converted("Ó", "O"); // b'\xd3' 1774
    assert_converted("ư", "u"); // b'\\u01b0' 1794
    assert_converted("•", ""); // b'\\u2022' 1948
    assert_converted("、", ","); // b'\\u3001' 2001
    assert_converted("ć", "c"); // b'\\u0107' 2017
    assert_converted("ę", "e"); // b'\\u0119' 2236
    assert_converted("。", "."); // b'\\u3002' 2288
    assert_converted(" ", " "); // b'\\u205f' 2347
    assert_converted("ᴺ", "n"); // b'\\u1d3a' 2383
    assert_converted("ě", "e"); // b'\\u011b' 2441
    assert_converted("ᴾ", "p"); // b'\\u1d3e' 2479
    assert_converted("ł", "s"); // b'\\u0142' 2480
    assert_converted("～", "~"); // b'\\uff5e' 2507
    assert_converted("â", "a"); // b'\xe2' 2607
    assert_converted("α", "a"); // b'\\u03b1' 2625
    assert_converted("å", "a"); // b'\xe5' 2753
    //assert_converted("🐶", " dog "); // b'\\U0001f436' 2782
    assert_converted("™", " trademark "); // b'\\u2122' 2869
    assert_converted("É", "E"); // b'\xc9' 3040
    assert_converted("æ", "ae"); // b'\xe6' 3142
    assert_converted("¨", "\""); // b'\xa8' 3236
    assert_converted("ò", "o"); // b'\xf2' 3250
    assert_converted("đ", "d"); // b'\\u0111' 3420
    assert_converted("，", ","); // b'\\uff0c' 3487
    assert_converted("ô", "o"); // b'\xf4' 3568
    assert_converted("Á", "A"); // b'\xc1' 3779
    assert_converted("ß", "B"); // b'\xdf' 3779
    assert_converted("Ñ", "N"); // b'\xd1' 3963
    assert_converted("ǒ", "o"); // b'\\u01d2' 4613
    assert_converted("İ", "I"); // b'\\u0130' 4808
    assert_converted("​", " "); // b'\\u200b' 6019
    assert_converted("ğ", "g"); // b'\\u011f' 6103
    assert_converted("–", "-"); // b'\\u2013' 6172
    assert_converted("ì", "i"); // b'\xec' 6209
    assert_converted("ē", "e"); // b'\\u0113' 6312
    assert_converted("ù", "u"); // b'\xf9' 6907
    assert_converted("‘", "'"); // b'\\u2018' 7151
    assert_converted("ǔ", "u"); // b'\\u01d4' 7422
    assert_converted("´", "'"); // b'\xb4' 8210
    assert_converted("ê", "e"); // b'\xea' 8882
    assert_converted("ä", "a"); // b'\xe4' 9202
  }
}
