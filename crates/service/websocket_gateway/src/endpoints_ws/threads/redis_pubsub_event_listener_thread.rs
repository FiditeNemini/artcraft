use std::sync::Arc;
use r2d2_redis::RedisConnectionManager;
use r2d2_redis::r2d2;
use r2d2_redis::redis::Commands;
use container_common::anyhow_result::AnyhowResult;
use log::info;
use crate::endpoints_ws::threads::tts_inference_job_token_queue::TtsInferenceJobTokenQueue;
use twitch_common::twitch_user_id::TwitchUserId;
use redis_common::redis_keys::RedisKeys;

pub struct RedisPubsubEventListenerThread {
  twitch_user_id: TwitchUserId,
  /// Redis PubSub connection exclusive to *this* thread.
  redis: Arc<r2d2::Pool<RedisConnectionManager>>,
  token_queue: TtsInferenceJobTokenQueue,
}

impl RedisPubsubEventListenerThread {

  pub fn new(
    twitch_user_id: &TwitchUserId,
    redis_pubsub_connection_string: &str,
    token_queue: TtsInferenceJobTokenQueue
  ) -> AnyhowResult<Self> {

    let redis_manager =
        RedisConnectionManager::new(redis_pubsub_connection_string.clone())?;
    let redis = Arc::new(r2d2::Pool::builder()
        .build(redis_manager)?);

    Ok(Self {
      twitch_user_id: twitch_user_id.clone(),
      redis,
      token_queue,
    })
  }

  pub async fn start_thread(mut self) {
    info!("Twitch user Redis PubSub thread starting");
    // TODO: ERROR HANDLING
    // TODO: ERROR HANDLING
    // TODO: ERROR HANDLING

    // Setup Pubsub.

    let mut pubsub_pool = self.redis.get().unwrap();
    let mut pubsub = pubsub_pool.as_pubsub();

    let pubsub_key = RedisKeys::twitch_tts_job_topic(self.twitch_user_id.get_str());
    pubsub.subscribe(&pubsub_key).unwrap();

    loop {
      info!("Twitch user Redis PubSub thread loop iter");

      // TODO: This is blocking. We need a way to exit the thread.
      let message = pubsub.get_message().unwrap();
      let tts_job_token : String = message.get_payload().unwrap();

      info!("Job token received from Redis: {}", tts_job_token);
      self.token_queue.enqueue_token(&tts_job_token).unwrap();
    }
  }
}