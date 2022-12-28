use anyhow::anyhow;
use anyhow::bail;
use container_common::anyhow_result::AnyhowResult;
use std::path::PathBuf;

pub fn hash_to_bucket_path(file_hash: &str,
                           optional_root_directory: Option<&str>)
  -> AnyhowResult<String>
{
  if file_hash.len() < 4 {
    bail!("File length is too short");
  }

  let root_directory = optional_root_directory
    .map(|root| PathBuf::from(root.to_string()))
    .unwrap_or(PathBuf::from("/"));

  let file_path = format!(
    "{}/{}/{}/{}",
    &file_hash[0..1],
    &file_hash[1..2],
    &file_hash[2..3],
    &file_hash,
  );

  let maybe_path = root_directory
    .join(file_path)
    .to_str()
    .map(|s| s.to_string());

  maybe_path.ok_or(anyhow!("Path could not be converted"))
}

#[cfg(test)]
mod tests {
  use crate::bucket_paths::hash_to_bucket_path;

  #[test]
  fn test_bucket_without_root() {
    assert_eq!(
      hash_to_bucket_path("abcdefg", None).unwrap(),
      "/a/b/c/abcdefg".to_string());
  }

  #[test]
  fn test_bucket_with_root() {
    assert_eq!(
      hash_to_bucket_path("abcdefg", Some("/root")).unwrap(),
      "/root/a/b/c/abcdefg".to_string());
  }
}
