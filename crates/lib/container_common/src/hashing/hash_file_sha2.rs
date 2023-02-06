use errors::AnyhowResult;
use data_encoding::HEXLOWER_PERMISSIVE;
use hashing::sha256::sha256_digest_buffer::sha256_digest_buffer;
use ring::digest::{Context, Digest, SHA256};
use std::fs::File;
use std::io::{Read, BufReader};

pub fn hash_file_sha2(filename: &str) -> AnyhowResult<String> {
  let input = File::open(filename)?;
  let reader = BufReader::new(input);
  let digest = sha256_digest_buffer(reader)?;

  let hash = HEXLOWER_PERMISSIVE.encode(digest.as_ref());
  Ok(hash)
}

