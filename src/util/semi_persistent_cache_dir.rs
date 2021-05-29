use std::path::{PathBuf, Path};
use std::fs;
use crate::util::anyhow_result::AnyhowResult;
use tempdir::TempDir;

/// These are for files on the worker filesystems
pub struct SemiPersistentCacheDir {
  cache_root: PathBuf,
  tts_model_root: PathBuf,
  w2l_model_root: PathBuf,
  w2l_face_templates_root: PathBuf,
  w2l_templates_media_root: PathBuf,
  video_asset_root: PathBuf, // end bump, etc.
}

impl SemiPersistentCacheDir {


  /// Everything is rooted at `/file_cache`.
  pub fn default_paths() -> Self {
    // NB: This is the root of the filesystem
    Self::configured_root("/file_cache/")
  }

  pub fn configured_root(root_path: &str) -> Self {
    let cache_root = PathBuf::from(root_path);
    Self {
      cache_root: cache_root.clone(),
      tts_model_root: cache_root.join("tts/models/"),
      w2l_model_root: cache_root.join("w2l/models/"),
      w2l_face_templates_root: cache_root.join("w2l/face_templates/"),
      w2l_templates_media_root: cache_root.join("w2l/template_media/"),
      video_asset_root: cache_root.join("static_video_assets/"),
    }
  }

  // ==================== TTS MODELS ====================

  /// We cache TTS models here.
  /// We'll likely need to LRU cache them.
  pub fn tts_model_path(&self) -> &Path {
    &self.tts_model_root
  }

  // ==================== W2L MODELS (there are only two of them) ====================

  /// There are only two pretrained W2L models, so we won't run out of space.
  pub fn w2l_model_path(&self, model_filename: &str) -> PathBuf {
    self.w2l_model_root.join(model_filename)
  }

  pub fn w2l_model_directory(&self) -> &Path {
    &self.w2l_model_root
  }

  pub fn create_w2l_model_path(&self) -> AnyhowResult<()> {
    let _ = fs::create_dir_all(self.w2l_model_directory())?;
    Ok(())
  }

  // ==================== W2L MEDIA ====================

  /// We cache W2L media here.
  /// We'll likely need to LRU cache them.
  pub fn w2l_template_media_path(&self, template_private_bucket_hash: &str) -> PathBuf {
    self.w2l_templates_media_root.join(template_private_bucket_hash)
  }

  pub fn w2l_template_media_directory(&self) -> &Path {
    &self.w2l_templates_media_root
  }

  pub fn create_w2l_template_media_path(&self) -> AnyhowResult<()> {
    let _ = fs::create_dir_all(self.w2l_template_media_directory())?;
    Ok(())
  }

  // ==================== W2L CACHED FACES ====================

  /// We cache W2L faces here.
  /// We'll likely need to LRU cache them.
  pub fn w2l_face_template_path(&self, template_private_bucket_hash: &str) -> PathBuf {
    let filename = format!("{}_detected_faces.pickle", template_private_bucket_hash);
    self.w2l_face_templates_root.join(filename)
  }

  pub fn w2l_face_template_directory(&self) -> &Path {
    &self.w2l_face_templates_root
  }

  pub fn create_w2l_face_template_path(&self) -> AnyhowResult<()> {
    let _ = fs::create_dir_all(self.w2l_face_template_directory())?;
    Ok(())
  }

  // ==================== VIDEO ASSETS (End bump, etc) ====================

  /// There is only a single end bump, and we'll add a watermark file.
  pub fn video_asset_path(&self) -> &Path {
    &self.video_asset_root
  }

  pub fn create_video_asset_path(&self) -> AnyhowResult<()> {
    let _ = fs::create_dir_all(self.video_asset_path())?;
    Ok(())
  }

  // ==================== W2L OUTPUT RESULTS ====================

  // We cache W2L faces here.
  // We'll likely need to LRU cache them.
  //pub fn w2l_output_results_path(&self, temp_dir: &TempDir, inference_job_token: &str) -> PathBuf {
  //  // NB: We don't want colons from the token in the filename.
  //  let filename = inference_job_token.replace(":", "");
  //  let filename = format!("{}_result.mp4", filename);

  //  temp_dir.path().join(&filename)
  //}
}

//#[cfg(test)]
//mod tests {
//  use crate::util::semi_persistent_cache_dir::SemiPersistentCacheDir;
//  use tempdir::TempDir;
//
//  #[test]
//  fn test_w2l_output_results_path() {
//    let dirs = SemiPersistentCacheDir::default_paths();
//    let temp_dir = TempDir::new("test").unwrap();
//
//    let filename = dirs.w2l_output_results_path(&temp_dir, "TYPE:TOKEN")
//      .to_str()
//      .map(|s| s.to_string())
//      .unwrap();
//
//    assert!(&filename.ends_with("TYPETOKEN_result.mp4"));
//  }
//}
//