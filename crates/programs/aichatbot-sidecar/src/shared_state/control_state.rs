use std::sync::{Arc, LockResult, RwLock};
use errors::{anyhow, AnyhowResult};

pub struct ControlState {
  /// Whether the playback should be paused
  /// Unreal Engine will get this over HTTP and know whether to no-op.
  is_paused: Arc<RwLock<bool>>,
}

impl ControlState {

  pub fn new() -> Self {
    ControlState {
      is_paused: Arc::new(RwLock::new(false)),
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
}
