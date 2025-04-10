use anyhow::anyhow;
use r2d2_redis::r2d2::PooledConnection;
use r2d2_redis::redis::Commands;
use r2d2_redis::RedisConnectionManager;
use errors::AnyhowResult;
use crate::sora_redis_credentials::keys::{RedisSoraCredentialSubkey, SORA_SECRET_REDIS_KEY};

pub fn set_sora_credential_field_in_redis(
  redis: &mut PooledConnection<RedisConnectionManager>,
  subkey: RedisSoraCredentialSubkey,
  value: &str,
) -> AnyhowResult<()> {

  redis.hset(SORA_SECRET_REDIS_KEY, subkey.to_str(), value)
    .map_err(|e| anyhow!("Failed to set Sora credentials in Redis: {}", e))?;

  Ok(())
}
