use anyhow::anyhow;
use errors::AnyhowResult;
use openai_sora_client::credentials::SoraCredentials;
use r2d2_redis::RedisConnectionManager;
use r2d2_redis::r2d2::PooledConnection;
use r2d2_redis::redis::Commands;
use std::collections::HashMap;
use crate::sora_redis_credentials::keys::{BEARER_SUBKEY, COOKIE_SUBKEY, SENTINEL_SUBKEY, SORA_SECRET_REDIS_KEY};

pub fn get_sora_credentials_from_redis(
  redis: &mut PooledConnection<RedisConnectionManager>
) -> AnyhowResult<SoraCredentials> {

  let values : HashMap<String, String> = redis.hgetall(SORA_SECRET_REDIS_KEY)
      .map_err(|e| anyhow!("Failed to get Sora credentials from Redis: {}", e))?;

  let bearer = values.get(BEARER_SUBKEY);
  let cookie = values.get(COOKIE_SUBKEY);
  let sentinel = values.get(SENTINEL_SUBKEY);

  match (bearer, cookie, sentinel) {
    (Some(b), Some(c), Some(s)) => {
      Ok(SoraCredentials {
        bearer_token: b.to_string(),
        cookie: c.to_string(),
        sentinel: Some(s.to_string()),
      })
    }
    _ => Err(anyhow!("redis sora credential values not present")),
  }
}
