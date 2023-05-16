use container_common::collections::multiple_random_from_vec::multiple_random_from_vec;
use errors::AnyhowResult;
use log::warn;
use jobs_common::semi_persistent_cache_dir::SemiPersistentCacheDir;

pub fn clear_full_filesystem(cache_dir: &SemiPersistentCacheDir) -> AnyhowResult<()> {
  warn!("Deleting cached VC models to free up disk space.");

  let model_dir = cache_dir.voice_conversion_model_directory();

  // TODO: When this is no longer sufficient, delete other types of locally-cached data.
  let paths = std::fs::read_dir(model_dir)?
      .map(|res| res.map(|e| e.path()))
      .collect::<Result<Vec<_>, std::io::Error>>()?;

  let quarter = paths.len() / 4;

  let models_to_delete = multiple_random_from_vec(&paths, quarter);

  for model_to_delete in models_to_delete {
    warn!("Deleting cached model file: {:?}", model_to_delete);

    let full_model_path = cache_dir.voice_conversion_model_path(model_to_delete);
    std::fs::remove_file(full_model_path)?;
  }

  Ok(())
}
