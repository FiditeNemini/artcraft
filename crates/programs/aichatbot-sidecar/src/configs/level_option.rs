use strum::EnumIter;
use strum::IntoEnumIterator;

/// Static configurations for which levels the Unreal Engine program can present.
#[derive(Copy, Clone, Eq, PartialEq, Debug)]
#[derive(EnumIter)]
pub enum LevelOption {
  BlankBlue,
  BlankRed,
  FakeCnn,
  FantasyStorytelling,
  CartoonNewsStation,
  VirtualMusician,
  AiUpscaledDeepFake,
}

impl Default for LevelOption {
  fn default() -> Self {
    Self::FakeCnn
  }
}

impl LevelOption {
  pub fn variant_name(&self) -> &'static str {
    match self {
      Self::BlankBlue => "Blank (Blue)",
      Self::BlankRed => "Blank (Red)",
      Self::FakeCnn => "Fake CNN",
      Self::FantasyStorytelling => "Fantasy Storytelling",
      Self::CartoonNewsStation => "Cartoon News Station",
      Self::VirtualMusician => "Virtual Musician",
      Self::AiUpscaledDeepFake => "AI Upscaled Deep Fake (Unreal -> DeepFaceLive)",
    }
  }

  pub fn tts_model_token_str(&self) -> &'static str {
    match self {
      Self::BlankBlue => "blank_blue",
      Self::BlankRed => "blank_red",
      Self::FakeCnn => "fake_cnn",
      Self::CartoonNewsStation => "cartoon_news_station",
      Self::FantasyStorytelling => "fantasy_storytelling",
      Self::VirtualMusician => "virtual_musician",
      Self::AiUpscaledDeepFake => "ai_upscaled_deep_fake",
    }
  }

  pub fn iterate() -> LevelOptionIter {
    Self::iter()
  }
}
