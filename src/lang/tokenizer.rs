// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

// TODO: This doesn't land the tokenization I want, but it'll be iterative.

use regex::Regex;
use speaker::Speaker;
//use std::sync::Arc;
//use super::dictionary::UniversalDictionary;

lazy_static! {
  // Note: Rust regexes do not support lookaround.
  // Designed not to match times (5:00) or URLs (http://)
  pub static ref RE_ALPHA_COLON: Regex = Regex::new(r"([A-Za-z]):([^/])").unwrap();
  pub static ref RE_BEGIN_SINGLE_QUOTE: Regex = Regex::new("^'").unwrap();
  pub static ref RE_PERIOD_END: Regex = Regex::new("\\.$").unwrap();
  pub static ref RE_PERIOD_SPACE: Regex = Regex::new("\\.\\s").unwrap();
  pub static ref RE_SINGLE_QUOTE_END: Regex = Regex::new("'$").unwrap();
  pub static ref RE_SINGLE_QUOTE_SPACE: Regex = Regex::new("'\\s").unwrap();
  pub static ref RE_SPACE_SINGLE_QUOTE: Regex = Regex::new("\\s'").unwrap();
  pub static ref RE_URL: Regex = Regex::new(r"https?://[\w\.-]+/?(\w+)?").unwrap();
}

//pub type TokenizedSentence = String;

pub struct Tokenizer {
  // TODO: Use dictionary.
  ///// The dictionary used to check if a word exists.
  //dictionary: Arc<UniversalDictionary>,
}

impl Tokenizer {
  /*// TODO
  pub fn tokenize_sentence(&self,
                           speaker: &Speaker,
                           raw_sentence: &str) -> TokenizedSentence */

  // TODO: Make only for testing.
  /// Only for testing.
  pub fn empty() -> Tokenizer {
    //Tokenizer { dictionary: Arc::new(UniversalDictionary::new()) }
    Tokenizer {}
  }

  pub fn convert(&self, _speaker: &Speaker, raw_sentence: &str) -> String {
    let mut sentence = raw_sentence.to_string();

    sentence = RE_ALPHA_COLON.replace_all(&sentence, "$1 ");
    sentence = RE_BEGIN_SINGLE_QUOTE.replace_all(&sentence, "");
    sentence = RE_PERIOD_END.replace_all(&sentence, "");
    sentence = RE_PERIOD_SPACE.replace_all(&sentence, " ");
    sentence = RE_SINGLE_QUOTE_END.replace_all(&sentence, "");
    sentence = RE_SINGLE_QUOTE_SPACE.replace_all(&sentence, " ");
    sentence = RE_SPACE_SINGLE_QUOTE.replace_all(&sentence, " ");

    // Replace &, @, <, >, etc.
    sentence = sentence.replace("&", " and ")
        .replace("@",  " at ")
        .replace("<", " less than ")
        .replace(">", " greater than ");

    // Remove URLs
    sentence = RE_URL.replace_all(&sentence, " ");

    // Remove characters.
    sentence = sentence.replace("\"", "")
        .replace(",", "")
        .replace("!", "")
        .replace("?", "")
        .replace("--", " ")
        .replace(" - ", " ")
        .replace("...", " ")
        .replace("…", " ");

    // Remove extra spaces
    // Lowercase
    let split = split_sentence(&sentence);
    sentence = split.join(" ");

    info!("Final sentence: {}", sentence);

    sentence
  }
}

/// Split a sentence into words. Remove extra padding, etc.
fn split_sentence(sentence: &str) -> Vec<String> {
  let mut words = Vec::new();
  let split = sentence.split(char::is_whitespace);
  for s in split {
    let trim = s.trim();
    if trim.len() == 0 { continue; }
    words.push(trim.to_lowercase());
  }
  words
}

#[cfg(test)]
mod tests {
  use speaker::Speaker;
  use super::*;
  use super::split_sentence;

  #[test]
  fn test_prepare() {
    let t = Tokenizer::empty();
    let s = Speaker::new("speaker".to_string());

    // Normalize spaces
    assert_eq!("foo bar baz", &t.convert(&s, "  FOO   BAR   BAZ  "));

    // Convert symbolic words
    assert_eq!("fox and hound", &t.convert(&s, "Fox & Hound"));
    assert_eq!("thing at place", &t.convert(&s, "thing @ place"));
    assert_eq!("me greater than you", &t.convert(&s, "me > you"));
    assert_eq!("this less than that", &t.convert(&s, "this < that"));

    // Drop unimportant characters
    assert_eq!("it's a quote", &t.convert(&s, "'It's a quote'"));
    assert_eq!("quote quote", &t.convert(&s, "\"Quote quote\""));

    // Drop URLs
    assert_eq!("testing link", &t.convert(&s, "Testing https://t.co/1A2b3cdEfG link"));
    assert_eq!("visit", &t.convert(&s, "Visit https://t.co/A1A1b0b0b0…"));

    // Complex examples taken from real tweets.
    assert_eq!("will be in novi michigan this friday at 5:00pm join the movement tickets available at",
               &t.convert(&s, r#"Will be in Novi, Michigan this Friday at 5:00pm. Join the MOVEMENT!
               Tickets available at: https://t.co/Q6APf0ZFYA… https://t.co/6WAyO9eQHN"#));

    // TODO
    // Handle numerics
    //assert_eq!("u.s. murders increased ten point eight percent in twenty fifteen",
    //           &t.convert(&s, "U.S. Murders Increased 10.8% in 2015"));

    // TODO: WAAAY MORE TESTS.
  }

  #[test]
  fn test_split_sentence() {
    assert_eq!(sen(&["foo"]), split_sentence("  foo  "));
    assert_eq!(sen(&["foo", "bar", "baz"]), split_sentence("foo bar baz"));
    assert_eq!(sen(&[".", "..", "..."]), split_sentence("   .\n..\t\t...\n  "));

    let empty : Vec<String> = Vec::new();
    assert_eq!(empty, split_sentence("      \n\t     "));
  }

  fn sen(list: &[&str]) -> Vec<String> {
    let mut out = Vec::new();
    for it in list { out.push(it.to_string()); }
    out
  }
}

