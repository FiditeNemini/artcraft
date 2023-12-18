// use crockford::crockford_entropy_lower;
// use crate::util::hashed_directory_path_long_string::hashed_directory_path_long_string;
// use cloud_storage::bucket_client::BucketClient;
use crate::public::files::file_descriptor::FileDescriptor;

pub struct WeightsDescriptor {
    pub hash: String,
    pub prefix: String,
    pub suffix: String
}

impl FileDescriptor for WeightsDescriptor {
    fn get_suffix(&self)->String {
        return self.suffix.clone();
    }
    // This will be the prefix of the media type or the weights type.
    // name of the weights or the name of the media type
    // vall-e_prompt, loRA, sd15, sdxl
    fn get_prefix(&self)->String {
        return self.prefix.clone();
    }
    // This will be the token generated from the database record.
    fn set_hash(&mut self, hash: String) {
        self.hash = hash;
    }
}

pub struct FileMetaData {
    pub file_size_bytes: u64,
    pub sha256_checksum: String,
    pub mimetype: String
}

// impl FileDescriptor for WeightsDescriptor {
//     fn get_suffix(&self)->String {
//         return ".bin".to_string();
//     }
//     // This will be the prefix of the media type or the weights type.
//     // name of the weights or the name of the media type
//     // vall-e_prompt, loRA, sd15, sdxl
//     fn get_prefix(&self)->String {
//         return "fake_u".to_string();
//     }
// }

// pub struct WebFileManager {
//     pub file_descriptor: FileDescriptor
// }


// handles download as well.
struct WebFileManager {
    // bucket_client: BucketClient,
    file_descriptor: FileDescriptor
}
impl WebFileManager {
    fn new(file_descriptor: dyn FileDescriptor) -> WebFileManager {
        WebFileManager {
            // bucket_client: bucket_client,
            file_descriptor: file_descriptor
        }
    }
    pub fn something() {

    }
}


// take in system file path to upload.
// take in system file path to download to.

// should be able to take prefix suffix and entrpy to generate a file descriptor    

// should return this once properly uploaded.
// let file_size_bytes = file_size(weight_file_path.clone())?;
// let sha256_checksum = sha256_hash_file(weight_file_path.clone())?;

#[cfg(test)]
mod tests {
    //use crate::public::files::file_descriptor::{FileDescriptor};
    //use super::WebFileManager;
    #[test]
    fn test_web_file_manager() {
    
    }

}