#[cfg(feature = "ml_models")]
use ml_models::ml::model_config::ModelConfig;

#[cfg(not(feature = "ml_models"))]
pub struct ModelConfig {
  // Intentionally left blank
}

#[cfg(not(feature = "ml_models"))]
impl ModelConfig {
  pub fn init() -> anyhow::Result<Self> {
    Ok(Self {})
  }
}
