use crate::AnyhowResult;
use regex::Regex;

pub fn validate_discord_username(username: &str) -> Result<(), String> {
  lazy_static! {
    static ref DISCORD_USERNAME_REGEX: Regex = {
      Regex::new(r"^@?[^#@:]{2,32}#[0-9]{4}$").expect("should be valid regex")
    };
  }

  if username.len() < 2 {
    return Err("discord username is too short".to_string());
  }

  if username.len() > 40 {
    return Err("discord username is too long".to_string());
  }

  if !DISCORD_USERNAME_REGEX.is_match(username) {
    return Err("discord username invalid".to_string());
  }

  Ok(())
}

#[cfg(test)]
mod tests {
  use crate::validations::discord_username::validate_discord_username;

  #[test]
  fn valid_cases() {
    assert!(validate_discord_username("echelon#0001").is_ok());
    assert!(validate_discord_username("@echelon#0001").is_ok());
  }

  #[test]
  fn invalid_cases() {
    assert!(validate_discord_username("").is_err());
  }
}