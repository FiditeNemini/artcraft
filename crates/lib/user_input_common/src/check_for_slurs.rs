use crate::BANNED_SLURS;
use once_cell::sync::Lazy;
use std::collections::HashSet;

static BANNED_SLURS_SET : Lazy<HashSet<String>> = Lazy::new(|| {
  BANNED_SLURS.lines()
      .map(|line| line.trim())
      .filter(|line| !(line.starts_with("#") || line.is_empty()))
      .map(|line| line.to_string())
      .collect::<HashSet<String>>()
});

pub fn contains_slurs(unparsed_text: &str) -> bool {
  for wordlike in unparsed_text.split_ascii_whitespace() {
    if BANNED_SLURS_SET.contains(wordlike) {
      return true;
    }
  }

  false
}

#[cfg(test)]
mod tests {
  use crate::check_for_slurs::contains_slurs;

  #[test]
  fn valid_text_passes() {
    assert_eq!(contains_slurs(""), false);
    assert_eq!(contains_slurs("this is a test."), false);
    assert_eq!(contains_slurs("this\nis\na\ntest\n\n"), false);
    assert_eq!(contains_slurs("    this    is    a       test"), false);
  }

  #[test]
  fn text_with_slurs_fails() {
    assert_eq!(contains_slurs("a sentence containing fag is banned"), true);
    assert_eq!(contains_slurs("a\nsentence\ncontaining fags\nis banned"), true);
  }
}
