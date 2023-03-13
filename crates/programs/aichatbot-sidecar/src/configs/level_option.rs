
/// Static configurations for which levels the Unreal Engine program can present.
#[derive(Copy, Clone, Eq, PartialEq, Debug)]
pub enum LevelOption {
  BlankBlue,
  BlankRed,
  NewsStation,
  FantasyStorytelling,
  VirtualMusician,
  AiUpscaledDeepFake,
}

impl Default for LevelOption {
  fn default() -> Self {
    Self::BlankBlue
  }
}

impl LevelOption {
  pub fn variant_name(&self) -> &'static str {
    match self {
      Self::BlankBlue => "Blank (Blue)",
      Self::BlankRed => "Blank (Red)",
      Self::NewsStation => "News Station",
      Self::FantasyStorytelling => "Fantasy Storytelling",
      Self::VirtualMusician => "Virtual Musician",
      Self::AiUpscaledDeepFake => "AI Upscaled Deep Fake (Unreal -> DeepFaceLive)",
    }
  }

  pub fn tts_model_token_str(&self) -> &'static str {
    match self {
      Self::BlankBlue => "blank_blue",
      Self::BlankRed => "blank_red",
      Self::NewsStation => "news_station",
      Self::FantasyStorytelling => "fantasy_storytelling",
      Self::VirtualMusician => "virtual_musician",
      Self::AiUpscaledDeepFake => "ai_upscaled_deep_fake",
    }
  }
}
