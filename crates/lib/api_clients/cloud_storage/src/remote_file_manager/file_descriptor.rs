// Describes the file and how it will be saved to GCBucket
// where the file should be stored based off the descriptor 
use std::path::PathBuf;
use crockford::crockford_entropy_lower;
use buckets::util::hashed_directory_path_long_string;

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

#[cfg(test)]
mod tests {

  #[test]
  pub fn test() {}

  pub fn generate_new_entropy() {
    // let directory = FileDescriptorBucketDirectory::generate_new();
    // assert_eq!(directory.get_object_hash().len(), 32);
  }

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