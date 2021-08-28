/// Centralize all of the Redis key naming and dereferencing.
pub struct RedisKeys {}

impl RedisKeys {
  /// This is a counter incremented with TTS inference.
  /// We can use a job to read MySql and fix counts if they get out of sync.
  /// These should be long-lived keys.
  pub fn tts_model_usage_count(model_token: &str) -> String {
    format!("ttsUseCount:{}", model_token)
  }

  /// This is a counter incremented with TTS inference.
  /// We can use a job to read MySql and fix counts if they get out of sync.
  /// These should be long-lived keys.
  pub fn w2l_template_usage_count(template_token: &str) -> String {
    format!("w2lUseCount:{}", template_token)
  }

  /// We write extra in-progress status information to keys.
  /// These keys should have a TTL.
  pub fn tts_inference_extra_status_info(inference_job_token: &str) -> String {
    format!("ttsInferenceExtraStatus:{}", inference_job_token)
  }

  /// We write extra in-progress status information to keys.
  /// These keys should have a TTL.
  pub fn w2l_download_extra_status_info(inference_job_token: &str) -> String {
    format!("w2lDownloadExtraStatus:{}", inference_job_token)
  }

  /// We write extra in-progress status information to keys.
  /// These keys should have a TTL.
  pub fn w2l_inference_extra_status_info(inference_job_token: &str) -> String {
    format!("w2lInferenceExtraStatus:{}", inference_job_token)
  }
}
