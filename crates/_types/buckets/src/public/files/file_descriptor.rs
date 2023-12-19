// Describes the file and how it will be saved to GCBucket
// where the file should be stored based off the descriptor 

use std::path::PathBuf;

use crockford::crockford_entropy_lower;

use crate::util::hashed_directory_path_long_string;

// DEFAULT IMPLEMENTATION
const REMOTE_FILE_DIRECTORY: &str = "/implement_google_cloud_storage_bucket_name";
// File Descriptor Steers the Bucket Directory
pub trait FileDescriptor {
    // By default a file belongs in the public bucket will help us figureout which bucket to use.
    fn remote_directory_path(&self) -> &str {
        return REMOTE_FILE_DIRECTORY;
    }
    // this will be the type of file
    // e.g requires! a period .safetensors .bin .jpg
    fn get_suffix(&self)->String {
       return "implement".to_string();
    }
    // This will be the prefix of the media type or the weights type.
    // name of the weights or the name of the media type
    // vall-e_prompt, loRA, sd15, sdxl when implmenting add to the end
    fn get_prefix(&self)->String {
        return "implement".to_string();
    }

    // This will be ensure that the right bucket is picked
    fn is_public(&self) -> bool {
      true
    }
}

pub struct FileBucketDirectory {
  file_object_hash: String,
  cloud_directory_hash: String, 
  remote_cloud_base_directory: String,
  full_remote_cloud_file_path: String,
  file_name: String,
  file_descriptor: Box<dyn FileDescriptor>
}

impl FileBucketDirectory {
  pub fn generate_new(file_descriptor: Box<dyn FileDescriptor>) -> Self {
    Self::from_object_hash(file_descriptor)
  }

  fn from_object_hash(file_descriptor: Box<dyn FileDescriptor>) -> Self {
    let cloud_path_entropy = crockford_entropy_lower(32);
    let file_name_entropy  = crockford_entropy_lower(32);

    // gets you wiki /a/b/c/d folder structure
    let middle = hashed_directory_path_long_string::hashed_directory_path_long_string(cloud_path_entropy.as_ref());

    // gets you cloud bucket path e.g weights/a/b/c/d/clould_path_entropy
    let remote_cloud_base_directory = format!("{}/{}{}", file_descriptor.remote_directory_path(), middle, cloud_path_entropy);

    // gets you name of the file with suffix and prefix and entropy in the centre
    let file_name = format!("{}_{}.{}", file_descriptor.get_prefix(), file_name_entropy, file_descriptor.get_suffix());
    // note: no longer optional because it's easy to know what it would be in the db explicit is better than implcit.
    
    // This is the full path you upload to.
    let full_remote_cloud_file_path = format!("{}/{}", remote_cloud_base_directory , file_name);
    Self {
      file_object_hash: file_name_entropy,
      cloud_directory_hash: cloud_path_entropy,
      remote_cloud_base_directory: remote_cloud_base_directory,
      full_remote_cloud_file_path: full_remote_cloud_file_path,
      file_name:file_name,
      file_descriptor:file_descriptor
    }
  }
  
  pub fn get_file_object_hash(&self) -> &str {
      &self.file_object_hash
  }

  pub fn get_cloud_directory_hash(&self) -> &str {
      &self.cloud_directory_hash
  }

  pub fn get_remote_cloud_base_directory(&self) -> &str {
      &self.remote_cloud_base_directory
  }

  pub fn get_full_remote_cloud_file_path(&self) -> &str {
      &self.full_remote_cloud_file_path
  }

  pub fn to_full_remote_cloud_file_path_pathbuf(&self) -> PathBuf {
    PathBuf::from(&self.full_remote_cloud_file_path)
  }

  pub fn get_file_name(&self) -> &str {
      &self.file_name
  }

  // pub fn get_file_descriptor(&self) -> &dyn FileDescriptor {
  //     &self.file_descriptor
  // }

}

#[cfg(test)]
mod tests {

  #[test]
  pub fn test() {

  }
  // pub fn generate_new_entropy() {
  //   let directory = FileDescriptorBucketDirectory::generate_new();
  //   assert_eq!(directory.get_object_hash().len(), 32);
  // }

  // #[test]
  // pub fn get_directory_path_str() {
  //   let directory = FileDescriptorBucketDirectory::from_object_hash("abcdefghijk");
  //   assert_eq!(directory.get_directory_path_str(), format!("/{}/a/b/c/d/e/abcdefghijk",REMOTE_FILE_DIRECTORY));
  // }

  // #[test]
  // pub fn get_directory_path_str_short_name() {
  //   let directory = FileDescriptorBucketDirectory::from_object_hash("foo");
  //   assert_eq!(directory.get_directory_path_str(), format!("/{}/f/o/foo",REMOTE_FILE_DIRECTORY));
  // }

  // #[test]
  // pub fn get_object_hash() {
  //   let hash = "abcdefghijk";
  //   let directory = FileDescriptorBucketDirectory::from_object_hash(hash);
  //   assert_eq!(directory.get_object_hash(), hash);
  // }
}