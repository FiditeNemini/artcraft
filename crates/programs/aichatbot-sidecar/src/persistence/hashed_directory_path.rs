
// NB: this is copied from crates/_types/buckets/src/util/hashed_directory_path_short_string.rs
pub fn hashed_directory_path(file_hash: &str) -> String {
  match file_hash.len() {
    0 | 1 => "".to_string(),
    2 => format!("{}/", &file_hash[0..1]),
    3 => format!("{}/{}/", &file_hash[0..1], &file_hash[1..2]),
    _ => format!("{}/{}/{}/", &file_hash[0..1], &file_hash[1..2], &file_hash[2..3]),
  }
}
