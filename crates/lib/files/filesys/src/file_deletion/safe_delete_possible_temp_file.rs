use std::path::Path;

use crate::file_deletion::safe_delete_temp_file::safe_delete_temp_file;

pub fn safe_delete_possible_temp_file<P: AsRef<Path>>(maybe_file_path: Option<P>) {
  if let Some(file_path) = maybe_file_path {
    safe_delete_temp_file(file_path)
  }
}
