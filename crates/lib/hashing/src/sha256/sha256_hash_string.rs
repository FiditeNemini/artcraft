use crate::sha256::sha256_digest_buffer::sha256_digest_buffer;
use data_encoding::HEXLOWER_PERMISSIVE;
use errors::AnyhowResult;

pub fn hash_string_sha256(string_input: &str) -> AnyhowResult<String> {
  let digest = sha256_digest_buffer(string_input.as_bytes())?;
  let hash = HEXLOWER_PERMISSIVE.encode(digest.as_ref());
  Ok(hash)
}

#[cfg(test)]
mod tests {
  use crate::sha256::sha256_hash_string::hash_string_sha256;

  #[test]
  fn test_hash_string_sha256() {
    assert_eq!(hash_string_sha256("test").unwrap(),
               "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08");

    assert_eq!(hash_string_sha256("foo").unwrap(),
               "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae");
  }
}