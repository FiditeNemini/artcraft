
/// This is designed to make it centrally configurable where
/// different types of objects are stored.
pub struct BucketPathUnifier {

}

impl BucketPathUnifier {

  pub fn user_audio_for_w2l_inference_path(audio_token: &str) -> String {
    "".to_string()
  }

  pub fn end_bump_video_for_w2l_path(end_bump_filename: &str) -> String {
    "".to_string()
  }

  pub fn precomputed_faces_for_w2l_path(token: &str) -> String {
    "".to_string()
  }

  pub fn pretrained_w2l_model_path(model_name: &str) -> String {
    "".to_string()
  }
}