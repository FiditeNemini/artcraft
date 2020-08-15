use anyhow::Result as AnyhowResult;
use std::fs::File;
use std::fs;
use std::io::Read;

/// Loaded color images from the filesystem
pub struct ColorImageBytes {
  bytes: Vec<u8>,
}

impl ColorImageBytes {
  pub fn from_file(filename: &str) -> AnyhowResult<Self> {
    let mut file = File::open(filename)?;
    let metadata = fs::metadata(&filename)?;

    let mut buffer = vec![0u8; metadata.len() as usize];
    file.read(&mut buffer)?;

    Ok(Self {
      bytes: buffer,
    })
  }

  pub fn get_bytes(&self) -> &[u8] {
    &self.bytes
  }
}
