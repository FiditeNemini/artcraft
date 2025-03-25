
#[cfg(feature = "ml_models")]
pub use ml_models::ml::prompt_cache::PromptCache;

#[cfg(not(feature = "ml_models"))]
pub struct PromptCache {
  // Intentionally left blank
}

#[cfg(not(feature = "ml_models"))]
impl PromptCache {
  pub fn with_capacity(capacity: usize) -> anyhow::Result<Self> {
    Ok(Self {})
  }
}
