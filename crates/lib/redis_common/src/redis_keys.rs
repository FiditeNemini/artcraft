/// Centralize all of the Redis key naming and dereferencing.
pub struct RedisKeys {}

impl RedisKeys {

  // =============== FAKEYOU / TTS / W2L ===============

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
  pub fn tts_download_extra_status_info(inference_job_token: &str) -> String {
    format!("ttsDownloadExtraStatus:{}", inference_job_token)
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

  // =============== OBS / TWITCH ===============

  /// This is a PubSub topic.
  /// We publish when new viewers arrive and as a "keep-alive ping".
  pub fn obs_active_session_topic() -> &'static str {
    "obsActiveSessionTopic"
  }

  /// This is a key that denotes a PubSub lease subscriber.
  /// Only one thread should be PubSub subscribed to any given user at a time.
  /// These keys should have a TTL so that they naturally expire without maintenance.
  pub fn twitch_pubsub_lease(twitch_user_id: &str) -> String {
    format!("twitchPubsubLease:{}", twitch_user_id)
  }

  /// This is a PubSub topic.
  /// These are "unenriched" Twitch events from the PubSub (and eventually IRC)
  /// subscribers. Downstream listeners will enrich these for user-facing functionality.
  pub fn twitchEventTopic(twitch_user_id: &str) -> String {
    format!("twitchEventTopic:{}", twitch_user_id)
  }
}
