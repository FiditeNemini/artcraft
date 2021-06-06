use crate::AnyhowResult;
use regex::Regex;


pub fn validate_twitter_username(username: &str) -> Result<(), String> {
  lazy_static! {
    static ref TWITTER_USERNAME_REGEX: Regex = {
      Regex::new(r"^[A-Za-z0-9_]{4,15}$").expect("should be valid regex")
    };
  }

  if username.len() < 4 {
    return Err("twitter username is too short".to_string());
  }

  if username.len() > 15 {
    return Err("twitter username is too long".to_string());
  }

  if !TWITTER_USERNAME_REGEX.is_match(username) {
    return Err("twitter username invalid".to_string());
  }

  Ok(())
}

#[cfg(test)]
mod tests {
  use crate::validations::twitter_username::validate_twitter_username;

  #[test]
  fn valid_cases() {
    assert!(validate_twitter_username("echelon").is_ok());
    assert!(validate_twitter_username("four").is_ok());
    assert!(validate_twitter_username("123456789012345").is_ok());
    assert!(validate_twitter_username("a_A_b_B_c_C_d_D").is_ok());
  }

  #[test]
  fn invalid_cases() {
    assert!(validate_twitter_username("").is_err());
    assert!(validate_twitter_username("    ").is_err());
    assert!(validate_twitter_username("!!!!!!!!!!!").is_err());
    assert!(validate_twitter_username("a").is_err());
    assert!(validate_twitter_username("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa").is_err());
  }
}