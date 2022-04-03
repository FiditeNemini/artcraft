// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

use std::fmt;

/// A filled pause, ie. "umm" or "uhh".
#[derive(Clone, PartialEq)]
pub struct Filler {
  pub length: u16,
}

/// Silence.
#[derive(Clone, Debug, PartialEq)]
pub enum Pause {
  /// Representation of a comma.
  Breath,
  /// Representation of a period, exclamation, etc.
  FullStop,
  /// Representation of a dash, etc.
  HalfStop,
}

/// A word we can speak.
#[derive(Clone, PartialEq)]
pub struct Word {
  pub value: String,
}

/// A token that is ready to be handled by the synthesizer.
#[derive(Clone, PartialEq)]
pub enum SynthToken {
  Filler { value: Filler },
  Pause { value: Pause },
  Word { value: Word },
}

impl fmt::Debug for SynthToken {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    let val = match *self {
      SynthToken::Filler { value : ref v } => format!("Filler {}", v.length),
      SynthToken::Pause { value : ref v } => format!("Pause {:?}", v),
      SynthToken::Word { value : ref v } => format!("Word {}", v.value),
    };
    write!(f, "{}", val)
  }
}

impl SynthToken {
  pub fn breath() -> SynthToken {
    SynthToken::Pause { value: Pause::Breath }
  }

  pub fn filler(length: usize) -> SynthToken {
    SynthToken::Filler { value: Filler { length: length as u16 } }
  }

  pub fn full_stop() -> SynthToken {
    SynthToken::Pause { value: Pause::FullStop }
  }

  pub fn half_stop() -> SynthToken {
    SynthToken::Pause { value: Pause::HalfStop }
  }

  pub fn word(value: String) -> SynthToken {
    SynthToken::Word { value: Word { value: value } }
  }
}

