#[derive(Clone, Debug, Serialize, Deserialize)]

pub struct TTSArgs {
  #[serde(rename = "t")]
  pub text: String, 
  #[serde(rename = "e")] 
  #[serde(skip_serializing_if = "Option::is_none")]
  pub maybe_voice_token: Option<String> //  varchar 32
}

#[cfg(test)]
mod tests {
  use crate::payloads::generic_inference_args::tts_payload::TTSArgs;
  #[test]
  fn test_tts_result() {
    
  }
}
