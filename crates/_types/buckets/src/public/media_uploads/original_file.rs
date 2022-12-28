use crate::public::media_uploads::directory::MediaUploadDirectory;
use crate::public::public_path::PublicPath;

const ORIGINAL_FILE_BASENAME : &'static str = "original_contents.bin";

/// The original user upload file.
/// It may have derivative files (down samples, crops, etc.) that live alongside it.
#[derive(Clone)]
pub struct MediaUploadOriginalFilePath {
  directory: MediaUploadDirectory,
  full_object_path: String,
}

impl PublicPath for MediaUploadOriginalFilePath {}

impl MediaUploadOriginalFilePath {

  pub fn from_object_hash(hash: &str) -> Self {
    // TODO: Path construction could be cleaner.
    let directory = MediaUploadDirectory::from_object_hash(hash);
    let full_object_path = format!("{}/{}", directory.get_directory_path_str(), ORIGINAL_FILE_BASENAME);
    Self {
      directory,
      full_object_path,
    }
  }

  pub fn get_basename() -> &'static str {
    ORIGINAL_FILE_BASENAME
  }

  pub fn get_full_object_path_str(&self) -> &str {
    &self.full_object_path
  }
}

#[cfg(test)]
mod tests {
  use crate::public::media_uploads::original_file::MediaUploadOriginalFilePath;

  #[test]
  pub fn get_full_object_path_str() {
    let file = MediaUploadOriginalFilePath::from_object_hash("abcdefghijk");
    assert_eq!(file.get_full_object_path_str(), "/media/a/b/c/d/e/abcdefghijk/original_contents.bin");
  }

  #[test]
  pub fn get_full_object_path_str_short_name() {
    let file = MediaUploadOriginalFilePath::from_object_hash("foo");
    assert_eq!(file.get_full_object_path_str(), "/media/f/o/foo/original_contents.bin");
  }
}
