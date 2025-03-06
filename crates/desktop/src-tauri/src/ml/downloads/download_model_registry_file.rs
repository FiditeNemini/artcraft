use std::fs::File;
use std::path::{Path, PathBuf};
use log::info;
use crate::ml::model_registry::ModelRegistry;

pub async fn download_model_registry_file(model_type: ModelRegistry) -> anyhow::Result<PathBuf> {
  info!("downloading model: {:?}", model_type);
  let path = PathBuf::from(model_type.get_filename());
  if path.exists() {
    info!("model already exists: {:?}", path);
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