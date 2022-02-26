use database_queries::complex_models::event_responses::EventResponse;

// TODO: Check that the tokens are valid models.

/// Try to prevent saving garbage to the database.
pub fn validate_event_response(event_response: &EventResponse) -> Result<(), String> {
  match event_response {
    EventResponse::NotSet {} => {
      // Implicitly valid
    },
    EventResponse::TtsSingleVoice { tts_model_token } => {
      if tts_model_token.is_empty() {
        return Err("tts_model_token is empty".to_string());
      }
    },
    EventResponse::TtsRandomVoice { tts_model_tokens } => {
      for model_token in tts_model_tokens {
        if model_token.is_empty() {
          return Err("one or more tts_model_tokens is invalid".to_string());
        }
      }
    },
  }

  Ok(())
}
