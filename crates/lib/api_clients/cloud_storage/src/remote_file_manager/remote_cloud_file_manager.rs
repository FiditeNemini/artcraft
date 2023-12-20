
use crate::bucket_client::BucketClient;
use crate::remote_file_manager::file_directory::FileBucketDirectory;
use super::file_descriptor::{FileDescriptor, self};
use super::file_meta_data::FileMetaData;

use std::time::Duration;
use anyhow::Ok;
use errors::{AnyhowError, AnyhowResult};

use filesys::file_read_bytes::file_read_bytes;
use filesys::file_size::file_size;
use filesys::path_to_string::path_to_string;
use hashing::sha256::sha256_hash_file::sha256_hash_file;
use mimetypes::mimetype_for_bytes::get_mimetype_for_bytes;
use mimetypes::mimetype_for_file::{get_mimetype_for_file, self};
use s3::bucket;
use log::info;

use super::weights_descriptor::{WeightsLoRADescriptor, WeightsSD15Descriptor, WeightsSDXLDescriptor, self};

// Takes the definition from database and is an input to enable us to download the file.
pub struct RemoteCloudBucketDetails {
    object_hash: String,
    prefix: String,
    suffix: String,
}

impl RemoteCloudBucketDetails {
    pub fn new(object_hash: String, prefix: String, suffix: String) -> Self {
        Self {
            object_hash: object_hash,
            prefix: prefix,
            suffix: suffix
        }
    }
    pub fn get_object_hash(&self) -> &str {
        &self.object_hash
    }
    pub fn get_prefix(&self) -> &str {
        &self.prefix
    }
    pub fn get_suffix(&self) -> &str {
        &self.suffix
    }

    pub fn file_descriptor_from_bucket_details(&self) -> Box<dyn FileDescriptor> {
        match self.prefix.as_str() {
            "loRA" => Box::new(weights_descriptor::WeightsLoRADescriptor {}),
            "SD15" => Box::new(weights_descriptor::WeightsSD15Descriptor {}),
            "SDXL" => Box::new(weights_descriptor::WeightsSDXLDescriptor {}),
            _ => panic!("Unknown prefix: {}", self.prefix)
        }
    }
}

struct RemoteCloudFileClient {}

impl RemoteCloudFileClient {

    pub async fn download_file(&self, remote_cloud_bucket_details:RemoteCloudBucketDetails, to_system_file_path:String) -> AnyhowResult<()> {
        let file_descriptor = remote_cloud_bucket_details.file_descriptor_from_bucket_details();
        let file_bucket_directory = FileBucketDirectory::from_existing_bucket_details(remote_cloud_bucket_details);
        let full_remote_cloud_file_path = file_bucket_directory.get_full_remote_cloud_file_path();
        let bucket_client = self.get_bucket_with_visbility(file_descriptor.is_public()).await?;
        bucket_client.download_file_to_disk(full_remote_cloud_file_path, to_system_file_path);
        Ok(())
    }

    pub async fn get_bucket_with_visbility(&self, public:bool) -> Result<BucketClient,AnyhowError> {
        let access_key = easyenv::get_env_string_required("ACCESS_KEY")?;
        let secret_key = easyenv::get_env_string_required("SECRET_KEY")?;
        let region_name = easyenv::get_env_string_required("REGION_NAME")?;
        let public_bucket_name = easyenv::get_env_string_required("PUBLIC_BUCKET_NAME")?;
        let private_bucket_name = easyenv::get_env_string_required("PRIVATE_BUCKET_NAME")?;
       
        let bucket_timeout = easyenv::get_env_duration_seconds_or_default(
          "BUCKET_TIMEOUT_SECONDS", Duration::from_secs(60 * 10));
        let mut bucket_client:BucketClient;
        if public {
            // use public bucket client
            info!("Configuring public GCS bucket...");
            bucket_client = BucketClient::create(
              &access_key,
              &secret_key,
              &region_name,
              &public_bucket_name,
              None,
              Some(bucket_timeout),
            )?;
        } else {    
            info!("Configuring private GCS bucket...");
            bucket_client = BucketClient::create(
            &access_key,
            &secret_key,
            &region_name,
            &private_bucket_name,
            None,
            Some(bucket_timeout),
            )?;
        }
        Ok(bucket_client)
    }

    // return error or success with meta data.
    pub async fn upload_file(&self, file_descriptor:Box<dyn FileDescriptor>, from_system_file_path:&str) -> Result<FileMetaData,AnyhowError> {
        let bucket_client = self.get_bucket_with_visbility(file_descriptor.is_public()).await?;

        // get file meta data
        info!("Reading media file: {:?}", from_system_file_path);
        // get meta data 
        let bytes = file_read_bytes(from_system_file_path)?;
        let mimetype = get_mimetype_for_bytes(&bytes).unwrap_or("application/octet-stream");

        let directory = FileBucketDirectory::generate_new(
            file_descriptor
        );
        
        bucket_client.upload_file_with_content_type(
            &directory.get_remote_cloud_base_directory(),
            bytes.as_ref(),
            mimetype
        ).await?;

        let result = Self::get_file_meta_data(from_system_file_path)?;
        Ok(result)
    }

    // Retrieve the metadata from the file
    fn get_file_meta_data(system_file_path:&str) -> Result<FileMetaData,AnyhowError> {
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
    //use crate::public::files::file_descriptor::{FileDescriptor};
    //use super::RemoteCloudFileClient;
    #[test]
    fn test_web_file_manager() {

    }

}