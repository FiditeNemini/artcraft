use crate::AnyhowResult;
use regex::Regex;

pub fn validate_username(username: &str) -> Result<(), String> {
  lazy_static! {
    static ref USERNAME_REGEX: Regex = {
      Regex::new(r"^[A-Za-z0-9]{3,16}$").expect("should be valid regex")
    };
  }

  if username.len() < 3 {
    return Err("username is too short".to_string());
  }

  if username.len() > 16 {
    return Err("username is too long".to_string());
  }

  if !USERNAME_REGEX.is_match(username) {
    return Err("invalid username".to_string());
  }

  Ok(())
}

/*pub fn validate_display_name(display_name: &str) -> Result<(), String> {
  lazy_static! {
    static ref DISPLAY_NAME_REGEX: Regex = {
      Regex::new(r"^\w{3,16}$").expect("should be valid regex")
    };
  }

  if username.len() < 3 {
    return Err("display name is too short".to_string());
  }

  if username.len() > 16 {
    return Err("display name is too long".to_string());
  }

  if !DISPLAY_NAME_REGEX.is_match(username) {
    return Err("invalid display name".to_string());
  }

  Ok(())
}*/
