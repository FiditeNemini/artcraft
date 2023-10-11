#[derive(Clone, Debug, Serialize, Deserialize)]

pub struct TTSArgs {
  #[serde(rename = "vt")] 
  pub voice_token: String //  varchar 32
}

#[cfg(test)]
mod tests {
  use crate::payloads::generic_inference_args::tts_payload::TTSArgs;
  #[test]
  fn test_tts_result() {
    
  }
}
