// Describes the file and how it will be saved to GCBucket
#[derive(Clone)]
pub struct FileDescriptorBucketDirectory {
  object_hash: String,
  directory: String,
}

// where the file should be stored based off the descriptor 
const WEIGHT_FILE_DIRECTORY: &str = "/weights";
pub trait FileDescriptor {
    // this will be the type of file
    // e.g .safetensors .bin .jpg
    fn get_suffix(&self)->String {
       return ".bin".to_string();
    }
    // This will be the prefix of the media type or the weights type.
    // name of the weights or the name of the media type
    // vall-e_prompt, loRA, sd15, sdxl
    fn get_prefix(&self)->String {
        return "fake_u".to_string();
    }
    // This will be the token generated from the database record.
    fn set_hash(&mut self, hash: String);
}

// TODO FIX
// #[cfg(test)]
// mod tests {
//   use crate::public::weight_files::bucket_directory::WeightFileBucketDirectory;

//   #[test]
//   pub fn generate_new_entropy() {
//     let directory = WeightFileBucketDirectory::generate_new();
//     assert_eq!(directory.get_object_hash().len(), 32);
//   }

//   #[test]
//   pub fn get_directory_path_str() {
//     let directory = WeightFileBucketDirectory::from_object_hash("abcdefghijk");
//     assert_eq!(directory.get_directory_path_str(), "/weights/a/b/c/d/e/abcdefghijk");
//   }

//   #[test]
//   pub fn get_directory_path_str_short_name() {
//     let directory = WeightFileBucketDirectory::from_object_hash("foo");
//     assert_eq!(directory.get_directory_path_str(), "/weights/f/o/foo");
//   }

//   #[test]
//   pub fn get_object_hash() {
//     let hash = "abcdefghijk";
//     let directory = WeightFileBucketDirectory::from_object_hash(hash);
//     assert_eq!(directory.get_object_hash(), hash);
//   }
// }