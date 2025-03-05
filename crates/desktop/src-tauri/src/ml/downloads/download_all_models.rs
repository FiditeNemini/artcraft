use crate::ml::downloads::download_model_registry_file::download_model_registry_file;
use crate::ml::model_registry::ModelRegistry;

pub async fn download_all_models() -> anyhow::Result<()> {
  download_model_registry_file(ModelRegistry::Clip).await?;

  Ok(())
}
