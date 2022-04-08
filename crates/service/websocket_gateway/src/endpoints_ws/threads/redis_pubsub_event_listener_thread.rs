use container_common::anyhow_result::AnyhowResult;
use crate::endpoints_ws::threads::tts_inference_job_token_queue::TtsInferenceJobTokenQueue;
use futures::Future;
use futures::future::Ready;
use futures_util::Stream;
use futures_util::StreamExt;
use log::error;
use log::info;
use r2d2_redis::RedisConnectionManager;
use r2d2_redis::r2d2;
use r2d2_redis::redis::{Commands, PubSub, Msg};
use redis_async::Client as AsyncClient;
use redis_common::redis_keys::RedisKeys;
use std::pin::Pin;
use std::sync::Arc;
use std::thread::sleep;
use time::Duration;
use twitch_common::twitch_user_id::TwitchUserId;
use container_common::thread::async_thread_kill_signal::AsyncThreadKillSignal;

pub struct RedisPubsubEventListenerThread {
  twitch_user_id: TwitchUserId,
  /// We'll be maintaining a thread-specific async connection to Redis.
  redis_pubsub_connection_string: String,
  token_queue: TtsInferenceJobTokenQueue,
  async_thread_kill_signal: AsyncThreadKillSignal,
}

impl RedisPubsubEventListenerThread {

  pub fn new(
    twitch_user_id: &TwitchUserId,
    redis_pubsub_connection_string: &str,
    token_queue: TtsInferenceJobTokenQueue,
    async_thread_kill_signal: AsyncThreadKillSignal,
  ) -> AnyhowResult<Self> {
    Ok(Self {
      twitch_user_id: twitch_user_id.clone(),
      redis_pubsub_connection_string: redis_pubsub_connection_string.to_string(),
      token_queue,
      async_thread_kill_signal,
    })
  }

  pub async fn start_thread(mut self) {
    info!("Twitch user Redis PubSub thread starting");

    // TODO: ERROR HANDLING
    // TODO: ERROR HANDLING
    // TODO: ERROR HANDLING

    let pubsub_key = RedisKeys::twitch_tts_job_topic(self.twitch_user_id.get_str());

    loop {
      error!("Twitch user Redis PubSub thread loop iter, key: {}", pubsub_key);

      let async_redis = AsyncClient::open(self.redis_pubsub_connection_string.as_str()).unwrap();

      let mut async_redis_conn = async_redis.get_async_connection().await.unwrap();
      let mut async_pubsub = async_redis_conn.into_pubsub();

      async_pubsub.subscribe(&pubsub_key).await.unwrap();

      let mut pubsub_stream = async_pubsub.on_message();

      while let Some(message) = pubsub_stream.next().await {
        let tts_job_token : String = message.get_payload().unwrap();

        error!("Job token received from Redis: {}", tts_job_token);
        self.token_queue.enqueue_token(&tts_job_token).unwrap();
      }

      if !self.async_thread_kill_signal.is_alive().unwrap() {
        info!("Thread has been instructed to die.");
        return;
      }

      // TODO: Proper error handling and avoid thundering herd
      error!("Twitch user Redis PubSub stream ended. Restarting shortly...");
      sleep(std::time::Duration::from_secs(5));
    }
  }
}