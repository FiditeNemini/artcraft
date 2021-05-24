use crate::util::anyhow_result::AnyhowResult;
use data_encoding::HEXLOWER_PERMISSIVE;
use ring::digest::{Context, Digest, SHA256};
use std::fs::File;
use std::io::{Read, BufReader};

pub fn get_file_hash(filename: &str) -> AnyhowResult<String> {
  let input = File::open(filename)?;
  let reader = BufReader::new(input);
  let digest = sha256_digest(reader)?;

  let hash = HEXLOWER_PERMISSIVE.encode(digest.as_ref());
  Ok(hash)
}

fn sha256_digest<R: Read>(mut reader: R) -> AnyhowResult<Digest> {
  let mut context = Context::new(&SHA256);
  let mut buffer = [0; 1024];

  loop {
    let count = reader.read(&mut buffer)?;
    if count == 0 {
      break;
    }
    context.update(&buffer[..count]);
  }

  Ok(context.finish())
}
