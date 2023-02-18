use tokens::tokens::tts_models::TtsModelToken;

/// Static configurations for usable voices.
/// These will be well-known character voices, test voices, etc.
#[derive(Copy, Clone, Eq, PartialEq, Debug)]
pub enum FakeYouVoiceOption {
  Hanashi,
  JohnMadden,
}

impl FakeYouVoiceOption {

  pub fn variant_name(&self) -> &'static str {
    match self {
      FakeYouVoiceOption::Hanashi => "Hanashi",
      FakeYouVoiceOption::JohnMadden => "John Madden",
    }
  }

  pub fn tts_model_token_str(&self) -> &'static str {
    match self {
      FakeYouVoiceOption::Hanashi => "TM:npxv6rgtddmv",
      FakeYouVoiceOption::JohnMadden => "TM:30ha2t6bxfn4",
    }
  }

  pub fn tts_model_token(&self) -> TtsModelToken {
    TtsModelToken::new_from_str(self.tts_model_token_str())
  }
}
