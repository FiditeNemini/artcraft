

use crate::remote_file_manager::file_directory::FileBucketDirectory;
use crate::remote_file_manager::remote_cloud_bucket_details::RemoteCloudBucketDetails;

use super::bucket_orchestration;
use super::file_descriptor::{FileDescriptor, self};
use super::file_meta_data::FileMetaData;

use std::time::Duration;
use buckets::public::{public_path, self};
use errors:: AnyhowResult;

use filesys::file_read_bytes::file_read_bytes;
use filesys::file_size::file_size;
use filesys::path_to_string::path_to_string;
use hashing::sha256::sha256_hash_file::sha256_hash_file;

use mimetypes::mimetype_for_bytes::get_mimetype_for_bytes;
use mimetypes::mimetype_for_file::{get_mimetype_for_file, self};


use log::info;
use storyteller_root::get_seed_tool_data_root;
use std::path::Path;

use bucket_orchestration::BucketOrchestration;
struct RemoteCloudFileClient {
    bucket_orchestration_client: BucketOrchestration
}

impl RemoteCloudFileClient {
    pub fn new(bucket_orchestration_client: BucketOrchestration) -> Self {
        Self {
            bucket_orchestration_client: bucket_orchestration_client
        }
    }

    pub async fn download_file(&self, remote_cloud_bucket_details:RemoteCloudBucketDetails, to_system_file_path:String) -> AnyhowResult<()> {
        let file_descriptor = remote_cloud_bucket_details.file_descriptor_from_bucket_details();
        let file_bucket_directory = FileBucketDirectory::from_existing_bucket_details(remote_cloud_bucket_details);
        let full_remote_cloud_file_path = file_bucket_directory.get_full_remote_cloud_file_path().to_string();
        let is_public = file_descriptor.is_public().clone();

        self.bucket_orchestration_client.download_file_to_disk(full_remote_cloud_file_path, to_system_file_path, is_public).await?;
        Ok(())
    }

    // return error or success with meta data.
    pub async fn upload_file(&self, file_descriptor:Box<dyn FileDescriptor>, from_system_file_path:&str) -> AnyhowResult<FileMetaData> {
     
        // get file meta data
        println!("Reading media file: {:?}", from_system_file_path);
        // get meta data 
        let bytes = file_read_bytes(from_system_file_path)?;
        let result = Self::get_file_meta_data(from_system_file_path)?;
        let is_public = file_descriptor.is_public();

        let directory = FileBucketDirectory::generate_new(
            file_descriptor
        );

        println!("Uploading media file to bucket path: {:?}",directory.get_remote_cloud_base_directory());

        self.bucket_orchestration_client.upload_file_with_content_type_process(
            &directory.get_remote_cloud_base_directory(),
            bytes.as_ref(),
            result.mimetype.as_ref(),
            is_public
        ).await?;

        Ok(result)
    }

    // Retrieve the metadata from the file
    fn get_file_meta_data(system_file_path:&str) -> AnyhowResult<FileMetaData> {
        let file_size_bytes = file_size(system_file_path.clone())?;
        let sha256_checksum = sha256_hash_file(system_file_path.clone())?;

        let bytes = file_read_bytes(system_file_path)?;
        let mimetype: &str = get_mimetype_for_bytes(&bytes).unwrap_or("application/octet-stream");

        Ok(FileMetaData {
            file_size_bytes: file_size_bytes,
            sha256_checksum: sha256_checksum,
            mimetype: mimetype.to_string()
        })
    }
}

#[cfg(test)]
mod tests {
    use env_logger;
    use crate::remote_file_manager::weights_descriptor::{WeightsLoRADescriptor, WeightsSD15Descriptor, WeightsSDXLDescriptor};
    #[tokio::test]

    async fn remote_file_manager_descriptor_test() {
        use super::*;
        let remote_cloud_bucket_details = RemoteCloudBucketDetails::new("object_hash".to_string(), "loRA".to_string(), "safetensors".to_string());
        let file_descriptor = remote_cloud_bucket_details.file_descriptor_from_bucket_details();
        
        assert_eq!(file_descriptor.get_prefix(), "loRA");
        assert_eq!(file_descriptor.get_suffix(), "safetensors");
        assert_eq!(file_descriptor.is_public(), false);
    }
    #[tokio::test]
    async fn remote_file_manager_download_existing_file() {
        use super::*;

        //std::env::set_var(TEST_STORYTELLER_ROOT, "/testing/storyteller/root");

        // assert_eq!(get_storyteller_root(), PathBuf::from("/testing/storyteller/root"));
        // std::env::remove_var(TEST_STORYTELLER_ROOT);
        // let access_key = easyenv::get_env_string_required("ACCESS_KEY")?;
        // let secret_key = easyenv::get_env_string_required("SECRET_KEY")?;
        // let region_name = easyenv::get_env_string_required("REGION_NAME")?;
        // let public_bucket_name = easyenv::get_env_string_required("PUBLIC_BUCKET_NAME")?;
        // let private_bucket_name = easyenv::get_env_string_required("PRIVATE_BUCKET_NAME")?;

        env_logger::init();

        // let weight_path:&str= "models/imagegen/loRA/nijiMecha.safetensors";

        // let seed_tool_data_root = get_seed_tool_data_root();
        // let weight_path = seed_tool_data_root.join(weight_path);
        // let weight_path = weight_path.to_str().unwrap();

        // println!("begin upload from weight_path: {:?}", weight_path);
        // let result = remote_cloud_file_manager.upload_file(Box::new(WeightsLoRADescriptor {}),weight_path).await;
        
        // match result {
        //     Ok(file_meta_data) => {
        //         println!("file_meta_data: {:?}", file_meta_data);
        //     },
        //     Err(e) => {
        //         println!("error: {:?}", e);
        //     }
        // }
  
    }

}