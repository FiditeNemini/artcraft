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

  #[serde(rename = "melgan_vocodes")]
  #[sqlx(rename = "melgan_vocodes")]
  MelGanVocodes,
}

/// NB: Legacy API for older code.
impl GenericDownloadType {
  pub fn to_str(&self) -> &'static str {
    match self {
      Self::HifiGan => "hifigan",
      Self::MelGanVocodes => "melgan_vocodes",
    }
  }

  pub fn from_str(value: &str) -> Result<Self, String> {
    match value {
      "hifigan" => Ok(Self::HifiGan),
      "melgan_vocodes" => Ok(Self::MelGanVocodes),
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
    assert_serialization(GenericDownloadType::MelGanVocodes, "melgan_vocodes");
  }

  #[test]
  fn to_str() {
    assert_eq!(GenericDownloadType::HifiGan.to_str(), "hifigan");
    assert_eq!(GenericDownloadType::MelGanVocodes.to_str(), "melgan_vocodes");
  }

  #[test]
  fn from_str() {
    assert_eq!(GenericDownloadType::from_str("hifigan").unwrap(), GenericDownloadType::HifiGan);
    assert_eq!(GenericDownloadType::from_str("melgan_vocodes").unwrap(), GenericDownloadType::MelGanVocodes);
  }
}
