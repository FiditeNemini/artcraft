use std::collections::HashMap;
use anyhow::anyhow;
use r2d2_redis::r2d2::PooledConnection;
use r2d2_redis::redis::Commands;
use r2d2_redis::RedisConnectionManager;
use errors::AnyhowResult;
use openai_sora_client::credentials::SoraCredentials;

/// Redis key
const SORA_SECRET_REDIS_KEY : &str = "sora_secret";

// Fields within the HKEY
const BEARER_SUBKEY : &str = "bearer";
const COOKIE_SUBKEY : &str = "cookie";
const SENTINEL_SUBKEY : &str = "sentinel";

#[derive(Clone,Copy,Debug)]
pub enum RedisSoraCredentialSubkey {
  Bearer,
  Cookie,
  Sentinel,
}

impl RedisSoraCredentialSubkey {
  pub fn to_str(&self) -> &'static str {
    match self {
      RedisSoraCredentialSubkey::Bearer => BEARER_SUBKEY,
      RedisSoraCredentialSubkey::Cookie => COOKIE_SUBKEY,
      RedisSoraCredentialSubkey::Sentinel => SENTINEL_SUBKEY,
    }
  }
}

pub fn get_sora_credentials(
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

pub fn set_sora_credential_field(
  redis: &mut PooledConnection<RedisConnectionManager>,
  subkey: RedisSoraCredentialSubkey,
  value: &str,
) -> AnyhowResult<()> {

  redis.hset(SORA_SECRET_REDIS_KEY, subkey.to_str(), value)
    .map_err(|e| anyhow!("Failed to set Sora credentials in Redis: {}", e))?;

  Ok(())
}
