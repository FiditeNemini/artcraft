use errors::AnyhowResult;
use errors::bail;
use std::path::PathBuf;

#[deprecated(note = "this is a messy function and should be avoided")]
pub (crate) fn hash_to_bucket_path(file_hash: &str,
                           optional_root_directory: Option<&str>)
  -> AnyhowResult<PathBuf>
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

  Ok(root_directory.join(file_path))
}

#[cfg(test)]
mod tests {
  use crate::util::hash_to_bucket_path::hash_to_bucket_path;
  use std::path::PathBuf;

  #[test]
  fn test_bucket_without_root() {
    assert_eq!(
      hash_to_bucket_path("abcdefg", None).unwrap(),
      PathBuf::from("/a/b/c/abcdefg"));
  }

  #[test]
  fn test_bucket_with_root() {
    assert_eq!(
      hash_to_bucket_path("abcdefg", Some("/root")).unwrap(),
      PathBuf::from("/root/a/b/c/abcdefg"));
  }
}
