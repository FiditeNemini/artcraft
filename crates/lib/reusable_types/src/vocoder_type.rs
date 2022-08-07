#[derive(Clone, Copy, Eq, PartialEq, Debug, Deserialize, Serialize, sqlx::Type)]
pub enum VocoderType {
  #[serde(rename = "hifigan")]
  #[sqlx(rename = "hifigan")]
  HifiGan,
}

#[cfg(test)]
mod tests {
  use crate::test_helpers::assert_serialization;
  use crate::vocoder_type::VocoderType;

  #[test]
  fn test_serialization() {
    assert_serialization(VocoderType::HifiGan, "hifigan");
  }
}
