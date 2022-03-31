use anyhow::Result as AnyhowResult;
use std::fs::File;
use std::io::Read;

pub fn read_file_string_contents(filename: &str) -> AnyhowResult<String> {
  let mut file = File::open(filename)?;
  let mut contents = String::new();
  file.read_to_string(&mut contents)?;
  Ok(contents)
}
