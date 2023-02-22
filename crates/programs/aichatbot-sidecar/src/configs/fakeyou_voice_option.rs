use tokens::tokens::tts_models::TtsModelToken;

/// Static configurations for usable voices.
/// These will be well-known character voices, test voices, etc.
#[derive(Copy, Clone, Eq, PartialEq, Debug)]
pub enum FakeYouVoiceOption {
  HanashiV3,
  HanashiV2,
  // NB: Hanashi v1 has strokes.
  HanashiV1,
  // NB: John Madden is fantastic.
  JohnMadden,
}

impl FakeYouVoiceOption {

  pub fn variant_name(&self) -> &'static str {
    match self {
      FakeYouVoiceOption::HanashiV3 => "Hanashi (v3)",
      FakeYouVoiceOption::HanashiV2 => "Hanashi (v2)",
      FakeYouVoiceOption::HanashiV1 => "Hanashi (v1)",
      FakeYouVoiceOption::JohnMadden => "John Madden",
    }
  }

  pub fn tts_model_token_str(&self) -> &'static str {
    match self {
      FakeYouVoiceOption::HanashiV3 => "TM:5hc38cg7cdtm",
      FakeYouVoiceOption::HanashiV2 => "TM:zcd4qzrwacq0",
      FakeYouVoiceOption::HanashiV1 => "TM:npxv6rgtddmv",
      FakeYouVoiceOption::JohnMadden => "TM:30ha2t6bxfn4",
    }
  }

  pub fn tts_model_token(&self) -> TtsModelToken {
    TtsModelToken::new_from_str(self.tts_model_token_str())
  }
}
