use crate::AnyhowResult;
use regex::Regex;

pub fn validate_twitch_username(username: &str) -> Result<(), String> {
  lazy_static! {
    static ref TWITCH_USERNAME_REGEX: Regex = {
      Regex::new(r"^[a-zA-Z0-9]{4,25}$").expect("should be valid regex")
    };
  }

  if username.len() < 4 {
    return Err("twitch username is too short".to_string());
  }

  if username.len() > 25 {
    return Err("twitch username is too long".to_string());
  }

  if !TWITCH_USERNAME_REGEX.is_match(username) {
    return Err("twitch username invalid".to_string());
  }

  Ok(())
}

#[cfg(test)]
mod tests {
  use crate::validations::twitch_username::validate_twitch_username;

  #[test]
  fn valid_cases() {
    assert!(validate_twitch_username("echelon").is_ok());
    assert!(validate_twitch_username("1234").is_ok());
    assert!(validate_twitch_username("1234567890123456789012345").is_ok());
  }

  #[test]
  fn invalid_cases() {
    assert!(validate_twitch_username("").is_err());
    assert!(validate_twitch_username("@=[]@34!").is_err());
    assert!(validate_twitch_username("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa").is_err());
  }
}