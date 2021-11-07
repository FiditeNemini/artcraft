use crate::util::anyhow_result::AnyhowResult;
use crate::util::hashing::sha256_digest::sha256_digest;
use data_encoding::HEXLOWER_PERMISSIVE;
use ring::digest::{Context, Digest, SHA256};
use std::fs::File;
use std::io::{Read, BufReader};

pub fn hash_file_sha2(filename: &str) -> AnyhowResult<String> {
  let input = File::open(filename)?;
  let reader = BufReader::new(input);
  let digest = sha256_digest(reader)?;

  let hash = HEXLOWER_PERMISSIVE.encode(digest.as_ref());
  Ok(hash)
}

