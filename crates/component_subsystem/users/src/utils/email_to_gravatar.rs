use md5::{Md5, Digest};

pub fn email_to_gravatar(email_address: &str) -> String {
  let email = email_address.trim().to_lowercase();

  let mut hasher = Md5::new();
  hasher.update(email);
  let hash = hasher.finalize();
  let gravatar_hash = format!("{:x}", hash);

  gravatar_hash
}

#[cfg(test)]
pub mod tests {
  use crate::utils::email_to_gravatar::email_to_gravatar;

  #[test]
  fn test_gravatar() {
    // Email 1
    assert_eq!(email_to_gravatar("example@example.com"), "".to_string());
    assert_eq!(email_to_gravatar("EXAMPLE@EXAMPLE.COM"), "".to_string());
    assert_eq!(email_to_gravatar("  example@example.com \n "), "".to_string());

    // Email 2
    assert_eq!(email_to_gravatar("echelon@gmail.com"), "".to_string());
    assert_eq!(email_to_gravatar("ECHELON@GMAIL.COM"), "".to_string());
    assert_eq!(email_to_gravatar("  ECHELON@GMAIL.COM  "), "".to_string());

    // Misc
    assert_eq!(email_to_gravatar(""), "".to_string());
    assert_eq!(email_to_gravatar("   "), "".to_string());
  }
}