use tempdir::TempDir;

use buckets::public::weight_files::bucket_file_path::WeightFileBucketPath;
use cloud_storage::bucket_path_unifier::BucketPathUnifier;
use errors::AnyhowResult;
use mysql_queries::queries::voice_conversion::migration::list_whole_voice_conversion_models_using_cursor::WholeVoiceConversionModelRecord;

use crate::deps::Deps;

pub async fn copy_cloud_files(model: &WholeVoiceConversionModelRecord, deps: &Deps) -> AnyhowResult<WeightFileBucketPath> {
  let bucket_path = copy_model(model, deps).await?;

  if model.has_index_file {
    copy_index_file(model, deps, &bucket_path).await?;
  }

  Ok(bucket_path)
}

async fn copy_model(model: &WholeVoiceConversionModelRecord, deps: &Deps) -> AnyhowResult<WeightFileBucketPath> {
  let bucket_path_unifier = BucketPathUnifier::default_paths();

  let old_model_bucket_path = bucket_path_unifier.rvc_v2_model_path(&model.private_bucket_hash);

  // TODO(bt,2023-12-19): Probably faster to stream between buckets, but whatever.
  let temp_dir = TempDir::new("model_transfer")?;
  let model_temp_fs_path = temp_dir.path().join("model.bin");

  deps.bucket_production_private.download_file_to_disk(&old_model_bucket_path, &model_temp_fs_path).await?;

  let new_model_bucket_path = WeightFileBucketPath::generate_new(Some("model_"), Some(".bin"));

  deps.bucket_development_public.upload_filename_with_content_type(
    &new_model_bucket_path.get_full_object_path_str(),
    &model_temp_fs_path,
    "application/octet-stream").await?;

  Ok(new_model_bucket_path)
}

async fn copy_index_file(model: &WholeVoiceConversionModelRecord, deps: &Deps, bucket_path: &WeightFileBucketPath) -> AnyhowResult<WeightFileBucketPath> {
  let bucket_path_unifier = BucketPathUnifier::default_paths();

  let old_model_index_bucket_path = bucket_path_unifier.rvc_v2_model_index_path(&model.private_bucket_hash);

  // TODO(bt,2023-12-19): Probably faster to stream between buckets, but whatever.
  let temp_dir = TempDir::new("model_transfer")?;
  let model_temp_fs_path = temp_dir.path().join("model.bin");

  deps.bucket_production_private.download_file_to_disk(&old_model_index_bucket_path, &model_temp_fs_path).await?;

  let new_model_bucket_path = WeightFileBucketPath::from_object_hash(
    bucket_path.get_object_hash(),
    Some("model_"),
    Some(".index")
  );

  deps.bucket_development_public.upload_filename_with_content_type(
    &new_model_bucket_path.get_full_object_path_str(),
    &model_temp_fs_path,
    "application/octet-stream").await?;

  Ok(new_model_bucket_path)
}
