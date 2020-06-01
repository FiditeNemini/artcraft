
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum FailureReason {
  TextTooLong { actual: usize, max: usize },
  TextTooShort { actual: usize, min: usize },
  //TooManyWords { actual: usize, max: usize },
  //TooFewWords { actual: usize, min: usize },
}

pub struct TextChecker {
  max_character_length: Option<usize>,
  min_character_length: Option<usize>,
  //max_words: Option<usize>,
  //min_words: Option<usize>,
  //banned_words: Option<Vec<String>>,
}

impl FailureReason {
  pub fn description(&self) -> &'static str {
    match self {
      FailureReason::TextTooLong { .. } => "Text is too long.",
      FailureReason::TextTooShort { .. } => "Text is too short.",
    }
  }
}

impl TextChecker {
  pub fn create() -> Self {
    Self {
      max_character_length: None,
      min_character_length: None,
      //max_words: None,
      //min_words: None,
      //banned_words: None,
    }
  }

  pub fn set_max_character_length(&mut self, max_character_length: Option<usize>) {
    self.max_character_length = max_character_length;
  }

  pub fn set_min_character_length(&mut self, min_character_length: Option<usize>) {
    self.min_character_length = min_character_length;
  }

  pub fn check_text(&self, text: &str) -> Option<FailureReason> {
    let text_len = text.len();

    if let Some(max_len) = self.max_character_length {
      if text_len > max_len {
        return Some(FailureReason::TextTooLong { actual: text_len, max: max_len });
      }
    }

    if let Some(min_len) = self.min_character_length {
      if text_len < min_len {
        return Some(FailureReason::TextTooShort { actual: text_len, min: min_len });
      }
    }

    None
  }
}

#[cfg(test)]
mod tests {
  use crate::text::checker::{TextChecker, FailureReason};

  #[test]
  fn max_length() {
    let mut checker = TextChecker::create();
    checker.set_max_character_length(Some(4));

    assert_eq!(None, checker.check_text("foo"));
    assert_eq!(None, checker.check_text("food"));

    assert_eq!(Some(FailureReason::TextTooLong { actual: 5, max: 4 }),
      checker.check_text("foods"));

    checker.set_max_character_length(None);

    assert_eq!(None, checker.check_text("foods"));
  }
}
