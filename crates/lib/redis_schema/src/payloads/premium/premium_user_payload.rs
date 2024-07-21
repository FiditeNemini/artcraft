use std::collections::HashMap;
use std::ops::Add;

use chrono::Utc;
use r2d2_redis::r2d2::PooledConnection;
use r2d2_redis::redis::Commands;
use r2d2_redis::RedisConnectionManager;

use errors::AnyhowResult;

use crate::keys::premium::premium_user_redis_key::PremiumUserRedisKey;
use crate::payloads::premium::inner_state::premium_payload::PremiumPayload;

pub struct PremiumUserPayload {
  key: PremiumUserRedisKey,
  payload: PremiumPayload,
}

impl PremiumUserPayload {

  pub fn new(key: PremiumUserRedisKey) -> Self {
    Self {
      key,
      payload: PremiumPayload::new(),
    }
  }

  pub fn read_from_redis(key: PremiumUserRedisKey, mut redis: PooledConnection<RedisConnectionManager>) -> AnyhowResult<Self> {
    let usage_map : HashMap<String, String> = redis.hgetall(key.as_str())?;
    let payload = PremiumPayload::from_redis_hkey_map(&usage_map)?;
    Ok(Self {
      key,
      payload,
    })
  }

  pub fn persist_to_redis(&self, mut redis: PooledConnection<RedisConnectionManager>) -> AnyhowResult<()> {
    let map = self.payload.to_redis_hkey_vec();
    redis.hset_multiple(self.key.as_str(), &map)?;
    self.set_key_expiry(redis)?;
    Ok(())
  }

  pub fn set_key_expiry(&self, mut redis: PooledConnection<RedisConnectionManager>) -> AnyhowResult<()> {
    let expire_at= Utc::now()
        .add(PremiumUserRedisKey::get_redis_ttl())
        .timestamp() as usize;
    redis.expire_at(self.key.as_str(), expire_at)?;
    Ok(())
  }
}

#[cfg(test)]
mod tests {

  #[test]
  fn todo() {
  }
}
