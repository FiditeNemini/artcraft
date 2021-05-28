use rand::Rng;
use anyhow::anyhow;
use crate::util::anyhow_result::AnyhowResult;

// Crockford characters
const CROCKFORD_CHARSET: &[u8] = b"0123456789ABCDEFGHJKMNPQRSTVWXYZ";

// Random part can't be any less than this.
const MIN_ENTROPY_LENGTH : usize = 8;

pub fn random_prefix_crockford_token(prefix: &str, length: usize) -> AnyhowResult<String> {
  let mut prefix = prefix.trim().to_string();

  if prefix.is_empty() {
    return Err(anyhow!("prefix not set; use other crockford functions"));
  }

  if !prefix.ends_with(":") {
    prefix = format!("{}:", prefix);
  }

  let entropy_length : usize = length.saturating_sub(prefix.len());

  if entropy_length < MIN_ENTROPY_LENGTH {
    return Err(anyhow!("not enough entropy in token"));
  }

  let mut rng = rand::thread_rng();

  let entropy_part: String = (0..entropy_length)
    .map(|_| {
      let idx = rng.gen_range(0..CROCKFORD_CHARSET.len());
      CROCKFORD_CHARSET[idx] as char
    })
    .collect();

  let token = format!("{}{}", prefix, entropy_part);
  Ok(token)
}

#[cfg(test)]
mod tests {
  use crate::util::random_prefix_crockford_token::random_prefix_crockford_token;

  #[test]
  fn no_prefix_error() {
    assert!(random_prefix_crockford_token("", 0).is_err());
    assert!(random_prefix_crockford_token("", 10).is_err());
    assert!(random_prefix_crockford_token("", 32).is_err());
  }

  #[test]
  fn not_enough_entropy_error() {
    assert!(random_prefix_crockford_token("foo", 0).is_err());
    assert!(random_prefix_crockford_token("foo", 5).is_err());
    assert!(random_prefix_crockford_token("foo", 11).is_err());
    assert!(random_prefix_crockford_token("foo:", 11).is_err());
  }

  #[test]
  fn starts_with() {
    assert!(random_prefix_crockford_token("w", 10).unwrap().starts_with("w:"));
    assert!(random_prefix_crockford_token("w", 10).unwrap().starts_with("w:"));
    assert!(random_prefix_crockford_token("prefix", 16).unwrap().starts_with("prefix:"));
    assert!(random_prefix_crockford_token("prefix:", 16).unwrap().starts_with("prefix:"));
  }

  #[test]
  fn length() {
    assert_eq!(random_prefix_crockford_token("w", 10).unwrap().len(), 10);
    assert_eq!(random_prefix_crockford_token("w:", 10).unwrap().len(), 10);
    assert_eq!(random_prefix_crockford_token("prefix", 16).unwrap().len(), 16);
    assert_eq!(random_prefix_crockford_token("prefix:", 16).unwrap().len(), 16);
    assert_eq!(random_prefix_crockford_token("asdf:", 32).unwrap().len(), 32);
    assert_eq!(random_prefix_crockford_token("asdf", 32).unwrap().len(), 32);
  }
}
