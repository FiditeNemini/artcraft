use crate::buckets::bucket_paths::hash_to_bucket_path;
use std::path::PathBuf;

/// This is designed to make it centrally configurable where
/// different types of objects are stored.
pub struct BucketPathUnifier {
  pub user_uploaded_audio_for_w2l_root: PathBuf,
  pub user_uploaded_w2l_templates_root: PathBuf,
}

impl BucketPathUnifier {

  pub fn end_bump_video_for_w2l_path(&self, end_bump_filename: &str) -> String {
    "".to_string()
  }

  // These share the same directory as the uploaded w2l template media.
  // eg. /user_uploaded_w2l_templates/1/5/1/151a[...60]_detected_faces.pickle
  pub fn precomputed_faces_for_w2l_path(&self, template_file_hash: &str) -> PathBuf {
    let faces_filename = format!("{}_detected_faces.pickle", &template_file_hash);
    let hashed_path = Self::hashed_directory_path(template_file_hash);

    self.user_uploaded_w2l_templates_root
      .join(hashed_path)
      .join(faces_filename)
  }

  // User-uploaded audio.
  // eg. /user_uploaded_w2l_audio/0/0/b/00bcc7a4-bdf5-43a5-9603-a15ca780d866
  pub fn user_audio_for_w2l_inference_path(&self, audio_uuid: &str) -> PathBuf {
    let hashed_path = Self::hashed_directory_path(audio_uuid);
    self.user_uploaded_audio_for_w2l_root
      .join(hashed_path)
      .join(audio_uuid)
  }

  pub fn pretrained_w2l_model_path(&self, model_name: &str) -> String {
    "".to_string()
  }

  pub fn hashed_directory_path(file_hash: &str) -> String {
    match file_hash.len() {
      0 | 1=> "".to_string(),
      2 => format!("{}/", &file_hash[0..1]),
      3 => format!("{}/{}/", &file_hash[0..1], &file_hash[1..2]),
      _ => format!("{}/{}/{}/", &file_hash[0..1], &file_hash[1..2], &file_hash[2..3]),
    }
  }
}

#[cfg(test)]
mod tests {
  use crate::buckets::bucket_path_unifier::BucketPathUnifier;
  use std::path::PathBuf;

  fn get_instance() -> BucketPathUnifier {
    BucketPathUnifier {
      user_uploaded_audio_for_w2l_root: PathBuf::from("/test_path_w2l_audio"),
      user_uploaded_w2l_templates_root: PathBuf::from("/test_path_w2l_templates"),
    }
  }

  #[test]
  fn test_user_audio_for_w2l_inference_path() {
    let paths = get_instance();
    assert_eq!(paths.user_audio_for_w2l_inference_path("foobar").to_str().unwrap(),
               "/test_path_w2l_audio/f/o/o/foobar");
  }

  #[test]
  fn test_precomputed_faces_for_w2l_path() {
    let paths = get_instance();
    assert_eq!(paths.precomputed_faces_for_w2l_path("foobar").to_str().unwrap(),
               "/test_path_w2l_templates/f/o/o/foobar_detected_faces.pickle");
  }

  #[test]
  fn hashed_directory_path_length_zero() {
    assert_eq!(&BucketPathUnifier::hashed_directory_path(""), "");
  }

  #[test]
  fn hashed_directory_path_length_one() {
    assert_eq!(&BucketPathUnifier::hashed_directory_path("a"), "");
  }

  #[test]
  fn hashed_directory_path_length_two() {
    assert_eq!(&BucketPathUnifier::hashed_directory_path("ab"), "a/");
  }

  #[test]
  fn hashed_directory_path_length_three() {
    assert_eq!(&BucketPathUnifier::hashed_directory_path("abc"), "a/b/");
  }

  #[test]
  fn hashed_directory_path_length_more() {
    assert_eq!(&BucketPathUnifier::hashed_directory_path("abcd"), "a/b/c/");
    assert_eq!(&BucketPathUnifier::hashed_directory_path("abcde"), "a/b/c/");
    assert_eq!(&BucketPathUnifier::hashed_directory_path("abcdef01234"), "a/b/c/");
  }
}
