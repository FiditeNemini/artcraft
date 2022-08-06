/// Our "generic uploads" pipeline supports a wide variety of ML models and other media.
/// Each type of upload is identified by the following enum variants.
/// These types are present in the HTTP API and database columns as serialized here.
///
/// DO NOT CHANGE VALUES WITHOUT A MIGRATION STRATEGY.
#[derive(Clone, Copy, Eq, PartialEq, Debug, Deserialize, Serialize, sqlx::Type)]
pub enum GenericUploadType {
  #[serde(rename = "hifigan")]
  #[sqlx(rename = "hifigan")]
  HifiGan,
}

#[cfg(test)]
mod tests {
  use crate::generic_upload_type::GenericUploadType;
  use crate::test_helpers::assert_serialization;

  #[test]
  fn test_serialization() {
    assert_serialization(GenericUploadType::HifiGan, "hifigan");
  }
}
