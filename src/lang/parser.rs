// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>
// Parser takes a raw input, passes it to the tokenizer, and then
// converts it into the final output that is fed to the synthesizer.
// (The synthesizer only has knowledge of how to handle filtered words.)

use lang::abbr::AbbreviationsMap;
use lang::dictionary::UniversalDictionary;
use lang::numbers::number_to_words;
use lang::ordinals::ordinal_to_words;
use lang::tokens::*;
use lang::tokenizer::*;
use std::sync::Arc;
use synthesis::tokens::*;

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

  /// Tokenize and parse the sentence into usable output for the synthesizer.
  pub fn parse(&self, raw_sentence: &str) -> Vec<SynthToken> {
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
            None => {
              processed_tokens.push(Token::unknown(tag.to_string()));
            },
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
            None => {
              processed_tokens.push(Token::unknown(name.to_string()));
            },
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

    // Process all token types and construct output synthesis vector.
    let mut synth_tokens = Vec::new();

    for token in processed_tokens {
      match token {
        Token::CurrencySymbol { value: _v } => {}, // Skip (for now)
        Token::Date { value: _v } => {}, // Skip (for now)
        Token::Emoji { value: _v } => {}, // Skip (for now)
        Token::Hashtag { value: _v } => {}, // Skip (for now)
        Token::Mention { value: _v } => {}, // Skip (for now)
        Token::Url { value: _v } => {}, // Skip (forever)
        Token::Punctuation { value: v } => {
          match v {
            Punctuation::Comma
            | Punctuation::Dash => {
              synth_tokens.push(SynthToken::breath());
            },
            Punctuation::Period
            | Punctuation::Question
            | Punctuation::Exclamation => {
              synth_tokens.push(SynthToken::full_stop());
            },
            Punctuation::Ellipsis
            | Punctuation::Semicolon => {
              synth_tokens.push(SynthToken::half_stop());
            },
          }
        },
        Token::MaybeTimeUnit { value: ref v } => {
          synth_tokens.push(SynthToken::word(v.value.to_string()));
        },
        Token::DictionaryWord { value : ref v } => {
          synth_tokens.push(SynthToken::word(v.value.to_string()));
        }
        Token::Time { value: ref v } => {
          // FIXME: Efficiency, cleanup
          let mut valid = true;
          let mut numbers = Vec::new();
          let mut oclock = false;

          let split = v.value.split(":").collect::<Vec<&str>>();

          for (i, part) in split.iter().enumerate() {
            match part.parse::<i64>() {
              Ok(num) => {
                if num == 0 {
                  if i == split.len() - 1 {
                    oclock = true;
                  }
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
            synth_tokens.push(SynthToken::filler(v.value.len()));
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
            for word in number_words {
              synth_tokens.push(SynthToken::word(word));
            }
            if oclock {
              synth_tokens.push(SynthToken::word("o'clock".to_string()));
            }
          } else {
            synth_tokens.push(SynthToken::filler(v.value.len()));
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
              for word in words { synth_tokens.push(SynthToken::word(word)); }
            }
          }
        },
        Token::Ordinal { value: ref v } => {
          match ordinal_to_words(&v.value) {
            None => { continue; },
            Some(words) => {
              for word in words { synth_tokens.push(SynthToken::word(word)); }
            }
          }
        },
        // Abbreviations are mapped to words (vs. initialisms)
        Token::Abbreviation { value: ref v } => {
          match self.abbreviations.get_words(&v.value) {
            None => { continue; },
            Some(words) => {
              for word in words {
                synth_tokens.push(SynthToken::word(word.to_string()));
              }
            }
          }
        },
        // Initialisms are mapped to letters (vs. abbreviations)
        Token::Initialism { value: ref v } => {
          let letters : Vec<_> = v.value.split("").collect();
          for letter in letters {
            synth_tokens.push(SynthToken::word(letter.to_string()));
          }
        },
        Token::CamelCaseString { value: ref v } => {
          match self.try_expand_camel_case(&v.value) {
            None => {
              synth_tokens.push(SynthToken::filler(v.value.len()));
            },
            Some(words) => {
              for word in words {
                synth_tokens.push(SynthToken::word(word.to_string()));
              }
            }
          }
        },
        Token::HyphenatedString { value: ref v } => {
          match self.try_expand_hypenated(&v.value) {
            None => {
              synth_tokens.push(SynthToken::filler(v.value.len()));
            },
            Some(words) => {
              for word in words {
                synth_tokens.push(SynthToken::word(word.to_string()));
              }
            }
          }
        },
        Token::Symbol { value : ref v } => {
          match *v {
            Symbol::Ampersand => synth_tokens.push(SynthToken::word("and".to_string())),
            Symbol::AtSign => synth_tokens.push(SynthToken::word("at".to_string())),
            Symbol::Percent => synth_tokens.push(SynthToken::word("percent".to_string())),
            Symbol::Plus => synth_tokens.push(SynthToken::word("plus".to_string())),
            Symbol::GreaterThan => {
              synth_tokens.push(SynthToken::word("greater".to_string()));
              synth_tokens.push(SynthToken::word("than".to_string()));
            },
            Symbol::LessThan => {
              synth_tokens.push(SynthToken::word("less".to_string()));
              synth_tokens.push(SynthToken::word("than".to_string()));
            },
          }
        },
        Token::Unknown { value : ref v } => {
          synth_tokens.push(SynthToken::filler(v.value.len()))
        },
      };
    }

    info!(target: "parsing", "Final synth tokens = {:?}", synth_tokens);

    synth_tokens
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
  use std::collections::HashSet;
  use std::sync::Arc;
  use super::*;
  use synthesis::tokens::*;

  // TODO: Share this between the tokenizer and parser tests.
  lazy_static! {
    /// Word set to use in the tests.
    static ref WORDS: HashSet<String> = {
      let words = vec![
        "a",
        "at",
        "atlanta",
        "available",
        "bad",
        "bar",
        "baz",
        "be",
        "can't",
        "echelon",
        "ending",
        "five",
        "foo",
        "food",
        "four",
        "fox",
        "friday",
        "georgia",
        "handle",
        "hound",
        "idea",
        "in",
        "it",
        "it's",
        "jack",
        "join",
        "jon",
        "lantern",
        "link",
        "lot",
        "me",
        "movement",
        "never",
        "o",
        "of",
        "one",
        "people",
        "place",
        "quote",
        "sign",
        "snow",
        "testing",
        "that",
        "the",
        "thing",
        "this",
        "three",
        "tickets",
        "two",
        "username",
        "visit",
        "will",
        "would",
        "you",
      ];

      let mut hs = HashSet::new();
      for w in words { hs.insert(w.to_string()); }
      hs
    };
  }

  #[test]
  fn test_normalize_spaces() {
    let p = make_parser();

    let result = p.parse("  FOO   BAR   BAZ  ");
    let expected = vec![w("foo"), w("bar"), w("baz")];
    assert_eq!(expected, result);

    let result = p.parse("\nFOO\t\tBAR\r\rBAZ\r\n\t");
    let expected = vec![w("foo"), w("bar"), w("baz")];
    assert_eq!(expected, result);
  }

  #[test]
  fn test_drop_quotes() {
    let p = make_parser();

    let result = p.parse("'It's a quote'");
    let expected = vec![w("it's"), w("a"), w("quote")];
    assert_eq!(expected, result);

    let result = p.parse("\"Quote quote\"");
    let expected = vec![w("quote"), w("quote")];
    assert_eq!(expected, result);

    // Drop smart quotes, periods.
    let result = p.parse("A lot of people can’t handle it.");
    let expected = vec![
      w("a"), w("lot"), w("of"), w("people"), w("can't"), w("handle"), w("it"),
      SynthToken::full_stop()
    ];
    assert_eq!(expected, result);
  }

  #[test]
  fn test_drop_urls() {
    let p = make_parser();

    let result = p.parse("Testing https://t.co/1A2b3cdEfG link");
    let expected = vec![w("testing"), w("link")];
    assert_eq!(expected, result);

    let result = p.parse("Visit https://t.co/A1A1b0b0b0…");
    let expected = vec![w("visit"), SynthToken::half_stop()];
    assert_eq!(expected, result);
  }

  #[test]
  fn test_symbols() {
    let p = make_parser();

    let result = p.parse("Fox & Hound");
    let expected = vec![w("fox"), w("and"), w("hound")];
    assert_eq!(expected, result);

    let result = p.parse("thing @ place");
    let expected = vec![w("thing"), w("at"), w("place")];
    assert_eq!(expected, result);

    let result = p.parse("me > you");
    let expected = vec![w("me"), w("greater"), w("than"), w("you")];
    assert_eq!(expected, result);

    let result = p.parse("this < that");
    let expected = vec![w("this"), w("less"), w("than"), w("that")];
    assert_eq!(expected, result);
  }

  #[test]
  fn test_handle_punctuation() {
    let p = make_parser();

    let result = p.parse("“It would be a bad idea.”");
    let expected = vec![
      w("it"), w("would"), w("be"), w("a"), w("bad"), w("idea"),
      SynthToken::full_stop()
    ];
    assert_eq!(expected, result);

    let result = p.parse("One, two, three... four!");
    let expected = vec![
      w("one"), SynthToken::breath(),
      w("two"), SynthToken::breath(),
      w("three"), SynthToken::half_stop(),
      w("four"), SynthToken::full_stop()
    ];
    assert_eq!(expected, result);
  }

  #[test]
  fn test_camel_case_expansion() {
    let p = make_parser();

    let result = p.parse("FooBar");
    let expected = vec![w("foo"), w("bar")];
    assert_eq!(expected, result);

    let result = p.parse("fooBarBaz");
    let expected = vec![w("foo"), w("bar"), w("baz")];
    assert_eq!(expected, result);

    // A partially unknown camel case
    let result = p.parse("FooBarQuerty");
    let expected = vec![f(12)];
    assert_eq!(expected, result);

    // An entirely unknown camel case
    let result = p.parse("qwertyUiop");
    let expected = vec![f(10)];
    assert_eq!(expected, result);
  }

  #[test]
  fn test_hyphenated_expansion() {
    let p = make_parser();

    let result = p.parse("never-ending");
    let expected = vec![w("never"), w("ending")];
    assert_eq!(expected, result);

    let result = p.parse("jack-o-lantern");
    let expected = vec![w("jack"), w("o"), w("lantern")];
    assert_eq!(expected, result);

    // A partially unknown hyphenation
    let result = p.parse("jack-o-qwerty");
    let expected = vec![f(13)];
    assert_eq!(expected, result);

    // An entirely unknown hyphenation
    let result = p.parse("qwerty-uiop");
    let expected = vec![f(11)];
    assert_eq!(expected, result);
  }

  #[test]
  fn test_twitter_usernames() {
    let p = make_parser();

    // Simple dictionary word
    let result = p.parse("@echelon");
    let expected = vec![w("echelon")];
    assert_eq!(expected, result);

    // For CamelCase words that exist
    let result = p.parse("@JonSnow");
    let expected = vec![w("jon"), w("snow")];
    assert_eq!(expected, result);

    // Unknown
    let result = p.parse("@qwerty");
    let expected = vec![f(6)];
    assert_eq!(expected, result);
  }

  #[test]
  fn test_twitter_hashtags() {
    let p = make_parser();

    // Simple dictionary word
    let result = p.parse("#food");
    let expected = vec![w("hashtag"), w("food")];
    assert_eq!(expected, result);

    // For CamelCase words that exist
    let result = p.parse("#FooBarBaz");
    let expected = vec![w("hashtag"), w("foo"), w("bar"), w("baz")];
    assert_eq!(expected, result);

    // Unknown
    let result = p.parse("#qwerty");
    let expected = vec!(f(6));
    assert_eq!(expected, result);
  }

  #[test]
  fn test_times() {
    let p = make_parser();

    let result = p.parse("5:00");
    let expected = vec![w("five"), w("o'clock")];
    assert_eq!(expected, result);

    let result = p.parse("12:30");
    let expected = vec![w("twelve"), w("thirty")];
    assert_eq!(expected, result);

    let result = p.parse("5pm");
    let expected = vec![w("five"), w("pm")];
    assert_eq!(expected, result);
  }

  #[test]
  fn test_complex_examples() {
    let p = make_parser();

    let result = p.parse(r#"Will be in Atlanta, Georgia this Friday at 5:00pm.
                         Join the MOVEMENT! Tickets available at:
                         https://t.co/Q6APf0ZFYA… https://t.co/6WAyO9eQHN"#);

    let expected = vec![
      w("will"), w("be"), w("in"), w("atlanta"), SynthToken::breath(),
      w("georgia"), w("this"), w("friday"), w("at"), w("five"), w("o'clock"),
      w("pm."), // TODO: Fix. Needs to be a full stop.
      w("join"), w("the"), w("movement"), SynthToken::full_stop(),
      w("tickets"), w("available"), w("at"),
      SynthToken::half_stop()
    ];

    assert_eq!(expected, result);

    // TODO
    // Handle numerics
    //assert_eq!("u.s. murders increased ten point eight percent in twenty fifteen",
    //           &p.parse(&s, "U.S. Murders Increased 10.8% in 2015"));
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

  fn f(value: u16) -> SynthToken {
    SynthToken::Filler { value: Filler { length: value } }
  }

  fn w(value: &str) -> SynthToken {
    SynthToken::Word { value: Word { value: value.to_string() } }
  }
}

