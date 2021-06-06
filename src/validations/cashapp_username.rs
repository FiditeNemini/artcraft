use crate::AnyhowResult;
use regex::Regex;

pub fn validate_cashapp_username(username: &str) -> Result<(), String> {
  lazy_static! {
    static ref CASHAPP_USERNAME_REGEX: Regex = {
      Regex::new(r"^.{1,20}$").expect("should be valid regex")
    };
  }

  if username.len() < 1 {
    return Err("cashapp username is too short".to_string());
  }

  if username.len() > 20 {
    return Err("cashapp username is too long".to_string());
  }

  if !CASHAPP_USERNAME_REGEX.is_match(username) {
    return Err("cashapp username invalid".to_string());
  }

  Ok(())
}

#[cfg(test)]
mod tests {
  use crate::validations::cashapp_username::validate_cashapp_username;

  #[test]
  fn valid_cases() {
    assert!(validate_cashapp_username("echelon").is_ok());
    assert!(validate_cashapp_username("a").is_ok());
    assert!(validate_cashapp_username("12345678901234567890").is_ok());
  }

  #[test]
  fn invalid_cases() {
    assert!(validate_cashapp_username("").is_err());
    assert!(validate_cashapp_username("123456789012345678901").is_err());
  }
}