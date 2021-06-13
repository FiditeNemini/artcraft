/// Centralize all of the Redis key naming and dereferencing.
pub struct RedisKeys {}

impl RedisKeys {

  /// This is a counter incremented with TTS inference.
  /// We can use a job to read MySql and fix counts if they get out of sync.
  pub fn tts_model_usage_count(model_token: &str) -> String {
    // "model use count"
    format!("ttsUseCount:{}", model_token)
  }
}
