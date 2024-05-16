use std::fs::File;
use std::path::Path;

use serde_json::Value;

use errors::AnyhowResult;

pub fn load_json<P: AsRef<Path>>(filename: P) -> AnyhowResult<Value> {
  let file = File::open(filename)?;
  let value = serde_json::from_reader(file)?;
  Ok(value)
}

#[cfg(test)]
mod tests {
  use std::path::PathBuf;

  use crate::util::comfy_workflows::load_json::load_json;

  fn test_file(path_from_repo_root: &str) -> PathBuf {
    // https://doc.rust-lang.org/cargo/reference/environment-variables.html
    let mut path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    path.push(format!("../../../../{}", path_from_repo_root));
    path
  }

  #[test]
  fn test_load_json() {
    let path = test_file("test_data/comfy_workflows/style_replacement_tests/mapping_one.json");
    let result= load_json(path);
    assert!(result.is_ok());
  }
}