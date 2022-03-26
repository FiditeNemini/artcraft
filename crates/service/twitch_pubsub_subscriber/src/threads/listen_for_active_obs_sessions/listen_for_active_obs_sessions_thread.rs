use container_common::thread::thread_id::ThreadId;
use crate::threads::twitch_pubsub_user_subscriber::twitch_pubsub_user_subscriber_thread::TwitchPubsubUserSubscriberThread;
use crate::twitch::oauth::oauth_token_refresher::OauthTokenRefresher;
use log::error;
use log::info;
use log::warn;
use r2d2_redis::RedisConnectionManager;
use r2d2_redis::r2d2;
use r2d2_redis::redis::Commands;
use redis_common::payloads::lease_payload::LeasePayload;
use redis_common::payloads::obs_active_payload::ObsActivePayload;
use redis_common::redis_keys::RedisKeys;
use redis_common::shared_constants::LEASE_TIMEOUT_SECONDS;
use sqlx::MySql;
use std::sync::Arc;
use std::thread::sleep;
use std::time::Duration;
use tokio::runtime::Runtime;
use twitch_common::twitch_user_id::TwitchUserId;

// TODO: Apart from error handling, this looks mostly good.


pub struct ListenForActiveObsSessionThread {
  server_hostname: String,
  oauth_token_refresher: OauthTokenRefresher,
  mysql_pool: Arc<sqlx::Pool<MySql>>,
  redis_pool: Arc<r2d2::Pool<RedisConnectionManager>>,
  redis_pubsub_pool: Arc<r2d2::Pool<RedisConnectionManager>>,
  runtime: Arc<Runtime>,
}

impl ListenForActiveObsSessionThread {
  pub fn new(
    server_hostname: String,
    oauth_token_refresher: OauthTokenRefresher,
    mysql_pool: Arc<sqlx::Pool<MySql>>,
    redis_pool: Arc<r2d2::Pool<RedisConnectionManager>>,
    redis_pubsub_pool: Arc<r2d2::Pool<RedisConnectionManager>>,
    runtime: Arc<Runtime>,
  ) -> Self {
    Self {
      server_hostname,
      oauth_token_refresher,
      mysql_pool,
      redis_pool,
      redis_pubsub_pool,
      runtime,
    }
  }

  pub async fn start_thread(mut self) {
    // TODO: ERROR HANDLING
    // TODO: ERROR HANDLING
    // TODO: ERROR HANDLING

    // Setup PubSub.

    let mut pubsub_pool = self.redis_pubsub_pool.get().unwrap();
    let mut pubsub = pubsub_pool.as_pubsub();

    pubsub.subscribe(RedisKeys::obs_active_sessions_topic()).unwrap();

    loop {
      let message = pubsub.get_message().unwrap();
      let payload : String = message.get_payload().unwrap();
      let payload = ObsActivePayload::from_json_str(&payload).unwrap();

      let twitch_user_id = TwitchUserId::from_str(&payload.twitch_user_id).unwrap();

      // See if we have a lease already...

      let mut redis = self.redis_pool.get().unwrap();
      let lease_key = RedisKeys::twitch_pubsub_lease(&payload.twitch_user_id);
      let lease_value : Option<String> = redis.get(&lease_key).unwrap();

      if let Some(value) = lease_value.as_deref() {
        let lease = LeasePayload::deserialize(value).unwrap();
        continue;
      }

      info!("No existing lease for {:?}...", &lease_key);

      let thread_id = ThreadId::random_id();
      let lease = LeasePayload::from_thread_id(&self.server_hostname, &thread_id);

      let serialized = lease.serialize();
      let _v : Option<String> = redis.set_ex(
        &lease_key,
        &serialized,
        LEASE_TIMEOUT_SECONDS
      ).unwrap();

      // Then launch the thread...

      let redis_pool2 = self.redis_pool.clone();
      let mysql_pool2 = self.mysql_pool.clone();

      let thread = TwitchPubsubUserSubscriberThread::new(
        twitch_user_id,
        self.oauth_token_refresher.clone(),
        mysql_pool2,
        redis_pool2,
        &self.server_hostname,
        thread_id.clone());

      self.runtime.spawn(thread.start_thread());
    }
  }
}
