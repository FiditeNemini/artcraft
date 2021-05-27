use std::collections::HashSet;
use crate::RESERVED_SUBSTRINGS;
use crate::RESERVED_USERNAMES;

pub fn is_reserved_username(username: &str) -> bool {
  lazy_static! {
    static ref RESERVED_USERNAMES_SET : HashSet<String> = RESERVED_USERNAMES.lines()
      .map(|line| line.trim())
      .filter(|line| !(line.starts_with("#") || line.is_empty()))
      .map(|line| line.to_string())
      .collect::<HashSet<String>>();
  }

  if RESERVED_USERNAMES_SET.contains(username) {
    return true;
  }

  is_reserved_substring(username)
}

fn is_reserved_substring(username: &str) -> bool {
  lazy_static! {
    static ref RESERVED_SUBSTRINGS_LIST : Vec<String> = RESERVED_SUBSTRINGS.lines()
      .map(|line| line.trim())
      .filter(|line| !(line.starts_with("#") || line.is_empty()))
      .map(|line| line.to_string())
      .collect::<Vec<String>>();
  }

  for substr in RESERVED_SUBSTRINGS_LIST.iter() {
    if username.contains(substr) {
      return true;
    }
  }

  return false;
}

#[cfg(test)]
mod tests {
  use crate::validations::username_reservations::{is_reserved_username};

  #[test]
  fn reserved_usernames() {
    assert_eq!(is_reserved_username("vocodes"), true);
    assert_eq!(is_reserved_username("user"), true);
    assert_eq!(is_reserved_username("username"), true);
  }

  #[test]
  fn unreserved_usernames() {
    assert_eq!(is_reserved_username("echelon"), false);
    assert_eq!(is_reserved_username("asdfasdfadsf"), false);
    assert_eq!(is_reserved_username("bobdole11"), false);
  }

  #[test]
  fn reserved_substrings() {
    assert_eq!(is_reserved_username("test112345"), true);
    assert_eq!(is_reserved_username("12345test"), true);
    assert_eq!(is_reserved_username("test"), true);
    assert_eq!(is_reserved_username("111vocodes111"), true);
  }
}