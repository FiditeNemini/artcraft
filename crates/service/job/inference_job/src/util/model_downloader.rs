use anyhow::anyhow;
use cloud_storage::bucket_client::BucketClient;
use container_common::filesystem::safe_delete_temp_directory::safe_delete_temp_directory;
use crate::util::scoped_temp_dir_creator::ScopedTempDirCreator;
use errors::AnyhowResult;
use filesys::create_dir_all_if_missing::create_dir_all_if_missing;
use filesys::file_exists::file_exists;
use log::{error, info};
use std::path::{Path, PathBuf};
use async_trait::async_trait;
use filesys::rename_across_devices::rename_across_devices;

// /// Implementing this implies we can return an instance constructed from environment variables.
// /// This isn't to be manually used, but rather with a macro.
// trait FromEnv {
//   fn from_env() -> Box<dyn Self>;
// }


#[async_trait]
pub trait ModelDownloader {
  //fn from_env() -> Self {
  //  // NB: For now rvc-v2 is all that uses this hubert, but other models
  //  // may (re)use it in the future.
  //  let cloud_bucket_path = easyenv::get_env_string_or_default(
  //    "RVC_V2_PRETRAINED_HUBERT_BUCKET_PATH",
  //    "/hubert_pretrained/rvc_v2_hubert_base.pt");

  //  // NB: For now rvc-v2 is all that uses this hubert, but other models
  //  // may (re)use it in the future.
  //  let filesystem_path = easyenv::get_env_pathbuf_or_default(
  //    "RVC_V2_PRETRAINED_HUBERT_FILESYSTEM_PATH",
  //    // NB: For now this path is on the shared SMB drive in GKE K8S
  //    "/tmp/downloads/hubert/rvc_v2_hubert_base.pt");

  //  Self {
  //    cloud_bucket_path,
  //    filesystem_path,
  //  }
  //}

  fn get_model_name(&self) -> &str;

  fn get_cloud_bucket_path(&self) -> &str;

  fn get_filesystem_path(&self) -> &Path;

  async fn download_if_not_on_filesystem(
    &self,
    bucket_client: &BucketClient,
    scoped_tempdir_creator: &ScopedTempDirCreator,
  ) -> AnyhowResult<()> {
    let filesystem_path = self.get_filesystem_path();

    if file_exists(filesystem_path) {
      return Ok(());
    }

    if let Some(parent_directory_path) = filesystem_path.parent() {
      create_dir_all_if_missing(parent_directory_path)?;
    }

    // NB: Download to temp directory to stop concurrent writes and race conditions from other
    // workers writing to a shared volume.
    // NB: TempDir exists until it goes out of scope, at which point it should delete from filesystem.
    let temp_dir = scoped_tempdir_creator.new_tempdir("model_download")
        .map_err(|e| anyhow!("problem creating tempdir: {:?}", e))?;

    let temp_path = temp_dir.path().join("download.part");

    let model_name = self.get_model_name();
    let cloud_bucket_path = self.get_cloud_bucket_path();

    info!("Downloading {} from bucket path: {:?}", model_name, cloud_bucket_path);

    bucket_client.download_file_to_disk(cloud_bucket_path, &temp_path)
        .await
        .map_err(|e| {
          error!("could not download {} to disk: {:?}", model_name, e);
          safe_delete_temp_directory(&temp_dir);
          anyhow!("couldn't download {} cloud object to disk: {:?}", model_name, e)
        })?;

    info!("Downloaded {} from bucket", model_name);

    info!("Renaming {} file from {:?} to {:?}!", model_name, &temp_path, filesystem_path);

    rename_across_devices(&temp_path, filesystem_path)
        .map_err(|e| {
          error!("could not rename on disk: {:?}", e);
          safe_delete_temp_directory(&temp_dir);
          anyhow!("couldn't rename disk files: {:?}", e)
        })?;

    info!("Finished downloading {} file to {:?}", model_name, filesystem_path);

    safe_delete_temp_directory(&temp_dir);

    Ok(())
  }
}

#[macro_export]
macro_rules! downloader {
  ($struct_name:ident) => {

    #[derive(Debug, Clone)]
    struct $struct_name {
      pub model_name: String,
      pub cloud_bucket_path: String,
      pub filesystem_path: std::path::PathBuf,
    }

    #[async_trait::async_trait]
    impl crate::util::model_downloader::ModelDownloader for $struct_name {
      fn get_model_name(&self) -> &str {
        &self.model_name
      }
      fn get_cloud_bucket_path(&self) -> &str {
        &self.cloud_bucket_path
      }
      fn get_filesystem_path(&self) -> &std::path::Path {
        &self.filesystem_path
      }
    }
  }
}
