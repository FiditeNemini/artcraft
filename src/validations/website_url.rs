use crate::AnyhowResult;
use regex::Regex;

pub fn validate_website_url(website_url: &str) -> Result<(), String> {
  lazy_static! {
    static ref WEBSITE_URL_REGEX: Regex = {
      Regex::new(r"^(https?:\/\/)?.*$").expect("should be valid regex")
    };
  }

  if website_url.len() < 3 {
    return Err("website url is too short".to_string());
  }

  if website_url.len() > 200 {
    return Err("website url is too long".to_string());
  }

  if !WEBSITE_URL_REGEX.is_match(website_url) {
    return Err("website url invalid".to_string());
  }

  Ok(())
}

#[cfg(test)]
mod tests {
  use crate::validations::website_url::validate_website_url;

  #[test]
  fn valid_cases() {
    assert!(validate_website_url("http://vo.codes").is_ok());
    assert!(validate_website_url("https://vocodes.com").is_ok());
  }

  #[test]
  fn invalid_cases() {
    assert!(validate_website_url("a").is_err());
  }
}
