// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>
// The tokenizer takes a raw sentence and converts it into
// well-defined tokens. It doesn't try to map these tokens to words:
// that is the job of the parser.

use lang::abbr::AbbreviationsMap;
use lang::tokens::*;
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
      pub static ref RE_CURRENCY: Regex = Regex::new(r"([Ƀ¢$€£₤¥])").unwrap();
      // Designed to match percents that follow digits.
      // If they match in URL encoding, well, too bad... I don't care about that.
      pub static ref RE_DIGIT_PERCENT: Regex = Regex::new(r"(\d+)%").unwrap();
      pub static ref RE_ANY_DOUBLE_QUOTE: Regex= Regex::new("[\"“”]").unwrap();
      pub static ref RE_ANY_SMART_SINGLE_QUOTE: Regex= Regex::new("[‘’]").unwrap();
      pub static ref RE_BEGIN_SINGLE_QUOTE: Regex = Regex::new("^'").unwrap();
      pub static ref RE_SINGLE_QUOTE_END: Regex = Regex::new("'$").unwrap();
      pub static ref RE_SINGLE_QUOTE_SPACE: Regex = Regex::new("'\\s").unwrap();
      pub static ref RE_SPACE_SINGLE_QUOTE: Regex = Regex::new("\\s'").unwrap();
      // For now remove all of these characters.
      pub static ref RE_GARBAGE: Regex = Regex::new(r"\*|\[|\]|\(|\)|\|").unwrap();

      // Match a time conjoined with a unit, eg '2:30ET', or '9pm'.
      pub static ref RE_TIME: Regex = {
        let time_with_unit = r#"(?i)
            (\d{1,2}(:\d{2})?)
            (a\.?m\.?|p\.?m\.?|e\.?t\.?|p\.?t\.?)
          "#;
        Regex::new(&time_with_unit.replace(char::is_whitespace, "")).unwrap()
      };
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
    filtered = RE_GARBAGE.replace_all(&filtered, " ");

    // Regexes with match groups
    filtered = RE_ALPHA_COLON.replace_all(&filtered, "$1 "); // TODO TEST
    filtered = RE_CURRENCY.replace_all(&filtered, "$1 ");
    filtered = RE_DIGIT_PERCENT.replace_all(&filtered, "$1 % ");
    filtered = RE_TIME.replace_all(&filtered, " $1 $3 ");

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

  // TODO: Efficiency.
  fn classify_tokens(&self, tokens: LinkedList<Token>) -> LinkedList<Token> {
    lazy_static! {
      static ref DATE: Regex = Regex::new(r"^\d{1,2}/\d{1,2}(/\d{1,4})?$").unwrap();
      static ref HASHTAG: Regex = Regex::new(r"#(\w+)").unwrap();
      static ref HYPHENATED: Regex = Regex::new(r"\w+(-\w+){1,}").unwrap();
      static ref MENTION: Regex = Regex::new(r"@(\w+)").unwrap();
      static ref NUMBER: Regex = Regex::new(r"^-?\d+(,\d+){0,}(\.\d+)?$").unwrap();
      static ref ORDINAL: Regex = Regex::new(r"^\d+(,\d+){0,}(st|nd|rd|th)$").unwrap();
      static ref TIME: Regex = Regex::new(r"^\d{1,2}:\d{2}$").unwrap();
      static ref URL: Regex = Regex::new(r"https?://[\w\.-]+/?(\w+)?").unwrap();
      static ref CAMEL: Regex = {
        let camel_case = r#"
          ^
            ([a-z]+[0-9A-Z]+([a-z]+[0-9A-Z]+){0,}[a-z]*)
          |
            ([0-9A-Z]+[a-z]+[0-9A-Z]+([a-z]+[0-9A-Z]+){0,}[a-z]*)
          $"#;
        Regex::new(&camel_case.replace(char::is_whitespace, "")).unwrap()
      };
    }

    let mut output = LinkedList::new();

    for token in tokens {
      // Skip already classified tokens.
      let unknown = match token.as_unknown() {
        None => {
          output.push_back(token.clone());
          continue;
        },
        Some(v) => { &v.value },
      };

      let word = unknown.to_lowercase();

      // Handle possible time units before checking the dictionary.
      match word.as_ref() {
        "am" | "a.m" | "am." | "a.m." |
        "pm" | "p.m" | "pm." | "p.m." |
        "et" | "e.t." |
        "pt" | "p.t." => {
          output.push_back(Token::maybe_time_unit(unknown.to_string()));
          continue;
        },
        _ => {},
      }

      // Simple dictionary word matches
      if self.dictionary.contains(&word) {
        output.push_back(Token::dictionary_word(word));
        continue;
      }

      if self.abbreviations.is_abbreviation(&word) {
        output.push_back(Token::abbreviation(word));
        continue;
      }

      // Handle single characters
      // FIXME: Is a hash lookup faster?
      match unknown.as_ref() {
        // Punctuation
        "," => { output.push_back(Token::comma()); continue; },
        "." => { output.push_back(Token::period()); continue; },
        // Symbols
        "@" => { output.push_back(Token::at_sign()); continue; },
        "&" => { output.push_back(Token::ampersand()); continue; },
        "%" => { output.push_back(Token::percent()); continue; },
        "<" => { output.push_back(Token::less_than()); continue; },
        ">" => { output.push_back(Token::greater_than()); continue; },
        "+" => { output.push_back(Token::plus()); continue; },
        // Currency symbols
        "Ƀ" => { output.push_back(Token::bitcoin()); continue; },
        "¢" => { output.push_back(Token::cent()); continue; },
        "$" => { output.push_back(Token::dollar()); continue; },
        "€" => { output.push_back(Token::euro()); continue; },
        "£" | "₤" => { output.push_back(Token::pound()); continue; },
        "¥" => { output.push_back(Token::yen()); continue; },
        _ => {},
      }

      if URL.is_match(&unknown) {
        output.push_back(Token::url(unknown.to_string()));
        continue;
      }

      if HASHTAG.is_match(&unknown) {
        output.push_back(Token::hashtag(unknown.to_string()));
        continue;
      }

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

      if ORDINAL.is_match(&unknown) {
        output.push_back(Token::ordinal(unknown.to_string()));
        continue;
      }

      if HYPHENATED.is_match(&unknown) {
        output.push_back(Token::hyphenated(unknown.to_string()));
        continue;
      }

      if CAMEL.is_match(&unknown) {
        output.push_back(Token::camel(unknown.to_string()));
        continue;
      }

      if TIME.is_match(&unknown) {
        output.push_back(Token::time(unknown.to_string()));
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
  use lang::tokens::*;
  use std::collections::HashMap;
  use std::collections::HashSet;
  use std::sync::Arc;
  use super::*;
  use super::split_sentence;

  // TODO: Share this between the tokenizer and parser tests.
  lazy_static! {
    /// Word set to use in the tests.
    static ref WORDS: HashSet<String> = {
      let words = vec![
        "a",
        "and",
        "at",
        "atlanta",
        "available",
        "bad",
        "bar",
        "baz",
        "be",
        "best",
        "can't",
        "dictionary-word",
        "echelon",
        "five",
        "foo",
        "forget",
        "four",
        "fox",
        "friday",
        "georgia",
        "handle",
        "he",
        "hi",
        "hound",
        "idea",
        "in",
        "is",
        "it",
        "it's",
        "join",
        "link",
        "lot",
        "me",
        "movement",
        "of",
        "on",
        "one",
        "people",
        "place",
        "quote",
        "sign",
        "stuff",
        "sure",
        "test",
        "testing",
        "that",
        "the",
        "thing",
        "this",
        "three",
        "tickets",
        "to",
        "two",
        "username",
        "visit",
        "vote",
        "waves",
        "would",
        "you",
      ];

      let mut hs = HashSet::new();
      for w in words { hs.insert(w.to_string()); }
      hs
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

  /* TODO examples / things that break:
    - Currencies ($5)
    - United States in 2016. (Years)
    - ✓ Emoji
      - 😂
      - ⬇️
      - ‼️
    - 76% (should be simple.)
    - w/local officials
    - a...telling (broken)
    - (and we aren't stupid) (broken)
    - ABC… -> i(ABC), ellipsis (broken)
    - Clinton and Trump at 9 p.m. ET!
  */

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

    // TODO: Test "#NewYorkCity!", which breaks.
    let mut result = t.tokenize("#foo #bar #baz");
    let mut expected = vec![h("#foo"), h("#bar"), h("#baz")];

    assert_eq!(expected, result);

    // TODO: Test "@POTUS,", which breaks.
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
  fn test_time_units() {
    let t = make_tokenizer();

    fn tm(value: &str) -> Token {
      Token::time(value.to_string())
    }

    fn tu(value: &str) -> Token {
      Token::maybe_time_unit(value.to_string())
    }

    let result = t.tokenize("5:30pm.");
    let expected = vec![tm("5:30"), tu("pm.")];
    assert_eq!(expected, result);

    let result = t.tokenize("12:00a.m.");
    let expected = vec![tm("12:00"), tu("a.m.")];
    assert_eq!(expected, result);

    // Number won't be classified as a time.
    let result = t.tokenize("12ET");
    let expected = vec![n("12"), tu("ET")];
    assert_eq!(expected, result);

    // Number won't be classified as a time.
    let result = t.tokenize("9 p.m. PT");
    let expected = vec![n("9"), tu("p.m."), tu("PT")];
    assert_eq!(expected, result);

    // Numbers won't be classified as a time.
    let result = t.tokenize("8pm to 10pm");
    let expected = vec![n("8"), tu("pm"), w("to"), n("10"), tu("pm")];
    assert_eq!(expected, result);
  }

  #[test]
  fn test_camel_case() {
    let t = make_tokenizer();

    fn cc(value: &str) -> Token {
      Token::camel(value.to_string())
    }

    // Doesn't match all-caps.
    let result = t.tokenize("NOTCAMEL");
    let expected = vec![i("NOTCAMEL")]; // NB: initialism
    assert_eq!(expected, result);

    // Doesn't match capitalized (unknown) words.
    let result = t.tokenize("Dothraki");
    let expected = vec![u("Dothraki")];
    assert_eq!(expected, result);

    // Or uncapitalized.
    let result = t.tokenize("dothraki");
    let expected = vec![u("dothraki")];
    assert_eq!(expected, result);

    // Doesn't match words in our dictionary, despite camel case.
    let result = t.tokenize("AtLanTa");
    let expected = vec![w("atlanta")];
    assert_eq!(expected, result);

    // Matches various forms of CamelCase.
    let result = t.tokenize("CamelCase");
    let expected = vec![cc("CamelCase")];
    assert_eq!(expected, result);

    let result = t.tokenize("camelCase");
    let expected = vec![cc("camelCase")];
    assert_eq!(expected, result);

    let result = t.tokenize("ABigDog AfraidOfI");
    let expected = vec![cc("ABigDog"), cc("AfraidOfI")];
    assert_eq!(expected, result);

    // Even for included digits.
    let result = t.tokenize("OneTwo3 Four5Six");
    let expected = vec![cc("OneTwo3"), cc("Four5Six")];
    assert_eq!(expected, result);
  }

  #[test]
  fn test_hyphenated_words() {
    let t = make_tokenizer();

    fn hy(value: &str) -> Token {
      Token::hyphenated(value.to_string())
    }

    // Doesn't match a dictionary word that happens to contain a hyphen.
    let result = t.tokenize("dictionary-word");
    let expected = vec![w("dictionary-word")];
    assert_eq!(expected, result);

    // Doesn't match a dash separation between two dictionary words.
    let result = t.tokenize("one--two");
    let expected = vec![w("one"), Token::dash(), w("two")];
    assert_eq!(expected, result);

    let result = t.tokenize("one - two");
    let expected = vec![w("one"), Token::dash(), w("two")];
    assert_eq!(expected, result);

    // Hyphenated strings
    let result = t.tokenize("hyphenated-string");
    let expected = vec![hy("hyphenated-string")];
    assert_eq!(expected, result);

    let result = t.tokenize("multiply-hyphenated-string");
    let expected = vec![hy("multiply-hyphenated-string")];
    assert_eq!(expected, result);

    let result = t.tokenize("UPPER-CASE");
    let expected = vec![hy("UPPER-CASE")];
    assert_eq!(expected, result);
  }

  #[test]
  fn test_remove_square_brackets() {
    let t = make_tokenizer();

    let result = t.tokenize("[forget]");
    let expected = vec![w("forget")];
    assert_eq!(expected, result);

    let result = t.tokenize("[He is the] best");
    let expected = vec![w("he"), w("is"), w("the"), w("best")];
    assert_eq!(expected, result);

    let result = t.tokenize("(((test)))");
    let expected = vec![w("test")];
    assert_eq!(expected, result);
  }

  #[test]
  fn test_remove_parens() {
    let t = make_tokenizer();

    let result = t.tokenize("(forget)");
    let expected = vec![w("forget")];
    assert_eq!(expected, result);

    let result = t.tokenize("(He is the) best");
    let expected = vec![w("he"), w("is"), w("the"), w("best")];
    assert_eq!(expected, result);

    let result = t.tokenize("[[[test]]]");
    let expected = vec![w("test")];
    assert_eq!(expected, result);
  }

  #[test]
  fn test_remove_asterisk() {
    let t = make_tokenizer();

    let result = t.tokenize("*waves*");
    let expected = vec![w("waves")];
    assert_eq!(expected, result);

    let result = t.tokenize("*waves hi* and stuff");
    let expected = vec![w("waves"), w("hi"), w("and"), w("stuff")];
    assert_eq!(expected, result);
  }

  #[test]
  fn test_symbols() {
    let t = make_tokenizer();

    let result = t.tokenize("& < > + % @");
    let expected = vec![
      Token::ampersand(),
      Token::less_than(),
      Token::greater_than(),
      Token::plus(),
      Token::percent(),
      Token::at_sign(),
    ];
    assert_eq!(expected, result);

    // TODO:
    // let result = t.tokenize("1+2");
    // let expected = vec![n("1"), Token::plus(), n("2")];
    // assert_eq!(expected, result);
  }

  #[test]
  fn test_currency() {
    let t = make_tokenizer();

    let result = t.tokenize("$");
    let expected = vec![Token::dollar()];
    assert_eq!(expected, result);

    let result = t.tokenize("€");
    let expected = vec![Token::euro()];
    assert_eq!(expected, result);

    let result = t.tokenize("Ƀ ¢ $ € £ ₤ ¥");
    let expected = vec![
      Token::bitcoin(),
      Token::cent(),
      Token::dollar(),
      Token::euro(),
      Token::pound(),
      Token::pound(),
      Token::yen(),
    ];
    assert_eq!(expected, result);

    let result = t.tokenize("Ƀ¢$€£₤¥");
    let expected = vec![
      Token::bitcoin(),
      Token::cent(),
      Token::dollar(),
      Token::euro(),
      Token::pound(),
      Token::pound(),
      Token::yen(),
    ];
    assert_eq!(expected, result);

    let result = t.tokenize("$99");
    let expected = vec![Token::dollar(), n("99")];
    assert_eq!(expected, result);

    // TODO: Make this work -
    // let result = t.tokenize("99¢");
    // let expected = vec![n("99"), Token::cent()];
    // assert_eq!(expected, result);
  }

  #[test]
  fn test_percent_symbol() {
    let t = make_tokenizer();

    let result = t.tokenize("%");
    let expected = vec![Token::percent()];
    assert_eq!(expected, result);

    let result = t.tokenize("8 %");
    let expected = vec![n("8"), Token::percent()];
    assert_eq!(expected, result);

    let result = t.tokenize("75%");
    let expected = vec![n("75"), Token::percent()];
    assert_eq!(expected, result);

    let result = t.tokenize("99.999% sure");
    let expected = vec![n("99.999"), Token::percent(), w("sure")];
    assert_eq!(expected, result);
  }

  #[test]
  fn test_ordinals() {
    let t = make_tokenizer();

    let result = t.tokenize("1st");
    let expected = vec![o("1st")];
    assert_eq!(expected, result);

    let result = t.tokenize("The 2nd thing");
    let expected = vec![w("the"), o("2nd"), w("thing")];
    assert_eq!(expected, result);

    let result = t.tokenize("123rd?");
    let expected = vec![o("123rd"), Token::question()];
    assert_eq!(expected, result);

    let result = t.tokenize("44th.");
    let expected = vec![o("44th"), Token::period()];
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
  fn n(value: &str) -> Token {
    Token::number(value.to_string())
  }

  fn o(value: &str) -> Token {
    Token::ordinal(value.to_string())
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

