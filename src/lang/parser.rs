// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

use lang::token::*;
use lang::tokenizer::*;
use speaker::Speaker;

pub struct Parser {
  tokenizer: Tokenizer,
}

impl Parser {
  /// CTOR.
  pub fn new(tokenizer: Tokenizer) -> Parser {
    Parser { tokenizer: tokenizer }
  }

  /// Tokenize, then "parse" the sentence into usable output.
  pub fn parse(&self, _speaker: &Speaker, raw_sentence: &str) -> String {
    let tokens = self.tokenizer.tokenize(raw_sentence);
    let mut sentence = Vec::new();

    for token in tokens {
      match token {
        Token::Date { value: _v } => {}, // Skip (for now)
        Token::Emoji { value: _v } => {}, // Skip (for now)
        Token::Hashtag { value: _v } => {}, // Skip (for now)
        Token::Mention { value: _v } => {}, // Skip (for now)
        Token::Number { value: _v } => {}, // Skip (for now)
        Token::Punctuation { value: _v } => {}, // Skip (for now)
        Token::Url { value: _v } => {}, // Skip
        Token::DictionaryWord { value : ref v } => sentence.push(v.value.to_string()),
        Token::Initialism { value: ref v } => {
          let letters : Vec<_> = v.value.split("").collect();
          for letter in letters {
            sentence.push(letter.to_string());
          }
        },
        Token::Symbol { value : ref v } => {
          match *v {
            Symbol::Ampersand => sentence.push("and".to_string()),
            Symbol::AtSign => sentence.push("at".to_string()),
            Symbol::GreaterThan => {
              sentence.push("greater".to_string());
              sentence.push("than".to_string());
            },
            Symbol::LessThan => {
              sentence.push("less".to_string());
              sentence.push("than".to_string());
            },
          }
        },
        Token::Unknown { value : ref v } => sentence.push(v.value.to_string()),
      };
    }

    let final_sentence = sentence.join(" ");

    info!(target: "parsing", "Final sentence = {}", final_sentence);

    final_sentence
  }
}

#[cfg(test)]
mod tests {
  use lang::dictionary::Dictionary;
  use lang::dictionary::UniversalDictionary;
  use lang::tokenizer::Tokenizer;
  use speaker::Speaker;
  use std::collections::HashSet;
  use std::sync::Arc;
  use super::*;

  // TODO: Share this between the tokenizer and parser tests.
  lazy_static! {
    /// Word set to use in the tests.
    static ref WORDS: HashSet<String> = {
      let mut w = HashSet::new();
      w.insert("a".to_string());
      w.insert("at".to_string());
      w.insert("atlanta".to_string());
      w.insert("available".to_string());
      w.insert("bad".to_string());
      w.insert("bar".to_string());
      w.insert("baz".to_string());
      w.insert("be".to_string());
      w.insert("can't".to_string());
      w.insert("echelon".to_string());
      w.insert("five".to_string());
      w.insert("foo".to_string());
      w.insert("four".to_string());
      w.insert("fox".to_string());
      w.insert("friday".to_string());
      w.insert("georgia".to_string());
      w.insert("handle".to_string());
      w.insert("hound".to_string());
      w.insert("idea".to_string());
      w.insert("in".to_string());
      w.insert("it".to_string());
      w.insert("it's".to_string());
      w.insert("join".to_string());
      w.insert("link".to_string());
      w.insert("lot".to_string());
      w.insert("me".to_string());
      w.insert("movement".to_string());
      w.insert("of".to_string());
      w.insert("one".to_string());
      w.insert("people".to_string());
      w.insert("place".to_string());
      w.insert("quote".to_string());
      w.insert("sign".to_string());
      w.insert("testing".to_string());
      w.insert("that".to_string());
      w.insert("the".to_string());
      w.insert("thing".to_string());
      w.insert("this".to_string());
      w.insert("three".to_string());
      w.insert("tickets".to_string());
      w.insert("two".to_string());
      w.insert("username".to_string());
      w.insert("visit".to_string());
      w.insert("will".to_string());
      w.insert("would".to_string());
      w.insert("you".to_string());
      w
    };
  }

  #[test]
  fn test_prepare() {
    let p = make_parser();
    let s = Speaker::new("speaker".to_string());

    // Normalize spaces
    assert_eq!("foo bar baz", &p.parse(&s, "  FOO   BAR   BAZ  "));

    // Convert symbolic words
    assert_eq!("fox and hound", &p.parse(&s, "Fox & Hound"));
    assert_eq!("thing at place", &p.parse(&s, "thing @ place"));
    assert_eq!("me greater than you", &p.parse(&s, "me > you"));
    assert_eq!("this less than that", &p.parse(&s, "this < that"));

    // Drop unimportant characters
    assert_eq!("it's a quote", &p.parse(&s, "'It's a quote'"));
    assert_eq!("quote quote", &p.parse(&s, "\"Quote quote\""));

    // Drop URLs
    assert_eq!("testing link", &p.parse(&s, "Testing https://t.co/1A2b3cdEfG link"));
    assert_eq!("visit", &p.parse(&s, "Visit https://t.co/A1A1b0b0b0…"));

    // Drop smart quotes, periods.
    assert_eq!("it would be a bad idea", &p.parse(&s, "“It would be a bad idea.”"));
    assert_eq!("a lot of people can't handle it", &p.parse(&s, "A lot of people can’t handle it."));

    // Complex examples taken from real tweets.
    assert_eq!("will be in atlanta georgia this friday at 5:00pm join the movement tickets available at",
               &p.parse(&s, r#"Will be in Atlanta, Georgia this Friday at 5:00pm. Join the MOVEMENT!
               Tickets available at: https://t.co/Q6APf0ZFYA… https://t.co/6WAyO9eQHN"#));

    // TODO
    // Handle numerics
    //assert_eq!("u.s. murders increased ten point eight percent in twenty fifteen",
    //           &t.parse(&s, "U.S. Murders Increased 10.8% in 2015"));

    // TODO: WAAAY MORE TESTS.
  }


  // Helper function.
  fn make_dictionary() -> UniversalDictionary {
    let dictionary = Dictionary::new(WORDS.clone());

    let mut ud = UniversalDictionary::new();
    ud.set_arpabet_dictionary(dictionary);
    ud
  }

  // Helper function.
  fn make_parser() -> Parser {
    let dictionary = make_dictionary();
    let tokenizer = Tokenizer::new(Arc::new(dictionary));
    Parser::new(tokenizer)
  }
}

