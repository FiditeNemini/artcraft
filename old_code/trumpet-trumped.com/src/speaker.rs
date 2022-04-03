// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

use std::fmt;

/// Simply for type safety.
/// Don't do stupid things with this.
#[derive(Clone, Debug, Eq, Hash, PartialEq)]
pub struct Speaker {
  pub speaker: String,
}

impl Speaker {
  pub fn new(speaker: String) -> Speaker {
    Speaker { speaker: speaker }
  }

  pub fn as_str(&self) -> &str {
    &self.speaker
  }

  /// Don't overuse.
  pub fn to_string(&self) -> String {
    self.speaker.clone()
  }
}

impl fmt::Display for Speaker {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "{}", self.speaker)
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_speaker() {
    let alice = Speaker::new("alice".to_string());
    let bob = Speaker::new("bob".to_string());

    assert_eq!(alice, Speaker::new("alice".to_string()));
    assert_eq!(&alice, &Speaker::new("alice".to_string()));

    assert!(alice == alice);
    assert!(alice == Speaker::new("alice".to_string()));
    assert!(&alice == &alice);
    assert!(&alice == &Speaker::new("alice".to_string()));

    assert!(alice != bob);
    assert!(&alice != &bob);
  }
}

