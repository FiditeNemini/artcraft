use container_common::anyhow_result::AnyhowResult;

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone)]
#[serde(rename_all = "snake_case")]
pub enum EventResponse {
  /// Default value
  NotSet,

  /// Respond with a single TTS voice.
  TtsSingleVoice {
    tts_model_token: String,
  },

  /// Respond with a random TTS voice.
  TtsRandomVoice {
    tts_model_tokens: Vec<String>,
  },
}

#[cfg(test)]
mod tests {
  use crate::complex_models::event_responses::EventResponse;

  #[test]
  fn tts_single_voice() {
    let rust_value = EventResponse::TtsSingleVoice {
      tts_model_token: "foo".to_string()
    };
    let json = "{\"tts_single_voice\":{\"tts_model_token\":\"foo\"}}";

    let converted_to_json= serde_json::to_string(&rust_value).unwrap();
    assert_eq!(&converted_to_json, json);

    let converted_from_json : EventResponse = serde_json::from_str(json).unwrap();
    assert_eq!(&converted_from_json, &rust_value);
  }
}
