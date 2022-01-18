use crate::redis::lease_payload::LeasePayload;
use log::info;
use log::warn;
use crate::redis::lease_timeout::LEASE_TIMEOUT_SECONDS;
use r2d2_redis::RedisConnectionManager;
use r2d2_redis::r2d2::Pool;
use r2d2_redis::redis::Commands;
use std::sync::Arc;
use std::thread::sleep;
use std::time::Duration;
use redis_common::redis_keys::RedisKeys;

pub async fn twitch_pubsub_user_subscriber_thread(
  twitch_user_id: String,
  redis_pool: Arc<Pool<RedisConnectionManager>>
) {

  // TODO: Error handling

  loop {
    info!("Twitch subscriber thread");

    let mut redis = redis_pool.get().unwrap();

    let lease_key = RedisKeys::twitch_pubsub_lease(&twitch_user_id);
    let lease = LeasePayload::new("foo", "bar");

    let serialized = lease.serialize();
    let _v : Option<String> = redis.set_ex(
      &lease_key,
      &serialized,
      LEASE_TIMEOUT_SECONDS
    ).unwrap();


    sleep(Duration::from_secs(3));
  }
}
