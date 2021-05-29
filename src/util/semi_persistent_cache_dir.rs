use std::path::{PathBuf, Path};
use std::fs;
use crate::util::anyhow_result::AnyhowResult;

/// These are for files on the worker filesystems
pub struct SemiPersistentCacheDir {
  cache_root: PathBuf,
  tts_model_root: PathBuf,
  w2l_model_root: PathBuf,
  w2l_face_templates_root: PathBuf,
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
      video_asset_root: cache_root.join("static_video_assets/"),
    }
  }

  /// We cache TTS models here.
  pub fn tts_model_path(&self) -> &Path {
    &self.tts_model_root
  }

  /// We cache W2L models here.
  pub fn w2l_model_path(&self) -> &Path {
    &self.w2l_model_root
  }

  /// Face templates go here.
  pub fn w2l_face_templates_path(&self) -> &Path {
    &self.w2l_face_templates_root
  }

  /// End bump, etc.
  pub fn video_asset_path(&self) -> &Path {
    &self.video_asset_root
  }

  pub fn create_w2l_model_path(&self) -> AnyhowResult<()> {
    let _ = fs::create_dir_all(self.w2l_model_path())?;
    Ok(())
  }

  pub fn create_w2l_face_templates_path(&self) -> AnyhowResult<()> {
    let _ = fs::create_dir_all(self.w2l_face_templates_path())?;
    Ok(())
  }

  pub fn create_video_asset_path(&self) -> AnyhowResult<()> {
    let _ = fs::create_dir_all(self.video_asset_path())?;
    Ok(())
  }
}
