use crate::AnyhowResult;
use regex::Regex;

pub fn validate_username(potential_username: &str) -> Result<(), String> {
  lazy_static! {
    static ref USERNAME_REGEX: Regex = {
      Regex::new(r"^\w{3,16}$").expect("should be valid regex")
    };
  }

  if potential_username.len() < 3 {
    return Err("username is too short".to_string());
  }

  if potential_username.len() > 16 {
    return Err("username is too long".to_string());
  }

  if !USERNAME_REGEX.is_match(potential_username) {
    return Err("invalid username".to_string());
  }

  Ok(())
}