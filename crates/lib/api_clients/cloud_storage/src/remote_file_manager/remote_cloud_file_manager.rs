
use crate::bucket_client::BucketClient;
use super::file_descriptor::FileDescriptor;
use super::file_meta_data::FileMetaData;

use std::time::Duration;
use errors::{AnyhowError, AnyhowResult};

use filesys::file_read_bytes::file_read_bytes;
use filesys::file_size::file_size;
use filesys::path_to_string::path_to_string;
use hashing::sha256::sha256_hash_file::sha256_hash_file;
use mimetypes::mimetype_for_bytes::get_mimetype_for_bytes;
use mimetypes::mimetype_for_file::get_mimetype_for_file;
use s3::bucket;
use log::info;

// Takes the definition from database and is an input to enable us to download the file.
struct RemoteCloudBucketDetails {
    bucket_hash: String,
    // Might require a migration to add this field to the database?
    maybe_bucket_prefix: Option<String>,
    maybe_bucket_extension: Option<String>,
}

struct RemoteCloudFileClient {
    bucket_client: BucketClient,
    file_descriptor: Box<dyn FileDescriptor>
}

impl RemoteCloudFileClient {
    // bucket_client:BucketClients
    fn bucket_client_for_object(&self) -> &BucketClient {
        &self.bucket_client
    }

    fn new(file_descriptor: Box<dyn FileDescriptor>) -> AnyhowResult<RemoteCloudFileClient> {
        // Please verify that this is the correct way to get the bucket clients public and private in production and dev?
        let access_key = easyenv::get_env_string_required("ACCESS_KEY")?;
        let secret_key = easyenv::get_env_string_required("SECRET_KEY")?;
        let region_name = easyenv::get_env_string_required("REGION_NAME")?;
        
        let public_bucket_name = easyenv::get_env_string_required("PUBLIC_BUCKET_NAME")?;
        let private_bucket_name = easyenv::get_env_string_required("PRIVATE_BUCKET_NAME")?;
        // NB: Long timeout for dev rust builds to upload to cloud buckets.
        // Unoptimized binaries sometimes take a lot of time to upload, presumably due to unoptimized code.
        let bucket_timeout = easyenv::get_env_duration_seconds_or_default(
          "BUCKET_TIMEOUT_SECONDS", Duration::from_secs(60 * 10));
        let mut bucket_client:BucketClient;
        if file_descriptor.is_public() {
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
            // use private  bucket client
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

        Ok(RemoteCloudFileClient {
            bucket_client: bucket_client,
            file_descriptor: file_descriptor
        })
    }

    // // also include bucket details here
    // pub async fn download_file(&self, remote_cloud_bucket_details:RemoteCloudBucketDetails, to_system_file_path:String) -> AnyHowResult<> {
    //     self.bucket_client.download_file_to_disk(object_path, filesystem_path)
    // }

    // // return error or success with meta data.
    // pub async fn upload_file(&self, from_system_file_path:String) -> Result<FileMetaData,AnyhowError> {
    //     // get file meta data
    //     let result = Self::get_file_meta_data(system_file_path.clone())?;
    //     Ok(result)
    // }

    // Retrieve the metadata from the file
    pub fn get_file_meta_data(system_file_path:String) -> Result<FileMetaData,AnyhowError> {
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
        println!("test")
    }

}