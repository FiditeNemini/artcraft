use crockford::crockford_entropy_lower;
use crate::private::private_path::PrivatePath;

use crate::util::hashed_directory_path_long_string::hashed_directory_path_long_string;

// TODO: Generate these from a macro.

// TODO: Use a central path registry for quick reference
const DIRECTORY: &str = "/user/zero_shot_embeddings";

#[derive(Debug, Clone, Copy, Eq, PartialEq)]
pub enum ModelCategory {
  Tts,
  Vc,
}

impl ModelCategory {
  pub fn to_str(&self) -> &'static str {
    match self {
      ModelCategory::Tts => "tts",
      ModelCategory::Vc => "vc",
    }
  }
}

/// Directory for zero shot voice embeddings
/// Each embedding gets its own directory so we can store new versions alongside the original.
#[derive(Clone)]
pub struct ZeroShotVoiceEmbeddingBucketDirectory {
  model_category: ModelCategory,
  object_hash: String,
  directory: String,
}

impl PrivatePath for ZeroShotVoiceEmbeddingBucketDirectory {}

impl ZeroShotVoiceEmbeddingBucketDirectory {

  pub fn generate_new(model_category: ModelCategory) -> Self {
    let entropy = crockford_entropy_lower(32);
    Self::from_object_hash(model_category, &entropy)
  }

  pub fn from_object_hash(model_category: ModelCategory, object_hash: &str) -> Self {
    // TODO: Path construction could be cleaner.
    let subdir = model_category.to_str();
    let middle = hashed_directory_path_long_string(object_hash);
    let directory = format!("{}/{}/{}{}", DIRECTORY, subdir, middle, object_hash);
    Self {
      model_category,
      object_hash: object_hash.to_string(),
      directory,
    }
  }

  pub fn get_directory_path_str(&self) -> &str {
    &self.directory
  }

  pub fn get_object_hash(&self) -> &str {
    &self.object_hash
  }
}

#[cfg(test)]
mod tests {
  use crate::public::zs_voices::directory::{ModelCategory, ZeroShotVoiceEmbeddingBucketDirectory};

  #[test]
  pub fn generate_new_entropy() {
    let directory = ZeroShotVoiceEmbeddingBucketDirectory::generate_new(ModelCategory::Tts);
    assert_eq!(directory.get_object_hash().len(), 32);
  }

  #[test]
  pub fn get_directory_path_str() {
    let directory = ZeroShotVoiceEmbeddingBucketDirectory::from_object_hash(ModelCategory::Tts, "abcdefghijk");
    assert_eq!(directory.get_directory_path_str(), "/user/zero_shot_embeddings/tts/a/b/c/d/e/abcdefghijk");
  }

  #[test]
  pub fn get_directory_path_str_short_name() {
    let directory = ZeroShotVoiceEmbeddingBucketDirectory::from_object_hash(ModelCategory::Tts, "foo");
    assert_eq!(directory.get_directory_path_str(), "/user/zero_shot_embeddings/tts/f/o/foo");
  }

  #[test]
  pub fn get_object_hash() {
    let hash = "abcdefghijk";
    let directory = ZeroShotVoiceEmbeddingBucketDirectory::from_object_hash(ModelCategory::Tts, hash);
    assert_eq!(directory.get_object_hash(), hash);
  }
}
