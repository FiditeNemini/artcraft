// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

use lang::numbers::number_to_words;
use regex::Regex;
use std::collections::HashMap;

lazy_static! {
  static ref ORDINAL_MAP: HashMap<&'static str, &'static str> = {
    let mut o = HashMap::new();
    o.insert("zero", "zeroth");
    o.insert("one", "first");
    o.insert("two", "second");
    o.insert("three", "third");
    o.insert("four", "fourth");
    o.insert("five", "fifth");
    o.insert("six", "sixth");
    o.insert("seven", "seventh");
    o.insert("eight", "eighth");
    o.insert("nine", "ninth");
    o.insert("ten", "tenth");
    o.insert("eleven", "eleventh");
    o.insert("twelve", "twelfth");
    o.insert("thirteen", "thirteenth");
    o.insert("fourteen", "fourteenth");
    o.insert("fifteen", "fifteenth");
    o.insert("sixteen", "sixteenth");
    o.insert("seventeen", "seventeenth");
    o.insert("eighteen", "eighteenth");
    o.insert("nineteen", "nineteenth");
    o.insert("twenty", "twentieth");
    o.insert("thirty", "thirtieth");
    o.insert("forty", "fortieth");
    o.insert("fifty", "fiftieth");
    o.insert("sixty", "sixtieth");
    o.insert("seventy", "seventieth");
    o.insert("eighty", "eightieth");
    o.insert("ninety", "ninetieth");
    o.insert("hundred", "hundredth");
    o.insert("thousand", "thousandth");
    o.insert("million", "millionth");
    o.insert("billion", "billionth");
    o.insert("trillion", "trillionth");
    o.insert("quadrillion", "quadrillionth");
    o
  };
}

/// Convert an ordinal of the form '123rd' to 'one hundred twenty third'.
pub fn ordinal_to_words(ordinal: &str) -> Option<Vec<String>> {
  lazy_static! {
    // Yes, this allows '3st', etc. It's fine.
    static ref SUFFIX: Regex = Regex::new(r"st|nd|rd|th").unwrap();
  }
  
  let digits = SUFFIX.replace_all(ordinal, "");

  let translated = digits.parse::<i64>()
      .ok()
      .and_then(|num| number_to_words(num));

  if translated.is_none() {
    return None;
  }

  let mut words = translated.unwrap();

  let last = match words.pop() {
    None => { return None },
    Some(last) => last,
  };

  // NB: Compiler can't infer String or str.
  let ordinal = match ORDINAL_MAP.get::<str>(&last) {
    None => { return None },
    Some(ord) => ord,
  };

  words.push(ordinal.to_string());

  Some(words)
}

#[cfg(test)]
mod tests {
  use super::ordinal_to_words;

  #[test]
  fn test_ordinals() {
    // Ones and teens
    assert_eq!(w("zeroth"), ordinal_to_words("0th"));
    assert_eq!(w("first"), ordinal_to_words("1st"));
    assert_eq!(w("second"), ordinal_to_words("2nd"));
    assert_eq!(w("third"), ordinal_to_words("3rd"));
    assert_eq!(w("fourth"), ordinal_to_words("4th"));
    assert_eq!(w("fifth"), ordinal_to_words("5th"));
    assert_eq!(w("sixth"), ordinal_to_words("6th"));
    assert_eq!(w("seventh"), ordinal_to_words("7th"));
    assert_eq!(w("eighth"), ordinal_to_words("8th"));
    assert_eq!(w("ninth"), ordinal_to_words("9th"));
    assert_eq!(w("tenth"), ordinal_to_words("10th"));
    assert_eq!(w("eleventh"), ordinal_to_words("11th"));
    assert_eq!(w("twelfth"), ordinal_to_words("12th"));
    assert_eq!(w("thirteenth"), ordinal_to_words("13th"));
    assert_eq!(w("fourteenth"), ordinal_to_words("14th"));
    assert_eq!(w("fifteenth"), ordinal_to_words("15th"));
    assert_eq!(w("sixteenth"), ordinal_to_words("16th"));
    assert_eq!(w("seventeenth"), ordinal_to_words("17th"));
    assert_eq!(w("eighteenth"), ordinal_to_words("18th"));
    assert_eq!(w("nineteenth"), ordinal_to_words("19th"));

    // Tens
    assert_eq!(w("twentieth"), ordinal_to_words("20th"));
    assert_eq!(w("thirtieth"), ordinal_to_words("30th"));
    assert_eq!(w("fortieth"), ordinal_to_words("40th"));
    assert_eq!(w("fiftieth"), ordinal_to_words("50th"));
    assert_eq!(w("sixtieth"), ordinal_to_words("60th"));
    assert_eq!(w("seventieth"), ordinal_to_words("70th"));
    assert_eq!(w("eightieth"), ordinal_to_words("80th"));
    assert_eq!(w("ninetieth"), ordinal_to_words("90th"));

    // Hundreds, and higher magnitudes
    assert_eq!(w("one hundredth"), ordinal_to_words("100th"));
    assert_eq!(w("one thousandth"), ordinal_to_words("1000th"));
    assert_eq!(w("one millionth"), ordinal_to_words("1000000th"));
    assert_eq!(w("one billionth"), ordinal_to_words("1000000000th"));
    assert_eq!(w("one trillionth"), ordinal_to_words("1000000000000th"));
    assert_eq!(w("one quadrillionth"), ordinal_to_words("1000000000000000th"));

    // Compound
    assert_eq!(w("twenty first"), ordinal_to_words("21st"));
    assert_eq!(w("one hundred eleventh"), ordinal_to_words("111th"));
    assert_eq!(w("two thousand five hundred third"),
               ordinal_to_words("2503rd"));
    assert_eq!(w("one quadrillion first"),
               ordinal_to_words("1000000000000001st"));
  }

  // Test helper
  fn w(words: &str) -> Option<Vec<String>> {
    Some(words.split_whitespace().map(|s| s.to_string()).collect::<Vec<String>>())
  }
}

