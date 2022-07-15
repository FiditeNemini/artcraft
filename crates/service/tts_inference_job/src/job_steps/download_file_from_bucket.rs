use std::path::Path;
use log::{info, warn};
use tempdir::TempDir;
use jobs_common::redis_job_status_logger::RedisJobStatusLogger;
use storage_buckets_common::bucket_client::BucketClient;
use crate::ProcessSingleJobError;

// TODO(bt, 2022-07-15): Make a concrete type for bucket paths

pub async fn maybe_download_file_from_bucket(
  name_or_description_of_file: &str,
  file_path: &Path,
  bucket_object_path: &Path,
  bucket_client: &BucketClient,
  redis_logger: &mut RedisJobStatusLogger<'_>,
  redis_status_update_description: &str,
  job_id: i64,
) -> Result<(), ProcessSingleJobError> {

  if file_path.exists() {
    // TODO(bt, 2022-07-15): Check signature of file
    return Ok(())
  }

  warn!("{} does not exist at path: {:?}", name_or_description_of_file, &file_path);

  redis_logger.log_status(redis_status_update_description)
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  // NB: Download to temp directory to stop concurrent writes and race conditions from other
  // workers writing to a shared volume.
  let temp_dir = format!("temp_download_{}", job_id);

  // NB: TempDir exists until it goes out of scope, at which point it should delete from filesystem.
  let temp_dir = TempDir::new(&temp_dir)
      .map_err(|e| ProcessSingleJobError::from_io_error(e))?;

  let temp_path = temp_dir.path().join("download.part");

  info!("Downloading {} from bucket path: {:?}", name_or_description_of_file, &bucket_object_path);

  bucket_client.download_file_to_disk(&bucket_object_path, &temp_path)
      .await
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  info!("Downloaded {} from bucket!", name_or_description_of_file);

  info!("Renaming {} temp file from {:?} to {:?}!",
    name_or_description_of_file, &temp_path, &file_path);

  std::fs::rename(&temp_path, &file_path)
      .map_err(|e| ProcessSingleJobError::from_io_error(e))?;

  info!("Finished downloading {} file to {:?}", name_or_description_of_file, &file_path);

  Ok(())
}