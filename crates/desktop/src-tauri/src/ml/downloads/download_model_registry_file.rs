use std::fs::File;
use std::path::{Path, PathBuf};
use crate::ml::model_registry::ModelRegistry;

pub async fn download_model_registry_file(model_type: ModelRegistry) -> anyhow::Result<PathBuf> {
  let path = PathBuf::from(model_type.get_filename());
  if path.exists() {
    return Ok(path);
  }

  let body = reqwest::get(model_type.get_download_url())
    .await?
    .bytes()
    .await?;
  
  let _file = File::create(&path)?;
  
  std::fs::write(&path, body.as_ref())?;
  
  Ok(path)
}