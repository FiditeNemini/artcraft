use std::path::PathBuf;

pub fn file_exists(path: &PathBuf) -> bool {
  if !path.exists() {
    return false;
  }
  if !path.is_file() {
    return false;
  }
  true
}

