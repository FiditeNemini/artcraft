// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

use regex::Regex;
use std::fmt;
use std::sync::Arc;
use super::dictionary::UniversalDictionary;

lazy_static! {
  // Note: Rust regexes do not support lookaround.
  // Designed not to match times (5:00) or URLs (http://)
  pub static ref RE_ALPHA_COLON: Regex = Regex::new(r"([A-Za-z]):([^/])").unwrap();
  pub static ref RE_ANY_DOUBLE_QUOTE: Regex= Regex::new("[\"“”]").unwrap();
  pub static ref RE_ANY_SMART_SINGLE_QUOTE: Regex= Regex::new("[‘’]").unwrap();
  pub static ref RE_BEGIN_SINGLE_QUOTE: Regex = Regex::new("^'").unwrap();
  pub static ref RE_PERIOD_END: Regex = Regex::new("\\.$").unwrap();
  pub static ref RE_PERIOD_SPACE: Regex = Regex::new("\\.\\s").unwrap();
  pub static ref RE_SINGLE_QUOTE_END: Regex = Regex::new("'$").unwrap();
  pub static ref RE_SINGLE_QUOTE_SPACE: Regex = Regex::new("'\\s").unwrap();
  pub static ref RE_SPACE_SINGLE_QUOTE: Regex = Regex::new("\\s'").unwrap();

  // Token type matching.
  pub static ref RE_DATE: Regex = Regex::new(r"\d{1,2}/\d{1,2}(/\d{1,4})?").unwrap();
  // TODO: initialism regex should not match on ending punctuation
  pub static ref RE_INITIALISM: Regex = Regex::new(r"[A-Z]{3,7}").unwrap();
  pub static ref RE_URL: Regex = Regex::new(r"https?://[\w\.-]+/?(\w+)?").unwrap();

  // Twitter matching.
  pub static ref RE_AT_MENTION : Regex = Regex::new(r"@(\w+)").unwrap();
  pub static ref RE_HASHTAG : Regex = Regex::new(r"#(\w+)").unwrap();
}

#[derive(PartialEq)]
pub struct DictionaryWord {
  pub value: String,
}

#[derive(PartialEq)]
pub struct Date {
  pub value: String,
}

#[derive(Debug, PartialEq)]
pub enum Punctuation {
  Comma,
  Dash,
  Ellipsis,
  Exclamation,
  Period,
  Question,
}

#[derive(Debug, PartialEq)]
pub enum Symbol {
  Ampersand,
  AtSign,
  GreaterThan,
  LessThan,
}

#[derive(PartialEq)]
pub struct Hashtag {
  pub value: String,
}

#[derive(PartialEq)]
pub struct Mention {
  pub value: String,
}

#[derive(PartialEq)]
pub struct Initialism {
  pub value: String,
}

#[derive(PartialEq)]
pub struct Url {
  pub value: String,
}

#[derive(PartialEq)]
pub struct Unknown {
  pub value: String,
}

#[derive(PartialEq)]
pub enum Token {
  Date { value: Date },
  DictionaryWord { value: DictionaryWord },
  Hashtag { value: Hashtag },
  Initialism { value: Initialism },
  Mention { value: Mention },
  Punctuation { value: Punctuation },
  Symbol { value: Symbol },
  Unknown { value: Unknown },
  Url { value: Url },
}

impl fmt::Debug for Token {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    let val = match *self {
      Token::Date { value : ref v } => format!("Date {}", v.value),
      Token::DictionaryWord { value : ref v } => format!("Word {}", v.value),
      Token::Hashtag { value : ref v } => format!("Hashtag {}", v.value),
      Token::Initialism { value : ref v } => format!("Initialism {}", v.value),
      Token::Mention { value : ref v } => format!("Mention {}", v.value),
      Token::Punctuation { value : ref v } => format!("Punctuation {:?}", v),
      Token::Symbol { value : ref v } => format!("Symbol {:?}", v),
      Token::Unknown { value : ref v } => format!("Unknown {}", v.value),
      Token::Url { value : ref v } => format!("Url {}", v.value),
    };
    write!(f, "{}", val)
  }
}

impl Token {
  pub fn dictionary_word(value: String) -> Token {
    Token::DictionaryWord { value: DictionaryWord { value: value } }
  }

  pub fn date(value: String) -> Token {
    Token::Date { value: Date { value: value } }
  }

  pub fn url(value: String) -> Token {
    Token::Url { value: Url { value: value } }
  }

  pub fn initialism(value: String) -> Token {
    Token::Initialism { value: Initialism { value: value } }
  }

  pub fn hashtag(value: String) -> Token {
    Token::Hashtag { value: Hashtag { value: value } }
  }

  pub fn mention(value: String) -> Token {
    Token::Mention { value: Mention { value: value } }
  }

  pub fn unknown(value: String) -> Token {
    Token::Unknown { value: Unknown { value: value } }
  }

  pub fn period() -> Token {
    Token::Punctuation { value: Punctuation::Period }
  }

  pub fn comma() -> Token {
    Token::Punctuation { value: Punctuation::Comma }
  }

  pub fn question() -> Token {
    Token::Punctuation { value: Punctuation::Question }
  }

  pub fn exclamation() -> Token {
    Token::Punctuation { value: Punctuation::Exclamation }
  }

  pub fn ellipsis() -> Token {
    Token::Punctuation { value: Punctuation::Ellipsis }
  }

  pub fn ampersand() -> Token {
    Token::Symbol { value: Symbol::Ampersand }
  }

  pub fn at_sign() -> Token {
    Token::Symbol { value: Symbol::AtSign }
  }

  pub fn less_than() -> Token {
    Token::Symbol { value: Symbol::LessThan }
  }

  pub fn greater_than() -> Token {
    Token::Symbol { value: Symbol::GreaterThan }
  }
}

pub struct Tokenizer {
  /// The dictionary used to check if a word exists.
  dictionary: Arc<UniversalDictionary>,
}

impl Tokenizer {
  /// CTOR.
  pub fn new(dictionary: Arc<UniversalDictionary>) -> Tokenizer {
    Tokenizer { dictionary: dictionary }
  }

  /// Split a raw sentence into well-defined tokens.
  pub fn tokenize(&self, raw_sentence: &str) -> Vec<Token> {
    info!(target: "parsing", "Raw Sentence = {}", raw_sentence);

    // Remove any type of double quote
    let mut filtered = RE_ANY_DOUBLE_QUOTE.replace_all(raw_sentence, " ");

    // TODO: TEST
    // Standardize single quotes
    filtered = RE_ANY_SMART_SINGLE_QUOTE.replace_all(&filtered, "'");

    // TODO: TEST
    // Remove single quotes not used in conjunctions
    filtered = RE_BEGIN_SINGLE_QUOTE.replace_all(&filtered, "");
    filtered = RE_SINGLE_QUOTE_END.replace_all(&filtered, "");
    filtered = RE_SINGLE_QUOTE_SPACE.replace_all(&filtered, " ");
    filtered = RE_SPACE_SINGLE_QUOTE.replace_all(&filtered, " ");

    // TODO: TEST
    // Handle colons
    // Designed not to match times (5:00) or URLs (http://)
    filtered = RE_ALPHA_COLON.replace_all(&filtered, "$1 ");

    // TODO: TEST; also tokenize properly.
    // Handle dashes
    filtered = filtered.replace("—", " ")
        .replace("--", " ")
        .replace(" - ", " ");

    let split_words = split_sentence(&filtered);

    let mut tokens = Vec::new();

    for w in split_words {
      let word = w.to_lowercase();

      // Simple dictionary word matches
      if self.dictionary.contains(&word) {
        tokens.push(Token::dictionary_word(word));
        continue;
      }

      // TODO: TEST
      // Match URLs.
      if RE_URL.is_match(&word) {
        tokens.push(Token::url(word));
        continue;
      }

      // FIXME: Inefficiency, verboseness
      // Punctuation
      if word.ends_with("...") {
        let w = word.trim_right_matches("...");
        if self.dictionary.contains(&w) {
          tokens.push(Token::dictionary_word(w.to_string()));
          tokens.push(Token::ellipsis());
          continue;
        }
      } else if word.ends_with(".") {
        let w = word.trim_right_matches(".");
        if self.dictionary.contains(&w) {
          tokens.push(Token::dictionary_word(w.to_string()));
          tokens.push(Token::period());
          continue;
        }
      } else if word.ends_with(",") {
        let w = word.trim_right_matches(",");
        if self.dictionary.contains(&w) {
          tokens.push(Token::dictionary_word(w.to_string()));
          tokens.push(Token::comma());
          continue;
        }
      } else if word.ends_with("?") {
        let w = word.trim_right_matches("?");
        if self.dictionary.contains(&w) {
          tokens.push(Token::dictionary_word(w.to_string()));
          tokens.push(Token::question());
          continue;
        }
      } else if word.ends_with("!") {
        let w = word.trim_right_matches("!");
        if self.dictionary.contains(&w) {
          tokens.push(Token::dictionary_word(w.to_string()));
          tokens.push(Token::exclamation());
          continue;
        }
      } else if word.ends_with("…") {
        let w = word.trim_right_matches("…");
        if self.dictionary.contains(&w) {
          tokens.push(Token::dictionary_word(w.to_string()));
          tokens.push(Token::ellipsis());
          continue;
        }
      }

      // FIXME: Speed up by converting to a hash lookup.
      // Rogue puncuation
      if &word == "," {
        tokens.push(Token::comma());
        continue;
      } else if word == "." {
        tokens.push(Token::period());
        continue;
      }

      // Symbols
      if &word == "@" {
        tokens.push(Token::at_sign());
        continue;
      } else if &word == "&" {
        tokens.push(Token::ampersand());
        continue;
      } else if &word == "<" {
        tokens.push(Token::less_than());
        continue;
      } else if &word == ">" {
        tokens.push(Token::greater_than());
        continue;
      }

      // Match hashtags.
      if RE_HASHTAG.is_match(&word) {
        let tag = word.trim_left_matches("#");
        tokens.push(Token::hashtag(tag.to_string()));
        continue;
      }

      // Match mentions.
      if RE_AT_MENTION.is_match(&word) {
        let tag = word.trim_left_matches("@");
        tokens.push(Token::mention(tag.to_string()));
        continue;
      }

      if RE_DATE.is_match(&word) {
        if word.ends_with("?") {
          let w = word.trim_right_matches("?");
          tokens.push(Token::date(w.to_string()));
          tokens.push(Token::question());
        } else if word.ends_with("!") {
          let w = word.trim_right_matches("!");
          tokens.push(Token::date(w.to_string()));
          tokens.push(Token::exclamation());
        } else if word.ends_with("...") {
          let w = word.trim_right_matches("...");
          tokens.push(Token::date(w.to_string()));
          tokens.push(Token::ellipsis());
        } else if word.ends_with(".") {
          let w = word.trim_right_matches(".");
          tokens.push(Token::date(w.to_string()));
          tokens.push(Token::period());
        } else if word.ends_with(",") {
          let w = word.trim_right_matches(",");
          tokens.push(Token::date(w.to_string()));
          tokens.push(Token::comma());
        } else {
          tokens.push(Token::date(word.to_string()));
        }
        continue;
      }

      // TODO: More efficient + cleanup
      // Initialisms
      if RE_INITIALISM.is_match(&w) {
        if word.ends_with("?") {
          let w = word.trim_right_matches("?");
          tokens.push(Token::initialism(w.to_string()));
          tokens.push(Token::question());
        } else if word.ends_with("!") {
          let w = word.trim_right_matches("!");
          tokens.push(Token::initialism(w.to_string()));
          tokens.push(Token::exclamation());
        } else if word.ends_with("...") {
          let w = word.trim_right_matches("...");
          tokens.push(Token::initialism(w.to_string()));
          tokens.push(Token::ellipsis());
        } else if word.ends_with(".") {
          let w = word.trim_right_matches(".");
          tokens.push(Token::initialism(w.to_string()));
          tokens.push(Token::period());
        } else if word.ends_with(",") {
          let w = word.trim_right_matches(",");
          tokens.push(Token::initialism(w.to_string()));
          tokens.push(Token::comma());
        } else {
          tokens.push(Token::initialism(word.to_string()));
        }
        continue;
      }

      // Failure to classify
      tokens.push(Token::unknown(word))
    }

    info!(target: "parsing", "Tokens = {:?}", tokens);

    tokens
  }
}

/// Split a sentence into words. Remove extra padding, etc.
fn split_sentence(sentence: &str) -> Vec<String> {
  let mut words = Vec::new();
  let split = sentence.split(char::is_whitespace);
  for s in split {
    let trim = s.trim();
    if trim.len() == 0 { continue; }
    words.push(trim.to_string());
  }
  words
}

#[cfg(test)]
mod tests {
  use lang::dictionary::Dictionary;
  use lang::dictionary::UniversalDictionary;
  use std::collections::HashSet;
  use std::sync::Arc;
  use super::*;
  use super::split_sentence;

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
      w.insert("would".to_string());
      w.insert("you".to_string());
      w
    };
  }

  #[test]
  fn test_tokenize_spaces() {
    let t = make_tokenizer();

    let mut result = t.tokenize("    FOO      BAR      BAZ    ");
    let expected = vec![w("foo"), w("bar"), w("baz")];

    assert_eq!(expected, result);

    result = t.tokenize("\nFOO\n\tBAR\n\rBAZ\t\t");
    assert_eq!(expected, result);
  }

  #[test]
  fn test_tokenize_punctuation() {
    let t = make_tokenizer();

    let mut result = t.tokenize("Join me in Atlanta, Georgia.");
    let mut expected = vec![w("join"), w("me"), w("in"), w("atlanta"),
                            Token::comma(), w("georgia"), Token::period()];

    assert_eq!(expected, result);

    result = t.tokenize("ONE, TWO,  THREE  ");
    expected = vec![w("one"), Token::comma(),
                    w("two"), Token::comma(),
                    w("three")];

    assert_eq!(expected, result);

    result = t.tokenize("One! Two? Three. Four... Five…");
    expected = vec![w("one"), Token::exclamation(),
                    w("two"), Token::question(),
                    w("three"), Token::period(),
                    w("four"), Token::ellipsis(),
                    w("five"), Token::ellipsis()];

    assert_eq!(expected, result);
  }

  #[test]
  fn test_tokenize_quotes() {
    let t = make_tokenizer();

    let mut result = t.tokenize("\"Foo Bar\", Baz");
    let expected = vec![w("foo"), w("bar"), Token::comma(), w("baz")];

    assert_eq!(expected, result);

    result = t.tokenize("“Foo Bar”, Baz");
    assert_eq!(expected, result);

    result = t.tokenize("“Foo Bar,” Baz");
    assert_eq!(expected, result);
  }

  #[test]
  fn test_tokenize_symbols() {
    let t = make_tokenizer();

    let mut result = t.tokenize("One & Two");
    let mut expected = vec![w("one"), Token::ampersand(), w("two")];

    assert_eq!(expected, result);

    result = t.tokenize("Foo @ Bar");
    expected = vec![w("foo"), Token::at_sign(), w("bar")];

    assert_eq!(expected, result);

    result = t.tokenize("One < Three > Two");
    expected = vec![w("one"), Token::less_than(),
                    w("three"), Token::greater_than(),
                    w("two")];

    assert_eq!(expected, result);
  }

  #[test]
  fn test_tokenize_twitter() {
    let t = make_tokenizer();

    let mut result = t.tokenize("#foo #bar #baz");
    let mut expected = vec![h("foo"), h("bar"), h("baz")];

    assert_eq!(expected, result);

    result = t.tokenize("@echelon @UserName");
    expected = vec![m("echelon"), m("username")];

    assert_eq!(expected, result);
  }

  #[test]
  fn test_tokenize_initialisms() {
    let t = make_tokenizer();

    let mut result = t.tokenize("FBI");
    let mut expected = vec![i("fbi")];

    assert_eq!(expected, result);

    result = t.tokenize("FOO FUD bar bpa");
    expected = vec![w("foo"), i("fud"), w("bar"), u("bpa")];

    assert_eq!(expected, result);

    result = t.tokenize("Sign the NDA!");
    expected = vec![w("sign"), w("the"), i("nda"), Token::exclamation()];

    assert_eq!(expected, result);

    result = t.tokenize("FDA. NSA? MPAA, RIAA!");
    expected = vec![i("fda"), Token::period(),
                    i("nsa"), Token::question(),
                    i("mpaa"), Token::comma(),
                    i("riaa"), Token::exclamation()];

    assert_eq!(expected, result);
  }

  /* TODO examples:
    - United States in 2016.
    - RT @username:
    - Fortune 100.
    - —Hillary
    - ✓ Emoji
  */

  #[test]
  fn test_date() {
    let t = make_tokenizer();

    let mut result = t.tokenize("1/9");
    let mut expected = vec![date("1/9")];

    assert_eq!(expected, result);

    result = t.tokenize("10/7/2016");
    expected = vec![date("10/7/2016")];

    assert_eq!(expected, result);

    result = t.tokenize("VOTE on 11/8/16.");
    expected = vec![w("vote"), w("on"), date("11/8/16"), Token::period()];

    result = t.tokenize("On 10/1 and 10/02");
    expected = vec![w("on"), date("10/1"), w("and"), date("10/02")];
  }

  #[test]
  fn test_split_sentence() {
    fn sen(list: &[&str]) -> Vec<String> {
      let mut out = Vec::new();
      for it in list { out.push(it.to_string()); }
      out
    }

    assert_eq!(sen(&["foo"]), split_sentence("  foo  "));
    assert_eq!(sen(&["foo", "bar", "baz"]), split_sentence("foo bar baz"));
    assert_eq!(sen(&[".", "..", "..."]), split_sentence("   .\n..\t\t...\n  "));

    let empty : Vec<String> = Vec::new();
    assert_eq!(empty, split_sentence("      \n\t     "));
  }

  // Helper function.
  fn make_dictionary() -> UniversalDictionary {
    let dictionary = Dictionary::new(WORDS.clone());

    let mut ud = UniversalDictionary::new();
    ud.set_arpabet_dictionary(dictionary);
    ud
  }

  // Helper function.
  fn make_tokenizer() -> Tokenizer {
    let dictionary = make_dictionary();
    Tokenizer { dictionary: Arc::new(dictionary) }
  }

  // Helper function.
  fn w(value: &str) -> Token {
    Token::dictionary_word(value.to_string())
  }

  // Helper function.
  fn u(value: &str) -> Token {
    Token::unknown(value.to_string())
  }

  fn h(value: &str) -> Token {
    Token::hashtag(value.to_string())
  }

  fn m(value: &str) -> Token {
    Token::mention(value.to_string())
  }

  fn i(value: &str) -> Token {
    Token::initialism(value.to_string())
  }

  fn date(value: &str) -> Token {
    Token::date(value.to_string())
  }
}

