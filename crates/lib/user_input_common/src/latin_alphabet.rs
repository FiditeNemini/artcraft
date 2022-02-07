use once_cell::sync::Lazy;
use std::collections::HashMap;
use unicode_segmentation::UnicodeSegmentation;

// http://www.geocities.ws/click2speak/unicode/chars_es.html
pub static LATIN_CHARACTER_MAP : Lazy<HashMap<String, String>> = Lazy::new(|| {
  let mut map = HashMap::new();
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
  // Spanish special characters
  map.insert("\u{F1}".to_string(), "n".to_string());  // Lower n tilde
  map.insert("\u{AA}".to_string(), "a".to_string());  // Feminine ordinal
  map.insert("\u{BA}".to_string(), "o".to_string());  // Masculine ordinal
  // Misc characters that frequently occur
  map.insert("\u{00F3}".to_string(), "o".to_string());  // Latin Small Letter O with Acute
  map.insert("\u{0131}".to_string(), "i".to_string());  // Latin Small Letter Dotless I
  map.insert("\u{00FC}".to_string(), "u".to_string());  // Latin Small Letter U with Diaeresis
  map.insert("\u{015F}".to_string(), "s".to_string());  // Latin Small Letter S with Cedilla
  map.insert("\u{00F6}".to_string(), "o".to_string());  // Latin Small Letter O with Diaeresis
  map.insert("\u{011F}".to_string(), "g".to_string());  // Latin Small Letter G with Breve
  map.insert("\u{0130}".to_string(), "I".to_string());  // Latin Capital Letter I with Dot Above
  map.insert("\u{0259}".to_string(), "e".to_string());  // Latin Small Letter Schwa (TODO: Inaccurate?)
  map.insert("\u{012B}".to_string(), "i".to_string());  // Latin Small Letter I with Macron
  map.insert("\u{1D3A}".to_string(), "n".to_string());  // Modifier Letter Capital N
  map.insert("\u{01D0}".to_string(), "i".to_string());  // Latin Small Letter I with Caron
  map.insert("\u{014D}".to_string(), "o".to_string());  // Latin Small Letter O with Macron
  map.insert("\u{0101}".to_string(), "a".to_string());  // Latin Small Letter A with Macron
  map.insert("\u{00F9}".to_string(), "u".to_string());  // Latin Small Letter U with Grave
  map.insert("\u{01Ce}".to_string(), "a".to_string());  // Latin Small Letter A with Caron
  map
});

pub fn latin_to_ascii(input_text: &str) -> String {
  let segmented = UnicodeSegmentation::graphemes(input_text, true)
      .map(|segment| {
        LATIN_CHARACTER_MAP.get(segment)
            .map(|replace| replace.as_str())
            .unwrap_or(segment)
      })
      .collect::<Vec<&str>>();

  segmented.join("")
}

#[cfg(test)]
mod tests {
  use crate::latin_alphabet::latin_to_ascii;

  #[test]
  fn test_latin_to_ascii() {
    assert_eq!(latin_to_ascii("pokémon"), "pokemon".to_string());
    assert_eq!(latin_to_ascii("POKÉMON"), "POKEMON".to_string());
    assert_eq!(latin_to_ascii("Æther"), "AEther".to_string());
    assert_eq!(latin_to_ascii("æther"), "aether".to_string());
    // Almost exhaustive
    assert_eq!(latin_to_ascii("ÀÁÂÃÄÅ"), "AAAAAA".to_string());
    assert_eq!(latin_to_ascii("Æ"), "AE".to_string());
    assert_eq!(latin_to_ascii("Ç"), "C".to_string());
    assert_eq!(latin_to_ascii("ÈÉÊË"), "EEEE".to_string());
    assert_eq!(latin_to_ascii("ÌÍÎÏ"), "IIII".to_string());
    assert_eq!(latin_to_ascii("ÒÓÔÕÖØ"), "OOOOOO".to_string());
    assert_eq!(latin_to_ascii("ÙÚÛÜ"), "UUUU".to_string());
    assert_eq!(latin_to_ascii("Ý"), "Y".to_string());
    assert_eq!(latin_to_ascii("àáâãäå"), "aaaaaa".to_string());
    assert_eq!(latin_to_ascii("æ"), "ae".to_string());
    assert_eq!(latin_to_ascii("ç"), "c".to_string());
    assert_eq!(latin_to_ascii("èéêë"), "eeee".to_string());
    assert_eq!(latin_to_ascii("ìíîï"), "iiii".to_string());
  }
}
