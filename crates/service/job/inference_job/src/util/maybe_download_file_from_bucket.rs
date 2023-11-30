use std::path::Path;

use log::{error, info, warn};

use cloud_storage::bucket_client::BucketClient;
use container_common::filesystem::safe_delete_temp_directory::safe_delete_temp_directory;
use filesys::file_size::file_size;
use filesys::rename_across_devices::rename_across_devices;
use jobs_common::job_progress_reporter::job_progress_reporter::JobProgressReporter;

use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::util::scoped_temp_dir_creator::ScopedTempDirCreator;

// TODO(bt, 2022-07-15): Make a concrete type for bucket paths

pub async fn maybe_download_file_from_bucket(
  name_or_description_of_file: &str,
  final_filesystem_file_path: &Path,
  bucket_object_path: &Path,
  bucket_client: &BucketClient,
  job_progress_reporter: &mut Box<dyn JobProgressReporter>,
  job_progress_update_description: &str,
  job_id: i64,
  scoped_tempdir_creator: &ScopedTempDirCreator,
  maybe_existing_file_minimum_size_required: Option<u64>,
) -> Result<(), ProcessSingleJobError> {

  if final_filesystem_file_path.exists() {
    // TODO(bt, 2022-07-15): Check signature of file as best proof of file validity
    let mut existing_file_is_valid = true;

    if let Some(existing_file_minimum_size_required) = maybe_existing_file_minimum_size_required {
      // NB: Sometimes the downloader incompletely downloads files. Typically this is a zero file
      // size, but the Rust system may report a non-zero (but small) number of bytes. This should
      // later be investigated and the heuristic simplified. The intent here is merely to make sure
      // we don't consider these okay:
      //
      //   -rw-r--r-- 1 root root 55824433 Nov 30 00:12 VM:012rkwsv91zb
      //   -rw-r--r-- 1 root root 55823149 Nov 30 00:13 VM:79etbx4fdksv
      //   -rw-r--r-- 1 root root        0 Nov 30 00:52 VM:1dzepsnwzbkc
      //   -rw-r--r-- 1 root root        0 Nov 30 00:29 VM:7c2df5a36qjb
      //
      let size = file_size(final_filesystem_file_path)
          .map_err(|err| ProcessSingleJobError::from_anyhow_error(err))?;

      info!("{name_or_description_of_file} exists at path {:?} ; file size = {size}",
        &final_filesystem_file_path);

      if size < existing_file_minimum_size_required {
        existing_file_is_valid = false;
      }
    }

    if existing_file_is_valid {
      return Ok(())
    }
  } else {
    warn!("{} does not exist at path: {:?}", name_or_description_of_file, &final_filesystem_file_path);
  }

  job_progress_reporter.log_status(job_progress_update_description)
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  // NB: Download to temp directory to stop concurrent writes and race conditions from other
  // workers writing to a shared volume.
  let temp_dir = format!("temp_download_{}", job_id);

  // NB: TempDir exists until it goes out of scope, at which point it should delete from filesystem.
  let temp_dir = scoped_tempdir_creator.new_tempdir(&temp_dir)
      .map_err(|e| ProcessSingleJobError::from_io_error(e))?;

  let temp_path = temp_dir.path().join("download.part");

  info!("Downloading {} from bucket path: {:?}", name_or_description_of_file, &bucket_object_path);

  bucket_client.download_file_to_disk(&bucket_object_path, &temp_path)
      .await
      .map_err(|e| {
        safe_delete_temp_directory(&temp_dir);
        ProcessSingleJobError::Other(e)
      })?;

  info!("Downloaded {} from bucket!", name_or_description_of_file);

  info!("Renaming {} temp file from {:?} to {:?}!",
    name_or_description_of_file, &temp_path, &final_filesystem_file_path);

  rename_across_devices(&temp_path, &final_filesystem_file_path)
      .map_err(|err| {
        error!("could not rename on disk: {:?}", err);
        safe_delete_temp_directory(&temp_dir);
        ProcessSingleJobError::from_io_error(err)
      })?;

  info!("Finished downloading {} file to {:?}", name_or_description_of_file, &final_filesystem_file_path);

  safe_delete_temp_directory(&temp_dir);

  Ok(())
}