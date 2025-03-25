#[cfg(feature = "ml_models")]
pub use ml_models::ml::model_cache::ModelCache;

#[cfg(not(feature = "ml_models"))]
pub struct ModelCache {
  // Intentionally left blank
}

#[cfg(not(feature = "ml_models"))]
impl ModelCache {
  pub fn new() -> Self {
    Self {}
  }
}
