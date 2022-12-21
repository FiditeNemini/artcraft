#[derive(Clone, Copy, Eq, PartialEq, Debug, Deserialize, Serialize, sqlx::Type)]
pub enum VocoderType {
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
}

/// NB: Legacy API for older code.
impl VocoderType {
  pub fn to_str(&self) -> &'static str {
    match self {
      Self::HifiGan=> "hifigan",
      Self::HifiGanRocketVc => "hifigan_rocket_vc",
    }
  }

  pub fn from_str(value: &str) -> Result<Self, String> {
    match value {
      "hifigan" => Ok(Self::HifiGan),
      "hifigan_rocket_vc" => Ok(Self::HifiGanRocketVc),
      _ => Err(format!("invalid value: {:?}", value)),
    }
  }
}

#[cfg(test)]
mod tests {
  use crate::db::enums::vocoder_type::VocoderType;
  use crate::test_helpers::assert_serialization;

  #[test]
  fn test_serialization() {
    assert_serialization(VocoderType::HifiGan, "hifigan");
    assert_serialization(VocoderType::HifiGanRocketVc, "hifigan_rocket_vc");
  }

  #[test]
  fn to_str() {
    assert_eq!(VocoderType::HifiGan.to_str(), "hifigan");
    assert_eq!(VocoderType::HifiGanRocketVc.to_str(), "hifigan_rocket_vc");
  }

  #[test]
  fn from_str() {
    assert_eq!(VocoderType::from_str("hifigan").unwrap(), VocoderType::HifiGan);
    assert_eq!(VocoderType::from_str("hifigan_rocket_vc").unwrap(), VocoderType::HifiGanRocketVc);
  }
}
