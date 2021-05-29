use crate::buckets::bucket_paths::hash_to_bucket_path;
use std::path::PathBuf;
use crate::util::anyhow_result::AnyhowResult;

/// This is designed to make it centrally configurable where
/// different types of objects are stored.
pub struct BucketPathUnifier {
  pub user_uploaded_w2l_templates_root: PathBuf,
  pub user_uploaded_audio_for_w2l_root: PathBuf,
  pub tts_inference_output_root: PathBuf,
  pub w2l_inference_output_root: PathBuf,
  pub w2l_model_root: PathBuf,
  pub w2l_end_bump_root: PathBuf,
}

impl BucketPathUnifier {

  // TODO
  //pub fn from_env_vars() -> AnyhowResult<Self> {
  //  Ok(Self {
  //    user_uploaded_audio_for_w2l_root: ,
  //    user_uploaded_w2l_templates_root: ,
  //  })
  //}

  pub fn default_paths() -> Self {
    Self {
      user_uploaded_audio_for_w2l_root: PathBuf::from("/user_uploaded_w2l_audio"),
      user_uploaded_w2l_templates_root: PathBuf::from("/user_uploaded_w2l_templates"),
      tts_inference_output_root: PathBuf::from("/tts_inference_output"),
      w2l_inference_output_root: PathBuf::from("/w2l_inference_output"),
      w2l_model_root: PathBuf::from("/w2l_pretrained_models"),
      w2l_end_bump_root: PathBuf::from("/w2l_end_bumps"),
    }
  }

  // W2L pretrained models. There are only two.
  pub fn w2l_pretrained_models_path(&self, w2l_model_name: &str) -> PathBuf {
    self.w2l_model_root.join(w2l_model_name)
  }

  // W2L "end bumps" are videos added at the end.
  pub fn end_bump_video_for_w2l_path(&self, end_bump_filename: &str) -> PathBuf {
    self.w2l_end_bump_root.join(end_bump_filename)
  }

  // The video or images uploaded as templates
  // eg. /user_uploaded_w2l_templates/1/5/1/151a[...60]...
  pub fn media_templates_for_w2l_path(&self, template_file_hash: &str) -> PathBuf {
    let hashed_path = Self::hashed_directory_path(template_file_hash);
    self.user_uploaded_w2l_templates_root
      .join(hashed_path)
      .join(template_file_hash)
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

  // W2L inference output videos
  pub fn w2l_inference_video_output_path(&self, w2l_inference_job_token: &str) -> PathBuf {
    // NB: We don't want colons from the token in the filename.
    if w2l_inference_job_token.contains(":") {
      if let Some((token_type, token)) = w2l_inference_job_token.split_once(":") {
        let video_filename = w2l_inference_job_token.replace(":", "");
        let video_filename = format!("vocodes_video_{}.mp4", video_filename);

        let hashed_path = Self::hashed_directory_path(token);
        let hashed_path = hashed_path.to_lowercase();

        return self.w2l_inference_output_root
          .join(hashed_path)
          .join(video_filename);
      }
    }


    let video_filename = w2l_inference_job_token.replace(":", "");
    let video_filename = format!("vocodes_video_{}.mp4", video_filename);

    let hashed_path = Self::hashed_directory_path(w2l_inference_job_token);

    self.w2l_inference_output_root
      .join(hashed_path)
      .join(video_filename)
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
      user_uploaded_w2l_templates_root: PathBuf::from("/test_path_w2l_templates"),
      user_uploaded_audio_for_w2l_root: PathBuf::from("/test_path_w2l_audio"),
      tts_inference_output_root: PathBuf::from("/test_path_tts_output"),
      w2l_inference_output_root: PathBuf::from("/test_path_w2l_output"),
      w2l_model_root: PathBuf::from("/test_path_w2l_pretrained_models"),
      w2l_end_bump_root: PathBuf::from("/test_path_w2l_end_bumps"),
    }
  }

  #[test]
  fn test_w2l_pretrained_models_path() {
    let paths = get_instance();
    assert_eq!(paths.w2l_pretrained_models_path("model.pth").to_str().unwrap(),
               "/test_path_w2l_pretrained_models/model.pth");
  }

  #[test]
  fn test_end_bump_video_for_w2l_path() {
    let paths = get_instance();
    assert_eq!(paths.end_bump_video_for_w2l_path("logo.mp4").to_str().unwrap(),
               "/test_path_w2l_end_bumps/logo.mp4");
  }

  #[test]
  fn test_user_audio_for_w2l_inference_path() {
    let paths = get_instance();
    assert_eq!(paths.user_audio_for_w2l_inference_path("foobar").to_str().unwrap(),
               "/test_path_w2l_audio/f/o/o/foobar");
  }

  #[test]
  fn test_media_templates_for_w2l_path() {
    let paths = get_instance();
    assert_eq!(paths.media_templates_for_w2l_path("foobar").to_str().unwrap(),
               "/test_path_w2l_templates/f/o/o/foobar");
  }

  #[test]
  fn test_precomputed_faces_for_w2l_path() {
    let paths = get_instance();
    assert_eq!(paths.precomputed_faces_for_w2l_path("foobar").to_str().unwrap(),
               "/test_path_w2l_templates/f/o/o/foobar_detected_faces.pickle");
  }

  #[test]
  fn test_w2l_inference_video_output_path() {
    let paths = get_instance();

    // Case 1: Tokens without a "token type"
    assert_eq!(paths.w2l_inference_video_output_path("foobar").to_str().unwrap(),
               "/test_path_w2l_output/f/o/o/vocodes_video_foobar.mp4");

    // Case 2: Tokens with a "token type"
    // Note: that it removes the token type from dir path and handles the colon:
    assert_eq!(paths.w2l_inference_video_output_path("type:abcdef").to_str().unwrap(),
               "/test_path_w2l_output/a/b/c/vocodes_video_typeabcdef.mp4");

    // It also handles capitalization
    assert_eq!(paths.w2l_inference_video_output_path("TYPE:ABCDEF").to_str().unwrap(),
               "/test_path_w2l_output/a/b/c/vocodes_video_TYPEABCDEF.mp4");
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
