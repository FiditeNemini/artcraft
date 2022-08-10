/// Our "generic downloads" pipeline supports a wide variety of ML models and other media.
/// Each type of download is identified by the following enum variants.
/// These types are present in the HTTP API and database columns as serialized here.
///
/// DO NOT CHANGE VALUES WITHOUT A MIGRATION STRATEGY.
#[derive(Clone, Copy, Eq, PartialEq, Debug, Deserialize, Serialize, sqlx::Type)]
pub enum GenericDownloadType {
  #[serde(rename = "hifigan")]
  #[sqlx(rename = "hifigan")]
  HifiGan,
}

/// NB: Legacy API for older code.
impl GenericDownloadType {
  pub fn to_str(&self) -> &'static str {
    match self {
      Self::HifiGan=> "hifigan",
    }
  }

  pub fn from_str(value: &str) -> Result<Self, String> {
    match value {
      "hifigan" => Ok(Self::HifiGan),
      _ => Err(format!("invalid value: {:?}", value)),
    }
  }
}

#[cfg(test)]
mod tests {
  use crate::generic_download_type::GenericDownloadType;
  use crate::test_helpers::assert_serialization;

  #[test]
  fn test_serialization() {
    assert_serialization(GenericDownloadType::HifiGan, "hifigan");
  }
}
