use anyhow::anyhow;
use container_common::anyhow_result::AnyhowResult;
use log::error;
use log::warn;
use r2d2_redis::RedisConnectionManager;
use r2d2_redis::r2d2::PooledConnection;
use r2d2_redis::redis::Commands;
use redis_common::payloads::obs_active_payload::ObsActivePayload;
use redis_common::redis_keys::RedisKeys;

/// Let the Twitch PubSub service know a browser is open for `twitch_user_id`.
pub fn publish_active_browser_info(
  redis: &mut PooledConnection<RedisConnectionManager>,
  twitch_user_id: &str
) -> AnyhowResult<()> {
  let channel = RedisKeys::obs_active_sessions_topic();
  let payload = ObsActivePayload::new(twitch_user_id);

  let json_payload = payload.serialize()
      .map_err(|e| {
        error!("Could not serialize JSON: {:?}", e);
        anyhow!("Could not serialize JSON: {:?}", e)
      })?;

  let _count_received : Option<u64> = redis.publish(channel, &json_payload)
      .map_err(|e| {
        warn!("redis error: {:?}", e);
        anyhow!("redis error: {:?}", e)
      })?;

  Ok(())
}
