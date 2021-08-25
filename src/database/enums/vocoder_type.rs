//! These denote the pretrained vocoders

use anyhow::anyhow;
use crate::util::anyhow_result::AnyhowResult;

#[derive(Clone, Copy, PartialEq, Eq, Debug, Serialize, Deserialize, sqlx::Type)]
#[serde(rename_all = "lowercase")]
#[sqlx(rename_all = "lowercase")]
pub enum VocoderType {
  HifiGanSuperSample,
  WaveGlow,
}

impl VocoderType {
  pub fn to_str(&self) -> &'static str {
    match self {
      VocoderType::HifiGanSuperSample => "hifigan-supersample",
      VocoderType::WaveGlow => "waveglow",
    }
  }

  pub fn from_str(vocoder_type: &str) -> AnyhowResult<Self> {
    match vocoder_type {
      "hifigan-supersample" => Ok(VocoderType::HifiGanSuperSample),
      "waveglow" => Ok(VocoderType::WaveGlow),
      _ => Err(anyhow!("invalid value: {:?}", vocoder_type)),
    }
  }
}
