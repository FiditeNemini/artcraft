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

pub struct RedisPubsubEventListenerThread {
  twitch_user_id: TwitchUserId,
  /// Redis PubSub connection exclusive to *this* thread.
  redis: Arc<r2d2::Pool<RedisConnectionManager>>,
  async_redis: AsyncClient,
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


    let async_redis = AsyncClient::open(redis_pubsub_connection_string)?;

    Ok(Self {
      twitch_user_id: twitch_user_id.clone(),
      async_redis,
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

    let mut async_redis_conn = self.async_redis.get_async_connection().await.unwrap();
    let mut async_pubsub = async_redis_conn.into_pubsub();

    let pubsub_key = RedisKeys::twitch_tts_job_topic(self.twitch_user_id.get_str());
    pubsub.subscribe(&pubsub_key).unwrap();
    async_pubsub.subscribe(&pubsub_key).await.unwrap();

    let mut pubsub_stream = async_pubsub.on_message();

    loop {
      error!("Twitch user Redis PubSub thread loop iter, key: {}", pubsub_key);

//      for maybe_message in pubsub_stream {
//        if let Some(message) = futures::stream::iter(maybe_message) {
//          let tts_job_token : String = message.get_payload().unwrap();
//
//          error!("Job token received from Redis: {}", tts_job_token);
//          self.token_queue.enqueue_token(&tts_job_token).unwrap();
//
//        } else {
//          error!("NO MESSAGE");
//        }
//      }


      while let Some(value) = pubsub_stream.next().await {
        error!("got {:?}", value);
      }

      error!("NO NEXT");

//      //let maybe_message = Pin::new(&mut pubsub_stream).poll_next().await;
//      let maybe_message = pubsub_stream.next().await;
//
//      if let Some(message) = maybe_message {
//        let tts_job_token : String = message.get_payload().unwrap();
//
//        error!("Job token received from Redis: {}", tts_job_token);
//        self.token_queue.enqueue_token(&tts_job_token).unwrap();
//
//      } else {
//        error!("NO MESSAGE");
//      }


//      // NB: We can't have calls to read the Twitch websocket client block forever, and they
//      // would do exactly that if not for this code. This is adapted from the very good example
//      // in the `tokio-tungstenite` repo, which also contains good recipes for splitting sockets
//      // into two unidirectional streams:
//      // https://github.com/snapview/tokio-tungstenite/blob/master/examples/interval-server.rs
//
//      let mut interval = tokio::time::interval(std::time::Duration::from_secs(1));
//      tokio::select! {
//        //maybe_message = pubsub.get_message().unwrap() => {
//        //maybe_message = Self::blocking_get_message(&mut pubsub) => {
//        maybe_message = pubsub_stream.next() => {
//          //let tts_job_token : String = maybe_message.unwrap().get_payload().unwrap();
//          if let Some(message) = maybe_message {
//            let tts_job_token : String = message.get_payload().unwrap();
//
//            info!("Job token received from Redis: {}", tts_job_token);
//            self.token_queue.enqueue_token(&tts_job_token).unwrap();
//
//          } else {
//            info!("NO MESSAGE");
//            sleep(std::time::Duration::from_secs(1));
//
//          }
//        }
//        _ = interval.tick() => {
//          sleep(std::time::Duration::from_secs(1));
//          error!(".");
//        }
//      }


//      // TODO: This is blocking. We need a way to exit the thread.
//      let message = pubsub.get_message().unwrap();
//      let tts_job_token : String = message.get_payload().unwrap();
//
//      info!("Job token received from Redis: {}", tts_job_token);
//      self.token_queue.enqueue_token(&tts_job_token).unwrap();
    }
  }

  // NB: Futures. Ugh
  fn blocking_get_message(pubsub: &mut PubSub) -> Ready<Result<Msg,()>> {
    let message = pubsub.get_message().unwrap();
    let fut = futures::future::ok::<Msg,()>(message);
    fut
  }
}