// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

use lang::numbers::number_to_words;
use lang::ordinals::ORDINAL_MAP;

/**
 * Convert a date of the format N+/N+/NN+ or N+/NN+ to its word representation.
 */
pub fn date_to_words(date: &str) -> Option<Vec<String>> {
  let split: Vec<&str> = date.split("/").collect();

  // US date order
  let mut month = None;
  let mut day = None;
  let mut year = None;

  match split.len() {
    // Mon/Day: 7/11
    // Mon/Year: 10/2016
    2 => {
      month = Some(split[1]);
      match split[1].len() {
        2 => { day = Some(split[1]); },
        4 => { year = Some(split[1]); },
        _ => { return None; },
      }
    },
    // Mon/Day/Year: 10/7/2016
    // Mon/Day/Year: 10/7/16
    3 => {
      month = Some(split[0]);
      day = Some(split[1]);
      year = Some(split[2]);
    },
    _ => {},
  }

  let mut words = Vec::new();

  if month.is_some() {
    match month_to_words(month.unwrap()) {
      None => { return None; },
      Some(m) => {
        words.push(m.to_string());
      }
    }
  }

  if day.is_some() {
    match day_to_words(day.unwrap()) {
      None => { return None; },
      Some(mut d) => {
        words.append(&mut d);
      }
    }
  }

  if year.is_some() {
    match year_to_words(year.unwrap()) {
      None => { return None; },
      Some(mut y) => {
        words.append(&mut y);
      }
    }
  }

  if words.len() == 0 {
    None
  } else {
    Some(words)
  }
}


/**
 * Convert a month to string.
 */
pub fn month_to_words(month: &str) -> Option<&'static str> {
  match month {
    "1" | "01" => Some("january"),
    "2" | "02" => Some("february"),
    "3" | "03" => Some("march"),
    "4" | "04" => Some("april"),
    "5" | "05" => Some("may"),
    "6" | "06" => Some("june"),
    "7" | "07" => Some("july"),
    "8" | "08" => Some("august"),
    "9" | "09" => Some("september"),
    "10"       => Some("october"),
    "11"       => Some("november"),
    "12"       => Some("december"),
    _          => None,
  }
}

/**
 * Convert a day to string.
 */
pub fn day_to_words(day: &str) -> Option<Vec<String>> {
  let nonzero_day = day.trim_left_matches("0");

  let num = match nonzero_day.parse::<i64>() {
    Err(_) => { return None; },
    Ok(num) => num,
  };

  if num < 1 || num > 31 {
    return None;
  }

  let mut words = match number_to_words(num) {
    None => { return None; },
    Some(words) => { words },
  };

  match words.last_mut() {
    None => { return None; },
    Some(mut last) => {
      // NB: Tell the compiler we want str.
      match ORDINAL_MAP.get::<str>(&last) {
        None => { return None; },
        Some(ordinal) => { *last = ordinal.to_string(); },
      }
    },
  }

  Some(words)
}

/**
 * Convert a year of the format YY or YYYY to word representation.
 * This heuristically pins two digit years to the range [1970, 2069].
 */
pub fn year_to_words(year: &str) -> Option<Vec<String>> {
  // FIXME: Efficiency and clarity.
  let num = match year.parse::<i64>() {
    Err(_) => { return None; },
    Ok(num) => num,
  };

  match year.len() {
    2 => {
      let first = if num < 10 {
        number_to_words(2000)
      } else if num < 70 {
        number_to_words(20)
      } else {
        number_to_words(19)
      };

      if first.is_none() { return None; }

      let mut words = first.unwrap();

      if num == 0 { return Some(words); }

      let mut last = match number_to_words(num) {
        None => { return None; },
        Some(w) => w,
      };

      words.append(&mut last);
      Some(words)
    },
    4 => {
      if num % 1000 == 0 {
        // Y000's
        let first = number_to_words(num);
        if first.is_none() { return None; }
        return Some(first.unwrap());

      } else if num % 100 == 0 {
        // YY00's
        let n = num / 100;
        let first = number_to_words(n);

        if first.is_none() { return None; }

        let mut words = first.unwrap();
        if n < 20 { words.push("hundred".to_string()); }

        return Some(words);
      } else {
        // YY0X and YYXX.
        let first = num / 100;
        let second = num % 100;

        if second < 10 {
          if first % 10 == 0 {
            // 2001, etc.
            return number_to_words(num);
          } else {
            // 1901, etc.
            let a = number_to_words(first);
            if a.is_none() { return None; }

            let mut words = a.unwrap();

            if second < 10 {
              words.push("o".to_string());
              let b = number_to_words(second);
              if b.is_none() { return None; }
              let mut more = b.unwrap();
              words.append(&mut more);
            } else {
              let b = number_to_words(second);
              if b.is_none() { return None; }
              let mut more = b.unwrap();
              words.append(&mut more);
            }

            return Some(words);
          }
        } else {
          let a = number_to_words(first);
          if a.is_none() { return None; }

          let mut words = a.unwrap();

          let b = number_to_words(second);
          if b.is_none() { return None; }

          let mut more = b.unwrap();
          words.append(&mut more);

          return Some(words);
        }
      }

      None // Should not reach
    },
    _ => None,
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_invalid_short_date() {
    // TODO
  }

  #[test]
  fn test_invalid_full_date() {
    // TODO
  }

  #[test]
  fn test_valid_short_date() {
    // TODO
  }

  #[test]
  fn test_valid_full_date() {
    // 1900's
    assert_eq!(words("january first nineteen eighty"),
               date_to_words("1/1/1980"));
    assert_eq!(words("october seventh nineteen eighty"),
               date_to_words("10/7/80"));
    assert_eq!(words("september ninth nineteen ninety nine"),
               date_to_words("9/9/1999"));
    assert_eq!(words("october thirty first nineteen o one"),
               date_to_words("10/31/1901"));
    // 2000's
    assert_eq!(words("january first two thousand"),
               date_to_words("1/1/2000"));
    assert_eq!(words("december twelfth twenty twelve"),
               date_to_words("12/12/2012"));
  }

  #[test]
  fn test_invalid_month() {
    assert_eq!(None, month_to_words("0"));
    assert_eq!(None, month_to_words("00"));
    assert_eq!(None, month_to_words("-1"));
    assert_eq!(None, month_to_words("13"));
    assert_eq!(None, month_to_words("111"));
    assert_eq!(None, month_to_words("foo"));
  }

  #[test]
  fn test_valid_month() {
    assert_eq!(Some("january"), month_to_words("1"));
    assert_eq!(Some("january"), month_to_words("01"));
    assert_eq!(Some("july"), month_to_words("7"));
    assert_eq!(Some("july"), month_to_words("07"));
    assert_eq!(Some("october"), month_to_words("10"));
    assert_eq!(Some("december"), month_to_words("12"));
  }

  #[test]
  fn test_invalid_day() {
    assert_eq!(None, day_to_words(""));
    assert_eq!(None, day_to_words("0"));
    assert_eq!(None, day_to_words("-1"));
    assert_eq!(None, day_to_words("32"));
    assert_eq!(None, day_to_words("100"));
    assert_eq!(None, day_to_words("foo"));
  }

  #[test]
  fn test_valid_day() {
    assert_eq!(words("first"), day_to_words("1"));
    assert_eq!(words("fifth"), day_to_words("5"));
    assert_eq!(words("tenth"), day_to_words("10"));
    assert_eq!(words("fifteenth"), day_to_words("15"));
    assert_eq!(words("twentieth"), day_to_words("20"));
    assert_eq!(words("twenty first"), day_to_words("21"));
    assert_eq!(words("thirty first"), day_to_words("31"));
  }

  #[test]
  fn test_wrong_digit_year() {
    // Error
    assert_eq!(None, year_to_words(""));
    assert_eq!(None, year_to_words("0"));
    assert_eq!(None, year_to_words("1"));
    //assert_eq!(None, year_to_words("-1")); // TODO: Fix
    assert_eq!(None, year_to_words("123"));
    assert_eq!(None, year_to_words("12345"));
    assert_eq!(None, year_to_words("foo"));
  }

  #[test]
  fn test_two_digit_year() {
    // 2000's (two digit)
    assert_eq!(words("two thousand"), year_to_words("00"));
    assert_eq!(words("two thousand one"), year_to_words("01"));
    assert_eq!(words("two thousand four"), year_to_words("04"));
    assert_eq!(words("twenty nineteen"), year_to_words("19"));
    assert_eq!(words("twenty twenty"), year_to_words("20"));
    assert_eq!(words("twenty fifty five"), year_to_words("55"));
    assert_eq!(words("twenty sixty nine"), year_to_words("69"));
    // 1900's (two digit)
    assert_eq!(words("nineteen seventy"), year_to_words("70"));
    assert_eq!(words("nineteen eighty five"), year_to_words("85"));
    assert_eq!(words("nineteen ninety five"), year_to_words("95"));
    assert_eq!(words("nineteen ninety nine"), year_to_words("99"));
  }

  #[test]
  fn test_four_digit_year() {
    // thousands (four digit years)
    assert_eq!(words("one thousand"), year_to_words("1000"));
    assert_eq!(words("two thousand"), year_to_words("2000"));
    // hundreds (four digit years)
    assert_eq!(words("eleven hundred"), year_to_words("1100"));
    assert_eq!(words("eighteen hundred"), year_to_words("1800"));
    assert_eq!(words("nineteen hundred"), year_to_words("1900"));
    // ones digit (four digit years before 2000)
    assert_eq!(words("eleven o one"), year_to_words("1101"));
    assert_eq!(words("seventeen o nine"), year_to_words("1709"));
    // ones digit (four digit years after 2000)
    assert_eq!(words("two thousand one"), year_to_words("2001"));
    assert_eq!(words("two thousand two"), year_to_words("2002"));
    assert_eq!(words("four thousand five"), year_to_words("4005"));
    // others
    assert_eq!(words("nineteen eighty five"), year_to_words("1985"));
    assert_eq!(words("nineteen ninety seven"), year_to_words("1997"));
    assert_eq!(words("twenty ten"), year_to_words("2010"));
    assert_eq!(words("twenty twelve"), year_to_words("2012"));
    assert_eq!(words("twenty sixteen"), year_to_words("2016"));
    assert_eq!(words("twenty twenty"), year_to_words("2020"));
  }

  fn words(words: &str) -> Option<Vec<String>> {
    let list = words.split_whitespace().map(|w| w.to_string()).collect();
    Some(list)
  }
}
