
const MAX_TEXT_LENGTH: usize = 255;

pub fn clean_text(text: &str) -> String {
  let text = text.trim();
  let mut replaced = text.replace("’", "'"); // Smart quotes

  if contains_slurs(text) {
    replaced = "you should not say something hateful like that".to_string();
  }

  // TODO HACK - I RAN OUT OF TIME TO PUT THIS ANYWHERE ELSE

  replaced
}

pub fn contains_slurs(text: &str) -> bool {
  let test_text = text.to_lowercase();
  if test_text.contains("nigger") {
    return true;
  }
  if test_text.contains("wetback") {
    return true;
  }
  if test_text.contains("spick") {
    return true;
  }
  if test_text.contains("chink") {
    return true;
  }
  if test_text.contains("ching-chong") {
    return true;
  }
  if test_text.contains("ching chong") {
    return true;
  }
  false
}

pub fn is_text_too_long(text: &str) -> bool {
  text.len() > MAX_TEXT_LENGTH
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