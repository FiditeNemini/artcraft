use crate::redis::lease_payload::LeasePayload;
use crate::redis::lease_timeout::LEASE_TIMEOUT_SECONDS;
use crate::redis::obs_active_payload::ObsActivePayload;
use crate::threads::twitch_pubsub_user_subscriber_thread::twitch_pubsub_user_subscriber_thread;
use log::error;
use log::info;
use log::warn;
use r2d2_redis::RedisConnectionManager;
use r2d2_redis::r2d2;
use r2d2_redis::redis::Commands;
use redis_common::redis_keys::RedisKeys;
use sqlx::MySql;
use std::sync::Arc;
use std::thread::sleep;
use std::time::Duration;
use tokio::runtime::Runtime;
use crate::twitch::twitch_user_id::TwitchUserId;

pub async fn listen_for_active_obs_session_thread(
  mysql_pool: Arc<sqlx::Pool<MySql>>,
  redis_pool: Arc<r2d2::Pool<RedisConnectionManager>>,
  redis_pubsub_pool: Arc<r2d2::Pool<RedisConnectionManager>>,
  runtime: Arc<Runtime>,
) {
  // TODO: ERROR HANDLING
  let mut pubsub_pool = redis_pubsub_pool.get().unwrap();
  let mut pubsub = pubsub_pool.as_pubsub();
  let channel = RedisKeys::obs_active_session_topic();
  pubsub.subscribe(channel).unwrap();

  loop {
    // TODO: ERROR HANDLING
    let message = pubsub.get_message().unwrap();
    let payload : String = message.get_payload().unwrap();

    let payload = ObsActivePayload::from_json_str(&payload).unwrap();

    let lease_key = RedisKeys::twitch_pubsub_lease(&payload.twitch_user_id);

    let mut redis = redis_pool.get().unwrap();

    let lease_value : Option<String> = redis.get(&lease_key).unwrap();

    if let Some(value) = lease_value.as_deref() {
      let lease = LeasePayload::deserialize(value).unwrap();
      continue;
    }

    info!("No existing lease for {:?}...", &lease_key);

    let lease = LeasePayload::new("foo", "bar");

    let serialized = lease.serialize();
    let _v : Option<String> = redis.set_ex(
      &lease_key,
      &serialized,
          LEASE_TIMEOUT_SECONDS
    ).unwrap();

    let twitch_user_id = TwitchUserId::from_str(&payload.twitch_user_id).unwrap();

    let redis_pool2 = redis_pool.clone();
    let mysql_pool2 = mysql_pool.clone();

    runtime.spawn(twitch_pubsub_user_subscriber_thread(twitch_user_id, mysql_pool2, redis_pool2));
  }
}
