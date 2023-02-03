use std::path::PathBuf;

pub fn directory_exists(path: &PathBuf) -> bool {
  if !path.exists() {
    return false;
  }
  if !path.is_dir() {
    return false;
  }
  true
}
