// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>
// Parser takes a raw input, passes it to the tokenizer, and then
// converts it into the final output that is fed to the synthesizer.
// (The synthesizer only has knowledge of how to handle filtered words.)

use lang::abbr::AbbreviationsMap;
use lang::dictionary::UniversalDictionary;
use lang::numbers::number_to_words;
use lang::ordinals::ordinal_to_words;
use lang::token::*;
use lang::tokenizer::*;
use speaker::Speaker;
use std::sync::Arc;

pub struct Parser {
  tokenizer: Tokenizer,
  dictionary: Arc<UniversalDictionary>,
  abbreviations: Arc<AbbreviationsMap>,
}

impl Parser {
  /// CTOR.
  pub fn new(tokenizer: Tokenizer,
             dictionary: Arc<UniversalDictionary>,
             abbreviations: Arc<AbbreviationsMap>) -> Parser {
    Parser {
      tokenizer: tokenizer,
      dictionary: dictionary,
      abbreviations: abbreviations,
    }
  }

  /// Tokenize, then "parse" the sentence into usable output.
  pub fn parse(&self, _speaker: &Speaker, raw_sentence: &str) -> String {
    let tokens = self.tokenizer.tokenize(raw_sentence);

    // First round: attempt to swap out certain token types for others.
    // TODO: Inefficient. Use a mutable linked list to modify in-place.
    let mut processed_tokens = Vec::new();
    for token in tokens {
      match token {
        Token::Hashtag { value: ref v } => {
          let tag = v.value.replace("#", "");
          if self.dictionary.contains(&tag.to_lowercase()) {
            processed_tokens.push(Token::dictionary_word("hashtag".to_string()));
            processed_tokens.push(Token::dictionary_word(tag));
            continue;
          }
          match self.try_expand_camel_case(&tag) {
            None => {},
            Some(words) => {
              processed_tokens.push(Token::dictionary_word("hashtag".to_string()));
              for word in words {
                processed_tokens.push(Token::dictionary_word(word.to_string()));
              }
              continue;
            }
          }
        },
        Token::Mention { value: ref v } => {
          let name = v.value.replace("@", "");
          if self.dictionary.contains(&name.to_lowercase()) {
            processed_tokens.push(Token::dictionary_word(name));
            continue;
          }
          match self.try_expand_camel_case(&name) {
            None => {},
            Some(words) => {
              for word in words {
                processed_tokens.push(Token::dictionary_word(word.to_string()));
              }
              continue;
            }
          }
        },
        _ => {},
      }

      processed_tokens.push(token);
    }

    // Process all token types and construct output sentence.
    let mut sentence = Vec::new();
    for token in processed_tokens {
      match token {
        Token::CurrencySymbol { value: _v } => {}, // Skip (for now)
        Token::Date { value: _v } => {}, // Skip (for now)
        Token::Emoji { value: _v } => {}, // Skip (for now)
        Token::Hashtag { value: _v } => {}, // Skip (for now)
        Token::Mention { value: _v } => {}, // Skip (for now)
        Token::Punctuation { value: _v } => {}, // Skip (for now)
        Token::Url { value: _v } => {}, // Skip (forever)
        Token::MaybeTimeUnit { value: ref v } => {
          sentence.push(v.value.to_string());
        },
        Token::DictionaryWord { value : ref v } => {
          sentence.push(v.value.to_string());
        }
        Token::Time { value: ref v } => {
          // FIXME: Efficiency, cleanup
          let mut valid = true;
          let mut numbers = Vec::new();

          for split in v.value.split(":").collect::<Vec<&str>>() {
            match split.parse::<i64>() {
              Ok(num) => {
                if num == 0 {
                  continue;
                }
                numbers.push(num)
              },
              Err(_) => {
                valid = false;
                break;
              },
            };
          }

          if !valid {
            sentence.push(v.value.to_string());
            continue;
          }

          let mut number_words = Vec::new();

          for num in numbers {
            match number_to_words(num) {
              None => {
                valid = false;
                break;
              },
              Some(words) => {
                for word in words { number_words.push(word); }
              }
            }
          }

          if valid {
            for word in number_words { sentence.push(word); }
          } else {
            sentence.push(v.value.to_string());
          }
        },
        // Integers (TODO: tokenize floats separately.)
        Token::Number { value: ref v } => {
          let num = match v.value.parse::<i64>() {
            Err(_) => { continue; },
            Ok(num) => num,
          };
          match number_to_words(num) {
            None => { continue; },
            Some(words) => {
              for word in words { sentence.push(word); }
            }
          }
        },
        Token::Ordinal { value: ref v } => {
          match ordinal_to_words(&v.value) {
            None => { continue; },
            Some(words) => {
              for word in words { sentence.push(word); }
            }
          }
        },
        // Abbreviations are mapped to words (vs. initialisms)
        Token::Abbreviation { value: ref v } => {
          match self.abbreviations.get_words(&v.value) {
            None => { continue; },
            Some(words) => {
              for word in words { sentence.push(word.to_string()); }
            }
          }
        },
        // Initialisms are mapped to letters (vs. abbreviations)
        Token::Initialism { value: ref v } => {
          let letters : Vec<_> = v.value.split("").collect();
          for letter in letters {
            sentence.push(letter.to_string());
          }
        },
        Token::CamelCaseString { value: ref v } => {
          match self.try_expand_camel_case(&v.value) {
            None => {
              sentence.push(v.value.to_string());
            },
            Some(words) => {
              for word in words { sentence.push(word.to_string()); }
            }
          }
        },
        Token::HyphenatedString { value: ref v } => {
          match self.try_expand_hypenated(&v.value) {
            None => {
              sentence.push(v.value.to_string());
            },
            Some(words) => {
              for word in words { sentence.push(word.to_string()); }
            }
          }
        },
        Token::Symbol { value : ref v } => {
          match *v {
            Symbol::Ampersand => sentence.push("and".to_string()),
            Symbol::AtSign => sentence.push("at".to_string()),
            Symbol::Percent => sentence.push("percent".to_string()),
            Symbol::Plus => sentence.push("plus".to_string()),
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

  /// Attempt to expand a hyphenated non-dictionary word into a list
  /// of dictionary words. If any of the words don't match, this fails.
  fn try_expand_hypenated(&self, hyphenated: &str) -> Option<Vec<String>> {
    let split : Vec<&str> = hyphenated.split("-").collect();
    let mut words = Vec::new();
    for word in split {
      let lower = word.to_lowercase();
      if !self.dictionary.contains(&lower) {
        return None;
      }
      words.push(lower);
    }
    Some(words)
  }

  /// Attempt to expand a CamelCased non-dictionary word into a list
  /// of dictionary words. If any of the words don't match, this fails.
  fn try_expand_camel_case(&self, camel_case: &str) -> Option<Vec<String>> {
    let mut candidate_words = Vec::new();
    let mut word_buf = Vec::new();

    // NB: This doesn't work for unicode. See Rust docs.
    for ch in camel_case.chars() {
      if ch.is_uppercase() && !word_buf.is_empty() {
        let word = word_buf.join("");
        candidate_words.push(word);
        word_buf.clear();
      }
      word_buf.push(ch.to_string());
    }

    if !word_buf.is_empty() {
      let word = word_buf.join("");
      candidate_words.push(word);
    }

    info!(target: "parsing", "CamelCase breakdown: {:?}", candidate_words);

    let mut words = Vec::new();
    for word in candidate_words {
      let lower = word.to_lowercase();
      if !self.dictionary.contains(&lower) {
        return None;
      }
      words.push(lower);
    }
    Some(words)
  }
}

#[cfg(test)]
mod tests {
  use lang::abbr::AbbreviationsMap;
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
      w.insert("ending".to_string());
      w.insert("five".to_string());
      w.insert("foo".to_string());
      w.insert("food".to_string());
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
      w.insert("jack".to_string());
      w.insert("join".to_string());
      w.insert("jon".to_string());
      w.insert("lantern".to_string());
      w.insert("link".to_string());
      w.insert("lot".to_string());
      w.insert("me".to_string());
      w.insert("movement".to_string());
      w.insert("never".to_string());
      w.insert("o".to_string());
      w.insert("of".to_string());
      w.insert("one".to_string());
      w.insert("people".to_string());
      w.insert("place".to_string());
      w.insert("quote".to_string());
      w.insert("sign".to_string());
      w.insert("snow".to_string());
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
    assert_eq!("will be in atlanta georgia this friday at five pm. \
               join the movement tickets available at",
               &p.parse(&s, r#"Will be in Atlanta, Georgia this Friday at 5:00pm. Join the MOVEMENT!
               Tickets available at: https://t.co/Q6APf0ZFYA… https://t.co/6WAyO9eQHN"#));

    // TODO
    // Handle numerics
    //assert_eq!("u.s. murders increased ten point eight percent in twenty fifteen",
    //           &p.parse(&s, "U.S. Murders Increased 10.8% in 2015"));

    // TODO: WAAAY MORE TESTS.
  }

  #[test]
  fn test_camel_case_expansion() {
    let p = make_parser();
    let s = Speaker::new("speaker".to_string());

    let result = &p.parse(&s, "FooBar");
    let expected = "foo bar";
    assert_eq!(expected, result);

    let result = &p.parse(&s, "fooBarBaz");
    let expected = "foo bar baz";
    assert_eq!(expected, result);

    // A partially unknown camel case
    let result = &p.parse(&s, "FooBarQuerty");
    let expected = "FooBarQuerty";
    assert_eq!(expected, result);

    // An entirely unknown hyphenation
    let result = &p.parse(&s, "qwertyUiop");
    let expected = "qwertyUiop";
    assert_eq!(expected, result);
  }

  #[test]
  fn test_hyphenated_expansion() {
    let p = make_parser();
    let s = Speaker::new("speaker".to_string());

    let result = &p.parse(&s, "never-ending");
    let expected = "never ending";
    assert_eq!(expected, result);

    let result = &p.parse(&s, "jack-o-lantern");
    let expected = "jack o lantern";
    assert_eq!(expected, result);

    // A partially unknown hyphenation
    let result = &p.parse(&s, "jack-o-qwerty");
    let expected = "jack-o-qwerty";
    assert_eq!(expected, result);

    // An entirely unknown hyphenation
    let result = &p.parse(&s, "qwerty-uiop");
    let expected = "qwerty-uiop";
    assert_eq!(expected, result);
  }

  #[test]
  fn test_twitter_usernames() {
    let p = make_parser();
    let s = Speaker::new("speaker".to_string());

    // Simple dictionary word
    let result = &p.parse(&s, "@echelon");
    let expected = "echelon";
    assert_eq!(expected, result);

    // For CamelCase words that exist
    let result = &p.parse(&s, "@JonSnow");
    let expected = "jon snow";
    assert_eq!(expected, result);

    // Unknown
    let result = &p.parse(&s, "@qwerty");
    let expected = "";
    assert_eq!(expected, result);
  }

  #[test]
  fn test_twitter_hashtags() {
    let p = make_parser();
    let s = Speaker::new("speaker".to_string());

    // Simple dictionary word
    let result = &p.parse(&s, "#food");
    let expected = "hashtag food";
    assert_eq!(expected, result);

    // For CamelCase words that exist
    let result = &p.parse(&s, "#FooBarBaz");
    let expected = "hashtag foo bar baz";
    assert_eq!(expected, result);

    // Unknown
    let result = &p.parse(&s, "#qwerty");
    let expected = "";
    assert_eq!(expected, result);
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
    let dictionary = Arc::new(make_dictionary());
    let abbreviations = Arc::new(AbbreviationsMap::empty());
    let tokenizer = Tokenizer::new(dictionary.clone(),
                                   abbreviations.clone());
    Parser::new(tokenizer, dictionary.clone(), abbreviations.clone())
  }
}

