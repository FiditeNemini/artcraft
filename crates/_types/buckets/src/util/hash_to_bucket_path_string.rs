use crate::util::hash_to_bucket_path::hash_to_bucket_path;
use errors::AnyhowResult;
use errors::anyhow;

#[deprecated(note = "this is a messy function and should be avoided")]
pub fn hash_to_bucket_path_string(file_hash: &str,
                           optional_root_directory: Option<&str>)
  -> AnyhowResult<String>
{
  let path = hash_to_bucket_path(file_hash, optional_root_directory)?;

  let maybe_path = path.to_str().map(|s| s.to_string());

  maybe_path.ok_or(anyhow!("Path could not be converted"))
}

#[cfg(test)]
mod tests {
  use crate::util::hash_to_bucket_path_string::hash_to_bucket_path_string;

  #[test]
  fn test_bucket_without_root() {
    assert_eq!(
      hash_to_bucket_path_string("abcdefg", None).unwrap(),
      "/a/b/c/abcdefg".to_string());
  }

  #[test]
  fn test_bucket_with_root() {
    assert_eq!(
      hash_to_bucket_path_string("abcdefg", Some("/root")).unwrap(),
      "/root/a/b/c/abcdefg".to_string());
  }
}
