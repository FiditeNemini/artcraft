use std::path::Path;

use walkdir::WalkDir;

use crate::safe_delete_temp_file::safe_delete_temp_file;

pub fn safe_recursively_delete_files(path: &Path) {
  if !path.exists() || !path.is_dir() {
    return;
  }

  let walk = WalkDir::new(path);

  for entry in walk {
    if let Ok(entry) = entry {
      if entry.path().is_file() {
        safe_delete_temp_file(entry.path());
      }
    }
  }
}
