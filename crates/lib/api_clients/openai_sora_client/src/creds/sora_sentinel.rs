
/// Sora Sentinel tokens can be generated without cookies or JWTs, and are needed for some API calls.
#[derive(Clone)]
pub struct SoraSentinel {
  sentinel: String,
}

impl SoraSentinel {
  pub fn new(sentinel: String) -> Self {
    SoraSentinel { sentinel }
  }

  pub fn get_sentinel(&self) -> &str {
    &self.sentinel
  }
}
