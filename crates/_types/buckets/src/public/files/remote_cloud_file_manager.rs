
use crate::public::files::file_descriptor::FileDescriptor;
use crate::public::files::file_meta_data::FileMetaData;

use super::file_descriptor::FileBucketDirectory;

use errors::AnyhowError;
use filesys::file_read_bytes::file_read_bytes;
use filesys::file_size::file_size;
use filesys::path_to_string::path_to_string;
use hashing::sha256::sha256_hash_file::sha256_hash_file;

use mimetypes::mimetype_for_bytes::get_mimetype_for_bytes;
use mimetypes::mimetype_for_file::get_mimetype_for_file;

// use cloud_storage::bucket_client::BucketClient;
struct WebFileManager {
    // bucket_client: BucketClients,
    file_descriptor: Box<dyn FileDescriptor>
}

impl WebFileManager {
    // bucket_client:BucketClients
    fn new(file_descriptor: Box<dyn FileDescriptor>) -> WebFileManager {
        WebFileManager {
            // bucket_client: bucket_client,
            file_descriptor: file_descriptor
        }
    }


    // also include bucket details here
    // pub fn download_file(&self, system_file_path:String) -> Result<(),AnyhowError> {

    // }
    // return error or success with meta data.
    pub fn upload_file(&self, system_file_path:String) -> Result<FileMetaData,AnyhowError> {
       
       
        // let bucket_client = self.bucket_client.clone();
        if self.file_descriptor.is_public() {
           
        }
        let result = Self::get_file_meta_data(system_file_path.clone())?;
        Ok(result)
    }

    // Retrieve the metadata from the file
    pub fn get_file_meta_data(system_file_path:String) -> Result<FileMetaData,AnyhowError> {
        let file_size_bytes = file_size(system_file_path.clone())?;
        let sha256_checksum = sha256_hash_file(system_file_path.clone())?;

        let bytes = file_read_bytes(system_file_path)?;
        let mimetype = get_mimetype_for_bytes(&bytes).unwrap_or("application/octet-stream");
      

        Ok(FileMetaData {
            file_size_bytes: file_size_bytes,
            sha256_checksum: sha256_checksum,
            mimetype: mimetype.to_string()
        })
    }
}


// take in system file path to upload.
// take in system file path to download to.

// should be able to take prefix suffix and entrpy to generate a file descriptor    


#[cfg(test)]
mod tests {
    //use crate::public::files::file_descriptor::{FileDescriptor};
    //use super::WebFileManager;
    #[test]
    fn test_web_file_manager() {
        println!("test")
    }

}