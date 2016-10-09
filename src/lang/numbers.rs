// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>
// Inspired by http://stackoverflow.com/a/3299672

use std::usize;
use std::u64;

lazy_static! {
  pub static ref FIRST_DIGITS: Vec<&'static str> = vec![
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];

  pub static ref TENS: Vec<&'static str> = vec![
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];

  pub static ref LARGE: Vec<&'static str> = vec![
    "thousand",
    "million",
    "billion",
    "trillion",
    "quadrillion",
    // TODO: Overflow in current algorithm:
    //"quintillion",
    //"sextillion",
    //"septillion",
    //"octillion",
    //"nonillion",
  ];

}

/// Convert a number to words.
pub fn number_to_words(number: i64) -> Option<Vec<String>> {
  let mut words = Vec::new();

  if number < 0 {
    words.push("negative".to_string());
  }

  let unsigned = number.abs() as u64;

  let success = if unsigned < 100 {
    convert_nn(unsigned, &mut words)
  } else if unsigned < 1000 {
    convert_nnn(unsigned, &mut words)
  } else {
    convert_large(unsigned, &mut words)
  };

  if !success {
    None
  } else {
    Some(words)
  }
}

// TODO: This algorithm was copied from SO.
// Could be more elegant. Also more Rustful.
fn convert_nn(number: u64, words: &mut Vec<String>) -> bool {
  if number < 20 {
    let word = FIRST_DIGITS[number as usize].to_string();
    words.push(word);
    return true;
  }

  for (i, word) in TENS.iter().enumerate() {
    let dval = 10 * i + 20;
    if dval + 10 > number as usize {
      if (number % 10) != 0 {
        let first = word.to_string();
        let second = FIRST_DIGITS[(number % 10) as usize].to_string();

        words.push(first);
        words.push(second);
        return true;
      }
      words.push(word.to_string());
      return true;
    }
  }

  false // Should not be reached.
}

fn convert_nnn(number: u64, words: &mut Vec<String>) -> bool {
  let rem = number / 100;
  if rem > 0 {
    words.push(FIRST_DIGITS[rem as usize].to_string());
    words.push("hundred".to_string());
  }

  let md = number % 100;
  if md > 0 {
    if !convert_nn(md, words) {
      return false;
    }
  }

  true
}

fn convert_large(number: u64, words: &mut Vec<String>) -> bool {
  // Extremly large numbers
  if number > 999_999_999_999_999_999 {
    return false;
  }

  if number < 1000 {
    if !convert_nnn(number, words) {
      return false;
    }
    return true;
  }

  // Iterate backwards, largest magnitudes first.
  for (i, unit) in LARGE.iter().rev().enumerate() {
    let i = LARGE.len() - i; // shadow
    let mag = 1000u64.pow(i as u32);

    if number < mag {
      continue;
    }

    let quo = number / mag;
    let rem = number - (quo * mag);

    if !convert_nnn(quo, words) {
      return false;
    }

    words.push(unit.to_string());

    if rem > 0 {
      if !convert_large(rem, words) {
        return false;
      }
    }

    return true;
  }

  false // Should not be reached.
}


#[cfg(test)]
mod tests {
  use super::number_to_words;

  #[test]
  fn test_positive_integers() {
    // Ones and teens
    assert_eq!(w("zero"), number_to_words(0));
    assert_eq!(w("one"), number_to_words(1));
    assert_eq!(w("two"), number_to_words(2));
    assert_eq!(w("three"), number_to_words(3));
    assert_eq!(w("four"), number_to_words(4));
    assert_eq!(w("five"), number_to_words(5));
    assert_eq!(w("six"), number_to_words(6));
    assert_eq!(w("seven"), number_to_words(7));
    assert_eq!(w("eight"), number_to_words(8));
    assert_eq!(w("nine"), number_to_words(9));
    assert_eq!(w("ten"), number_to_words(10));
    assert_eq!(w("eleven"), number_to_words(11));
    assert_eq!(w("twelve"), number_to_words(12));
    assert_eq!(w("thirteen"), number_to_words(13));
    assert_eq!(w("fourteen"), number_to_words(14));
    assert_eq!(w("fifteen"), number_to_words(15));
    assert_eq!(w("sixteen"), number_to_words(16));
    assert_eq!(w("seventeen"), number_to_words(17));
    assert_eq!(w("eighteen"), number_to_words(18));
    assert_eq!(w("nineteen"), number_to_words(19));

    // Tens
    assert_eq!(w("twenty"), number_to_words(20));
    assert_eq!(w("thirty"), number_to_words(30));
    assert_eq!(w("forty"), number_to_words(40));
    assert_eq!(w("fifty"), number_to_words(50));
    assert_eq!(w("sixty"), number_to_words(60));
    assert_eq!(w("seventy"), number_to_words(70));
    assert_eq!(w("eighty"), number_to_words(80));
    assert_eq!(w("ninety"), number_to_words(90));

    // Tens + Ones
    assert_eq!(w("twenty one"), number_to_words(21));
    assert_eq!(w("thirty five"), number_to_words(35));
    assert_eq!(w("forty four"), number_to_words(44));
    assert_eq!(w("fifty five"), number_to_words(55));
    assert_eq!(w("sixty six"), number_to_words(66));

    // Hundreds
    assert_eq!(w("one hundred"), number_to_words(100));
    assert_eq!(w("two hundred"), number_to_words(200));
    assert_eq!(w("three hundred"), number_to_words(300));
    assert_eq!(w("four hundred"), number_to_words(400));
    assert_eq!(w("five hundred"), number_to_words(500));
    assert_eq!(w("six hundred"), number_to_words(600));
    assert_eq!(w("seven hundred"), number_to_words(700));
    assert_eq!(w("eight hundred"), number_to_words(800));
    assert_eq!(w("nine hundred"), number_to_words(900));

    // Large
    assert_eq!(w("one thousand"), number_to_words(1_000));
    assert_eq!(w("one million"), number_to_words(1_000_000));
    assert_eq!(w("one billion"), number_to_words(1_000_000_000));
    assert_eq!(w("one trillion"), number_to_words(1_000_000_000_000));

    // Large with small prefix
    assert_eq!(w("nine thousand"), number_to_words(9_000));
    assert_eq!(w("ten million"), number_to_words(10_000_000));
    assert_eq!(w("sixty billion"), number_to_words(60_000_000_000));
    assert_eq!(w("four hundred forty four trillion"),
               number_to_words(444_000_000_000_000));

    // Large, multiple units
    assert_eq!(w("nine thousand one"), number_to_words(9_001));
    assert_eq!(w(r#"one hundred twenty three trillion
                    four hundred fifty six billion
                    seven hundred eighty nine million
                    one hundred twenty three thousand
                    four hundred fifty six"#),
               number_to_words(123_456_789_123_456));

    // Bounds
    assert_eq!(w(r#"nine hundred ninety nine quadrillion
                    nine hundred ninety nine trillion
                    nine hundred ninety nine billion
                    nine hundred ninety nine million
                    nine hundred ninety nine thousand
                    nine hundred ninety nine"#),
               number_to_words(999_999_999_999_999_999));
    assert_eq!(None, number_to_words(1_000_000_000_000_000_000));
  }

  #[test]
  fn test_negative_integers() {
    // Misc negative numbers. (Algorithm already tested for positive ints.)
    assert_eq!(w("negative one"), number_to_words(-1));
    assert_eq!(w("negative nine thousand one"), number_to_words(-9_001));
    assert_eq!(w("negative four hundred forty four trillion"),
               number_to_words(-444_000_000_000_000));
    assert_eq!(w(r#"negative one hundred twenty three trillion
                    four hundred fifty six billion
                    seven hundred eighty nine million
                    one hundred twenty three thousand
                    four hundred fifty six"#),
               number_to_words(-123_456_789_123_456));

    // Bounds
    assert_eq!(w("zero"), number_to_words(-0));
    assert_eq!(w(r#"negative
                    nine hundred ninety nine quadrillion
                    nine hundred ninety nine trillion
                    nine hundred ninety nine billion
                    nine hundred ninety nine million
                    nine hundred ninety nine thousand
                    nine hundred ninety nine"#),
               number_to_words(-999_999_999_999_999_999));
    assert_eq!(None, number_to_words(-1_000_000_000_000_000_000));
  }

  // Test helper
  fn w(words: &str) -> Option<Vec<String>> {
    Some(words.split_whitespace().map(|s| s.to_string()).collect::<Vec<String>>())
  }
}

