
pub fn clean_text(text: &str) -> String {
  let text = text.trim();
  let replaced = text.replace("’", "'"); // Smart quotes
  replaced
}

#[cfg(test)]
mod tests {
  use crate::text::cleaners::clean_text;

  #[test]
  fn replace_smart_quotes() {
    // Actual input from a user
    let original = "and i would’ve gotten away with it too if it weren’t for you meddling kids";
    let expected = "and i would've gotten away with it too if it weren't for you meddling kids";
    assert_eq!(expected, clean_text(original));
  }

  #[test]
  fn trim_spaces() {
    let original = "    this is text   ";
    let expected = "this is text";
    assert_eq!(expected, clean_text(original));
    let original = "\n\nthis is text\r\n\r  \n\n    \r";
    let expected = "this is text";
    assert_eq!(expected, clean_text(original));
  }
}