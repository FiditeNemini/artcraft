use std::collections::HashMap;
use std::ops::Add;
use chrono::Utc;
use r2d2_redis::r2d2::PooledConnection;
use r2d2_redis::redis::{Commands};
use r2d2_redis::RedisConnectionManager;
use errors::AnyhowResult;
use crate::keys::premium::premium_user_redis_key::PremiumUserRedisKey;

pub struct PremiumUserPayload {
  key: PremiumUserRedisKey,

  credits_used: Option<u64>,

}

impl PremiumUserPayload {

  pub fn read_from_redis(key: PremiumUserRedisKey, mut redis: PooledConnection<RedisConnectionManager>) -> AnyhowResult<Self> {
    let _values : HashMap<String, String> = redis.hgetall(key.as_str())?;

    let mut free_uses_per_product_map = HashMap::new();

    let keys: Vec<String> = redis.hkeys(key.as_str())?;

    for key in keys {
      if key == "credits" {
        continue;
      }

      let count: u64 = redis.hget(key.as_str(), "count")?;

      free_uses_per_product_map.insert(key, count);
    }

    Ok(Self {
      key,
      credits_used: Some(0), // TODO
      //free_uses_per_product_map,
    })
  }

//  pub fn persist_to_redis(&self, mut redis: PooledConnection<RedisConnectionManager>) -> AnyhowResult<()> {
//    let mut values = Vec::with_capacity(self.free_uses_per_product_map.len() + 1);
//
//    values.push(("credits", self.credits_used.unwrap_or(0).to_string()));
//
//    for (product_by_week_key, count) in &self.free_uses_per_product_map {
//      values.push((product_by_week_key, count.to_string()));
//    }
//
//    redis.hset_multiple(self.key.as_str(), &values)?;
//
//    self.set_key_expiry(redis)?;
//
//    Ok(())
//  }

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
