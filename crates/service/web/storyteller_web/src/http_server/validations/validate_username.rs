use once_cell::sync::Lazy;
use regex::Regex;

/// Username may be up to this many characters, but not more.
pub const USERNAME_MAX_LENGTH: usize = 16;

pub fn validate_username(username: &str) -> Result<(), String> {
  static USERNAME_REGEX: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"^[A-Za-z0-9_\-]{3,16}$").expect("should be valid regex")
  });

  if username.len() < 3 {
    return Err("username is too short".to_string());
  }

  if username.len() > USERNAME_MAX_LENGTH {
    return Err("username is too long".to_string());
  }

  if !USERNAME_REGEX.is_match(username) {
    return Err("invalid username characters".to_string());
  }

  Ok(())
}

#[cfg(test)]
mod tests {
  use crate::http_server::validations::validate_username::validate_username;

  #[test]
  fn test_valid_usernames() {
    assert!(validate_username("echelon").is_ok());
    assert!(validate_username("dr_mario").is_ok());
    assert!(validate_username("Foo1234").is_ok());
    assert!(validate_username("mr-person").is_ok());
  }

  #[test]
  fn test_invalid_usernames() {
    assert!(validate_username("").is_err());
    assert!(validate_username("&&&&").is_err());
    assert!(validate_username("........").is_err());
    assert!(validate_username("really-long-username-that-is-too-long").is_err());
  }
}