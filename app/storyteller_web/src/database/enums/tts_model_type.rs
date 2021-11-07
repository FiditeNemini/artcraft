//! These denote the TTS synthesizer model types

use anyhow::anyhow;
use crate::util::anyhow_result::AnyhowResult;

#[derive(Clone, Copy, PartialEq, Eq, Debug, Serialize, Deserialize, sqlx::Type)]
#[serde(rename_all = "lowercase")]
#[sqlx(rename_all = "lowercase")]
pub enum TtsModelType {
  #[serde(rename = "tacotron2")]
  Tacotron2,

  #[serde(rename = "talknet")]
  Talknet,

  // Currently unused enum values:
  //#[serde(rename = "not-set")]
  //NotSet,
  //#[serde(rename = "glowtts")]
  //GlowTts,
  //#[serde(rename = "glowtts-vocodes")]
  //GlowTtsVocodes,
}

impl TtsModelType {
  pub fn to_str(&self) -> &'static str {
    match self {
      TtsModelType::Tacotron2 => "tacotron2",
      TtsModelType::Talknet => "talknet",
    }
  }

  pub fn from_str(vocoder_type: &str) -> AnyhowResult<Self> {
    match vocoder_type {
      "tacotron2" => Ok(TtsModelType::Tacotron2),
      "talknet" => Ok(TtsModelType::Talknet),
      _ => Err(anyhow!("invalid value: {:?}", vocoder_type)),
    }
  }
}
