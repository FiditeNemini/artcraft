use crate::anyhow_result::AnyhowResult;
use serde::de::DeserializeOwned;
use std::fs::File;
use std::io::Read;
use std::path::Path;

/// Read a TOML file into a struct.
pub fn read_toml_file_to_struct<D, P>(filename: P) -> AnyhowResult<D>
where
    D: DeserializeOwned,
    P: AsRef<Path>,
{
  let mut file = File::open(filename)?;
  let mut buffer = String::new();
  file.read_to_string(&mut buffer)?;

  let deserialized_struct = toml::from_str(&buffer)?;
  Ok(deserialized_struct)
}

#[cfg(test)]
mod tests {
  use crate::files::read_toml_file_to_struct::read_toml_file_to_struct;
  use serde::Deserialize;
  use std::io::Write;
  use tempfile::NamedTempFile;

  #[derive(Deserialize)]
  struct TestStruct {
    name: String,
    age: u8,
  }

  #[test]
  fn deserialize_success() {
    let mut file = NamedTempFile::new().expect("temp file should work");

    writeln!(file.as_file_mut(), "name = \"Bob\"");
    writeln!(file.as_file_mut(), "age = 42");

    let deserialized : TestStruct = read_toml_file_to_struct(file.path())
        .expect("file should exist and deserialize correctly");

    assert_eq!(deserialized.name.as_str(), "Bob");
    assert_eq!(deserialized.age, 42);
  }
}