use crate::anyhow_result::AnyhowResult;
use crate::hashing::sha256_digest::sha256_digest;
use data_encoding::HEXLOWER_PERMISSIVE;
use ring::digest::{Context, Digest, SHA256};
use std::fs::File;
use std::io::{Read, BufReader};

pub fn hash_string_sha2(string_input: &str) -> AnyhowResult<String> {
  let digest = sha256_digest(string_input.as_bytes())?;
  let hash = HEXLOWER_PERMISSIVE.encode(digest.as_ref());
  Ok(hash)
}
