// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>
// The tokenizer takes a raw sentence and converts it into
// well-defined tokens. It doesn't try to map these tokens to words:
// that is the job of the parser.

use lang::abbr::AbbreviationsMap;
use lang::token::*;
use regex::Regex;
use std::collections::LinkedList;
use std::sync::Arc;
use super::dictionary::UniversalDictionary;

pub struct Tokenizer {
  /// The dictionary used to check if a word exists.
  dictionary: Arc<UniversalDictionary>,
  abbreviations: Arc<AbbreviationsMap>,
}

impl Tokenizer {
  /// CTOR.
  pub fn new(dictionary: Arc<UniversalDictionary>,
             abbreviations: Arc<AbbreviationsMap>) -> Tokenizer {
    Tokenizer {
      dictionary: dictionary,
      abbreviations: abbreviations,
    }
  }

  /// Split a raw sentence into well-defined tokens.
  pub fn tokenize(&self, raw_sentence: &str) -> Vec<Token> {
    info!(target: "parsing", "Raw Sentence = {}", raw_sentence);

    lazy_static! {
      // Note: Rust regexes do not support lookaround.
      // Designed not to match times (5:00) or URLs (http://)
      pub static ref RE_ALPHA_COLON: Regex = Regex::new(r"([A-Za-z]):([^/])").unwrap();
      pub static ref RE_ANY_DOUBLE_QUOTE: Regex= Regex::new("[\"“”]").unwrap();
      pub static ref RE_ANY_SMART_SINGLE_QUOTE: Regex= Regex::new("[‘’]").unwrap();
      pub static ref RE_BEGIN_SINGLE_QUOTE: Regex = Regex::new("^'").unwrap();
      pub static ref RE_SINGLE_QUOTE_END: Regex = Regex::new("'$").unwrap();
      pub static ref RE_SINGLE_QUOTE_SPACE: Regex = Regex::new("'\\s").unwrap();
      pub static ref RE_SPACE_SINGLE_QUOTE: Regex = Regex::new("\\s'").unwrap();
    }

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

    let split_spaces = split_sentence(&filtered);
    let mut tokenized = LinkedList::new();
    for split in split_spaces {
      tokenized.push_back(Token::unknown(split));
    }

    lazy_static! {
      static ref ELLIPSIS : Regex = Regex::new(r"\.{2,}|…").unwrap();
      static ref DASH: Regex = Regex::new(r"—|–|-{2,}|-$").unwrap();
    }

    tokenized = tokenize(tokenized, &ELLIPSIS, &Token::ellipsis());
    tokenized = tokenize(tokenized, &DASH, &Token::dash());
    tokenized = self.classify_tokens(tokenized);

    tokenized = tokenize_end_punctuation(tokenized);
    tokenized = self.classify_tokens(tokenized);
    tokenized = self.classify_remaining(tokenized);

    let mut tokens = Vec::new();
    for token in tokenized {
      tokens.push(token);
    }

    info!(target: "parsing", "Tokens = {:?}", tokens);

    tokens
  }

  // TODO: Test.
  // TODO: Efficiency.
  fn classify_tokens(&self, tokens: LinkedList<Token>) -> LinkedList<Token> {
    lazy_static! {
      static ref DATE: Regex = Regex::new(r"^\d{1,2}/\d{1,2}(/\d{1,4})?$").unwrap();
      static ref HASHTAG: Regex = Regex::new(r"#(\w+)").unwrap();
      static ref MENTION: Regex = Regex::new(r"@(\w+)").unwrap();
      static ref NUMBER: Regex = Regex::new(r"^-?\d+(,\d+){0,}(\.\d+)?$").unwrap();
      static ref URL: Regex = Regex::new(r"https?://[\w\.-]+/?(\w+)?").unwrap();
    }

    let mut output = LinkedList::new();

    for token in tokens {
      let unknown = match token.as_unknown() {
        None => {
          output.push_back(token.clone());
          continue;
        },
        Some(v) => { &v.value },
      };

      let word = unknown.to_lowercase();

      // Simple dictionary word matches
      if self.dictionary.contains(&word) {
        output.push_back(Token::dictionary_word(word));
        continue;
      }

      if self.abbreviations.is_abbreviation(&word) {
        output.push_back(Token::abbreviation(word));
        continue;
      }

      if URL.is_match(&unknown) {
        output.push_back(Token::url(unknown.to_string()));
        continue;
      }

      // FIXME: Speed up by converting to a hash lookup.
      // Rogue puncuation
      if unknown == "," {
        output.push_back(Token::comma());
        continue;
      } else if unknown == "." {
        output.push_back(Token::period());
        continue;
      }

      // Symbols
      if unknown == "@" {
        output.push_back(Token::at_sign());
        continue;
      } else if unknown == "&" {
        output.push_back(Token::ampersand());
        continue;
      } else if unknown == "<" {
        output.push_back(Token::less_than());
        continue;
      } else if unknown == ">" {
        output.push_back(Token::greater_than());
        continue;
      }

      // Match hashtags.
      if HASHTAG.is_match(&unknown) {
        output.push_back(Token::hashtag(unknown.to_string()));
        continue;
      }

      // Match mentions.
      if MENTION.is_match(&unknown) {
        output.push_back(Token::mention(unknown.to_string()));
        continue;
      }

      if DATE.is_match(&unknown) {
        output.push_back(Token::date(unknown.to_string()));
        continue;
      }

      if NUMBER.is_match(&unknown) {
        output.push_back(Token::number(unknown.to_string()));
        continue;
      }

      output.push_back(token.clone());
    }
    output
  }

  /// Classify the remaining unclassified tokens.
  fn classify_remaining(&self, tokens: LinkedList<Token>) -> LinkedList<Token> {
    lazy_static! {
      static ref INITIALISM: Regex = Regex::new(r"[A-Z]{3,7}").unwrap();
      static ref EMOJI: Regex = Regex::new(r"[\x{1F600}-\x{1F6FF}]").unwrap();
    }
    let mut output = LinkedList::new();

    for token in tokens {
      let unknown = match token.as_unknown() {
        None => {
          output.push_back(token.clone());
          continue;
        },
        Some(v) => { &v.value },
      };

      if INITIALISM.is_match(&unknown) {
        output.push_back(Token::initialism(unknown.to_string()));
        continue;
      }

      if EMOJI.is_match(&unknown) {
        output.push_back(Token::emoji(unknown.to_string()));
        continue;
      }

      output.push_back(token.clone());
    }
    output
  }
}

// TODO: Test.
// TODO: Efficiency. Modify input list, and only if there are ellipses.
/// Tokenize a "split" character with a regex.
/// eg. "foo,bar" becomes [Word(foo), Comma, Word(bar)].
fn tokenize(tokens: LinkedList<Token>, regex: &Regex, token_prototype: &Token)
    -> LinkedList<Token> {
  let mut output = LinkedList::new();

  for token in tokens {
    let unknown = match token.as_unknown() {
      None => {
        output.push_back(token.clone());
        continue;
      },
      Some(v) => { &v.value },
    };

    if !regex.is_match(&unknown) {
      output.push_back(token.clone());
      continue;
    }

    let mut begin = 0;
    let mut matches = LinkedList::new();

    for (first, last) in regex.find_iter(&unknown) {
      if begin < first {
        matches.push_back(Token::unknown(unknown[begin..first].to_string()));
      }
      matches.push_back(token_prototype.clone());
      begin = last;
    }
    if begin < unknown.len() {
      matches.push_back(Token::unknown(unknown[begin..unknown.len()].to_string()));
    }

    output.append(&mut matches);
  }
  output
}

// TODO: Test.
// TODO: Efficiency. Modify input list, and only if there are ellipses.
fn tokenize_end_punctuation(tokens: LinkedList<Token>)
    -> LinkedList<Token> {
  lazy_static! {
    static ref END_PUNCTUATION: Regex = Regex::new(r"[\.\?!,;]+$").unwrap();
  }

  let mut output = LinkedList::new();

  for token in tokens {
    let unknown = match token.as_unknown() {
      None => {
        output.push_back(token.clone());
        continue;
      },
      Some(v) => { &v.value },
    };

    if !END_PUNCTUATION.is_match(&unknown) {
      output.push_back(token.clone());
      continue;
    }

    let mut begin = 0;
    let mut matches = LinkedList::new();

    // TODO: Should only be zero or one match, and match should be at the end.
    for (first, second) in END_PUNCTUATION.find_iter(&unknown) {
      if begin < first {
        matches.push_back(Token::unknown(unknown[begin..first].to_string()));
      }

      // FIXME: This is really awful.
      let matched = unknown[first..second].to_string();
      if matched.len() == 1 {
        if &matched == "?" {
          matches.push_back(Token::question());
        } else if &matched == "!" {
          matches.push_back(Token::exclamation());
        } else if &matched == ";" {
          matches.push_back(Token::semicolon());
        } else if &matched == "." {
          matches.push_back(Token::period());
        } else if &matched == "," {
          matches.push_back(Token::comma());
        }
      } else {
        if matched.starts_with("?") {
          matches.push_back(Token::question());
        } else if matched.starts_with("!") {
          matches.push_back(Token::exclamation());
        } else if matched.starts_with(";") {
          matches.push_back(Token::semicolon());
        } else if matched.starts_with(".") {
          matches.push_back(Token::period());
        } else if matched.starts_with(",") {
          matches.push_back(Token::comma());
        }
      }

      begin = second;
    }

    output.append(&mut matches);
  }
  output
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
  use lang::abbr::AbbreviationsMap;
  use lang::dictionary::Dictionary;
  use lang::dictionary::UniversalDictionary;
  use lang::token::*;
  use std::collections::HashMap;
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
      w.insert("and".to_string());
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
      w.insert("on".to_string());
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
      w.insert("vote".to_string());
      w.insert("would".to_string());
      w.insert("you".to_string());
      w
    };

    static ref ABBRS: HashMap<String, Vec<String>> = {
      let mut abbr = HashMap::new();
      let mut w = Vec::new();
      w.push("oh".to_string());
      w.push("my".to_string());
      w.push("god".to_string());
      abbr.insert("omg".to_string(), w);
      abbr
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
  fn test_tokenize_dashes() {
    let t = make_tokenizer();

    let mut result = t.tokenize("One – Two");
    let mut expected = vec![w("one"), Token::dash(), w("two")];

    assert_eq!(expected, result);

    result = t.tokenize("One– Two");
    expected = vec![w("one"), Token::dash(), w("two")];

    assert_eq!(expected, result);

    result = t.tokenize("One—Two");
    expected = vec![w("one"), Token::dash(), w("two")];

    assert_eq!(expected, result);

    result = t.tokenize("One--Two");
    expected = vec![w("one"), Token::dash(), w("two")];

    assert_eq!(expected, result);

    result = t.tokenize("One - Two");
    expected = vec![w("one"), Token::dash(), w("two")];

    assert_eq!(expected, result);

    result = t.tokenize("One  -  Two");
    expected = vec![w("one"), Token::dash(), w("two")];

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
    let mut expected = vec![h("#foo"), h("#bar"), h("#baz")];

    assert_eq!(expected, result);

    result = t.tokenize("@echelon @UserName");
    expected = vec![m("@echelon"), m("@UserName")];

    assert_eq!(expected, result);
  }

  #[test]
  fn test_tokenize_abbreviations() {
    let t = make_tokenizer();

    let result = t.tokenize("omg");
    let expected = vec![a("omg")];

    assert_eq!(expected, result);

    // Case insensitive.
    let result = t.tokenize("OMG");

    assert_eq!(expected, result);

    // Vs. initialisms
    let result = t.tokenize("OMG FML");
    let expected = vec![a("omg"), i("FML")];

    assert_eq!(expected, result);
  }

  #[test]
  fn test_tokenize_initialisms() {
    let t = make_tokenizer();

    let mut result = t.tokenize("FBI");
    let mut expected = vec![i("FBI")];

    assert_eq!(expected, result);

    result = t.tokenize("FOO FUD bar bpa");
    expected = vec![w("foo"), i("FUD"), w("bar"), u("bpa")];

    assert_eq!(expected, result);

    result = t.tokenize("Sign the NDA!");
    expected = vec![w("sign"), w("the"), i("NDA"), Token::exclamation()];

    assert_eq!(expected, result);

    result = t.tokenize("FDA. NSA? MPAA, RIAA!");
    expected = vec![i("FDA"), Token::period(),
                    i("NSA"), Token::question(),
                    i("MPAA"), Token::comma(),
                    i("RIAA"), Token::exclamation()];

    assert_eq!(expected, result);
  }

  /* TODO examples / things that break:
    - RT @username: (RT = retweet)
    - Fortune 100. (Numbers)
    - Currencies ($5)
    - United States in 2016. (Years)
    - ✓ Emoji
      - 😂
      - ⬇️
      - ‼️
    - w/local officials
    - a...telling (broken)
    - (and we aren't stupid) (broken)
    - ABC… -> i(ABC), ellipsis (broken)
    - Clinton and Trump at 9 p.m. ET!
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

    assert_eq!(expected, result);

    result = t.tokenize("On 10/1 and 10/02");
    expected = vec![w("on"), date("10/1"), w("and"), date("10/02")];

    assert_eq!(expected, result);
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
    let abbreviations = AbbreviationsMap::new(ABBRS.clone());
    Tokenizer {
      dictionary: Arc::new(dictionary),
      abbreviations: Arc::new(abbreviations),
    }
  }

  // Helper function.
  fn a(value: &str) -> Token {
    Token::abbreviation(value.to_string())
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

