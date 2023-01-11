
// TODO: Use macro-derived impls

/// Our "generic downloads" pipeline supports a wide variety of ML models and other media.
/// They are serialized in the database table `generic_download_jobs` as a VARCHAR(32).
///
/// Each type of download is identified by the following enum variants.
/// These types are present in the HTTP API and database columns as serialized here.
///
/// DO NOT CHANGE VALUES WITHOUT A MIGRATION STRATEGY.
#[derive(Clone, Copy, Eq, PartialEq, Debug, Deserialize, Serialize, sqlx::Type)]
pub enum GenericDownloadType {
  /// NB: Note - this is hifigan for Tacotron2.
  /// Some work will be needed to unify this with other hifigan types.
  #[serde(rename = "hifigan")]
  #[sqlx(rename = "hifigan")]
  HifiGan,

  /// NB: Note - this is hifigan for SoftVC (our internal codename is "rocketvc").
  /// Some work will need to be done to unify this with other hifigan types.
  #[serde(rename = "hifigan_rocket_vc")]
  #[sqlx(rename = "hifigan_rocket_vc")]
  HifiGanRocketVc,

  //#[serde(rename = "melgan_vocodes")]
  //#[sqlx(rename = "melgan_vocodes")]
  //MelGanVocodes,

  /// NB: Our external-facing name for "softvc" is rocketvc.
  /// I wish we could stop being stupid about this.
  #[serde(rename = "rocket_vc")]
  #[sqlx(rename = "rocket_vc")]
  RocketVc,

  /// Tacotron TTS models.
  #[serde(rename = "tacotron2")]
  #[sqlx(rename = "tacotron2")]
  Tacotron2,
}

/// NB: Legacy API for older code.
impl GenericDownloadType {
  pub fn to_str(&self) -> &'static str {
    match self {
      Self::HifiGan => "hifigan",
      Self::HifiGanRocketVc => "hifigan_rocket_vc",
      Self::RocketVc => "rocket_vc",
      Self::Tacotron2 => "tacotron2",
    }
  }

  pub fn from_str(value: &str) -> Result<Self, String> {
    match value {
      "hifigan" => Ok(Self::HifiGan),
      "hifigan_rocket_vc" => Ok(Self::HifiGanRocketVc),
      "rocket_vc" => Ok(Self::RocketVc),
      "tacotron2" => Ok(Self::Tacotron2),
      _ => Err(format!("invalid value: {:?}", value)),
    }
  }
}

#[cfg(test)]
mod tests {
  use crate::workers::generic_download_type::GenericDownloadType;
  use crate::test_helpers::assert_serialization;

  #[test]
  fn test_serialization() {
    assert_serialization(GenericDownloadType::HifiGan, "hifigan");
    assert_serialization(GenericDownloadType::HifiGanRocketVc, "hifigan_rocket_vc");
    assert_serialization(GenericDownloadType::RocketVc, "rocket_vc");
    assert_serialization(GenericDownloadType::Tacotron2, "tacotron2");
  }

  #[test]
  fn to_str() {
    assert_eq!(GenericDownloadType::HifiGan.to_str(), "hifigan");
    assert_eq!(GenericDownloadType::HifiGanRocketVc.to_str(), "hifigan_rocket_vc");
    assert_eq!(GenericDownloadType::RocketVc.to_str(), "rocket_vc");
    assert_eq!(GenericDownloadType::Tacotron2.to_str(), "tacotron2");
  }

  #[test]
  fn from_str() {
    assert_eq!(GenericDownloadType::from_str("hifigan").unwrap(), GenericDownloadType::HifiGan);
    assert_eq!(GenericDownloadType::from_str("hifigan_rocket_vc").unwrap(), GenericDownloadType::HifiGanRocketVc);
    assert_eq!(GenericDownloadType::from_str("rocket_vc").unwrap(), GenericDownloadType::RocketVc);
    assert_eq!(GenericDownloadType::from_str("tacotron2").unwrap(), GenericDownloadType::Tacotron2);
  }
}
