use std::sync::{Arc, LockResult, RwLock};
use concurrency::relaxed_atomic_bool::RelaxedAtomicBool;
use errors::{anyhow, AnyhowResult};
use crate::configs::fakeyou_voice_option::FakeYouVoiceOption;

/// User-controlled parameters that determine how the app behaves at runtime.
#[derive(Clone)]
pub struct AppControlState {
  /// Whether the playback should be paused
  /// Unreal Engine will get this over HTTP and know whether to no-op.
  is_paused: Arc<RwLock<bool>>,

  /// Whether unreal should pause playback.
  is_unreal_paused: RelaxedAtomicBool,

  /// Whether the web scraping should be paused.
  is_scraping_paused: RelaxedAtomicBool,

  /// Whether calls to OpenAI should be paused.
  is_openai_paused: RelaxedAtomicBool,

  /// Whether calls to FakeYou should be paused.
  is_fakeyou_paused: RelaxedAtomicBool,

  /// Option of which voice to use for TTS.
  fakeyou_voice: Arc<RwLock<FakeYouVoiceOption>>,
}

impl AppControlState {

  pub fn new() -> Self {
    AppControlState {
      is_paused: Arc::new(RwLock::new(false)),
      is_unreal_paused: RelaxedAtomicBool::new(false),
      is_scraping_paused: RelaxedAtomicBool::new(false),
      is_openai_paused: RelaxedAtomicBool::new(false),
      is_fakeyou_paused: RelaxedAtomicBool::new(false),
      fakeyou_voice: Arc::new(RwLock::new(FakeYouVoiceOption::Hanashi)),
    }
  }

  pub fn is_paused(&self) -> AnyhowResult<bool> {
    match self.is_paused.read() {
      Ok(value) => Ok(*value),
      Err(err) => Err(anyhow!("lock error: {:?}", err)),
    }
  }

  pub fn set_is_paused(&self, new_value: bool) -> AnyhowResult<()> {
    match self.is_paused.write() {
      Ok(mut value) => {
        *value = new_value;
        Ok(())
      },
      Err(err) => Err(anyhow!("lock error: {:?}", err)),
    }
  }

  pub fn is_unreal_paused(&self) -> bool {
    self.is_unreal_paused.get()
  }

  pub fn set_is_unreal_paused(&self, new_value: bool) {
    self.is_unreal_paused.set(new_value)
  }

  pub fn is_scraping_paused(&self) -> bool {
    self.is_scraping_paused.get()
  }

  pub fn set_is_scraping_paused(&self, new_value: bool) {
    self.is_scraping_paused.set(new_value)
  }

  pub fn is_openai_paused(&self) -> bool {
    self.is_openai_paused.get()
  }

  pub fn set_is_openai_paused(&self, new_value: bool) {
    self.is_openai_paused.set(new_value)
  }

  pub fn is_fakeyou_paused(&self) -> bool {
    self.is_fakeyou_paused.get()
  }

  pub fn set_is_fakeyou_paused(&self, new_value: bool) {
    self.is_fakeyou_paused.set(new_value)
  }

  pub fn fakeyou_voice(&self) -> AnyhowResult<FakeYouVoiceOption> {
    match self.fakeyou_voice.read() {
      Ok(value) => Ok(*value),
      Err(err) => Err(anyhow!("lock error: {:?}", err)),
    }
  }

  pub fn set_fakeyou_voice(&self, new_value: FakeYouVoiceOption) -> AnyhowResult<()> {
    match self.fakeyou_voice.write() {
      Ok(mut value) => {
        *value = new_value;
        Ok(())
      },
      Err(err) => Err(anyhow!("lock error: {:?}", err)),
    }
  }
}
