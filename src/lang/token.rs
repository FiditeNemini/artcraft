// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

// Enum variants as types are not supported in Rust, thus I have made
// inner typed structs.
// See https://www.reddit.com/r/rust/comments/2rdoxx/enum_variants_as_types/

use std::fmt;

#[derive(Clone, PartialEq)]
pub struct DictionaryWord {
  pub value: String,
}

#[derive(Clone, PartialEq)]
pub struct Date {
  pub value: String,
}

#[derive(Clone, Debug, PartialEq)]
pub enum Punctuation {
  Comma,
  Dash,
  Ellipsis,
  Exclamation,
  Period,
  Question,
  Semicolon,
}

#[derive(Clone, Debug, PartialEq)]
pub enum Symbol {
  Ampersand,
  AtSign,
  GreaterThan,
  LessThan,
  Percent,
}

#[derive(Clone, PartialEq)]
pub struct Hashtag {
  pub value: String,
}

#[derive(Clone, PartialEq)]
pub struct Number {
  pub value: String,
}

#[derive(Clone, PartialEq)]
pub struct Mention {
  pub value: String,
}

#[derive(Clone, PartialEq)]
pub struct Emoji {
  pub value: String,
}

/// An initialism is distinct from an abbreviation in this system.
/// Initialisms are said letter by letter, whereas an abbreviation gets
/// mapped to a list of words.
#[derive(Clone, PartialEq)]
pub struct Abbreviation {
  pub value: String,
}

/// An initialism is distinct from an abbreviation in this system.
/// Initialisms are said letter by letter, whereas an abbreviation gets
/// mapped to a list of words.
#[derive(Clone, PartialEq)]
pub struct Initialism {
  pub value: String,
}

#[derive(Clone, PartialEq)]
pub struct Url {
  pub value: String,
}

#[derive(Clone, PartialEq)]
pub struct Unknown {
  pub value: String,
}

#[derive(Clone, PartialEq)]
pub enum Token {
  Abbreviation { value: Abbreviation },
  Date { value: Date },
  DictionaryWord { value: DictionaryWord }, // The primary type.
  Emoji { value: Emoji },
  Hashtag { value: Hashtag },
  Initialism { value: Initialism },
  Mention { value: Mention },
  Number { value: Number },
  Punctuation { value: Punctuation },
  Symbol { value: Symbol },
  Unknown { value: Unknown }, // The unclassified type.
  Url { value: Url },
}

impl fmt::Debug for Token {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    let val = match *self {
      Token::Abbreviation { value : ref v } => format!("Abbreviation {}", v.value),
      Token::Date { value : ref v } => format!("Date {}", v.value),
      Token::DictionaryWord { value : ref v } => format!("Word {}", v.value),
      Token::Emoji { value : ref v } => format!("Emoji {}", v.value),
      Token::Hashtag { value : ref v } => format!("Hashtag {}", v.value),
      Token::Initialism { value : ref v } => format!("Initialism {}", v.value),
      Token::Mention { value : ref v } => format!("Mention {}", v.value),
      Token::Number { value : ref v } => format!("Number {}", v.value),
      Token::Punctuation { value : ref v } => format!("Punctuation {:?}", v),
      Token::Symbol { value : ref v } => format!("Symbol {:?}", v),
      Token::Unknown { value : ref v } => format!("Unknown {}", v.value),
      Token::Url { value : ref v } => format!("Url {}", v.value),
    };
    write!(f, "{}", val)
  }
}

impl Token {
  pub fn as_unknown<'a>(&'a self) -> Option<&'a Unknown> {
    match *self {
      Token::Unknown { ref value } => Some(&value),
      _ => None,
    }
  }

  pub fn dictionary_word(value: String) -> Token {
    Token::DictionaryWord { value: DictionaryWord { value: value } }
  }

  pub fn date(value: String) -> Token {
    Token::Date { value: Date { value: value } }
  }

  pub fn url(value: String) -> Token {
    Token::Url { value: Url { value: value } }
  }

  pub fn number(value: String) -> Token {
    Token::Number { value: Number { value: value } }
  }

  pub fn abbreviation(value: String) -> Token {
    Token::Abbreviation { value: Abbreviation { value: value } }
  }

  pub fn initialism(value: String) -> Token {
    Token::Initialism { value: Initialism { value: value } }
  }

  pub fn emoji(value: String) -> Token {
    Token::Emoji { value: Emoji { value: value } }
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

  pub fn dash() -> Token {
    Token::Punctuation { value: Punctuation::Dash }
  }

  pub fn question() -> Token {
    Token::Punctuation { value: Punctuation::Question }
  }

  pub fn semicolon() -> Token {
    Token::Punctuation { value: Punctuation::Semicolon }
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

  pub fn percent() -> Token {
    Token::Symbol { value: Symbol::Percent }
  }

  pub fn less_than() -> Token {
    Token::Symbol { value: Symbol::LessThan }
  }

  pub fn greater_than() -> Token {
    Token::Symbol { value: Symbol::GreaterThan }
  }
}

