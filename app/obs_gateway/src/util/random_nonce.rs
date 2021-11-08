use rand::distributions::Alphanumeric;
use rand::{thread_rng, Rng};

/// Returns a random nonce for Twitch
pub fn random_nonce(length: usize) -> String {
  thread_rng()
      .sample_iter(&Alphanumeric)
      .take(length)
      .map(char::from)
      .collect()
}

#[cfg(test)]
mod tests {
  use crate::util::random_nonce::random_nonce;

  #[test]
  fn random_nonce_length() {
    assert_eq(1, random_nonce(1).len());
    assert_eq(10, random_nonce(10).len());
    assert_eq(15, random_nonce(15).len());
    assert_eq(64, random_nonce(64).len());
  }
}