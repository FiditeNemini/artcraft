#[derive(Clone, Copy, Eq, PartialEq, Debug, Deserialize, Serialize, sqlx::Type)]
pub enum VocoderType {
  #[serde(rename = "hifigan")]
  #[sqlx(rename = "hifigan")]
  HifiGan,
}

/// NB: Legacy API for older code.
impl VocoderType {
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
  use crate::db::enums::vocoder_type::VocoderType;
  use crate::test_helpers::assert_serialization;

  #[test]
  fn test_serialization() {
    assert_serialization(VocoderType::HifiGan, "hifigan");
  }
}
