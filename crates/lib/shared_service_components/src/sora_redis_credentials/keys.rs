/// Redis key
pub (crate) const SORA_SECRET_REDIS_KEY : &str = "sora_secret";

/// HKEY field for the bearer token
pub (crate) const BEARER_SUBKEY : &str = "bearer";

/// HKEY field for the cookie
pub (crate) const COOKIE_SUBKEY : &str = "cookie";

/// HKEY field for the sentinel
pub (crate) const SENTINEL_SUBKEY : &str = "sentinel";

/// Which subkey to write
#[derive(Clone,Copy,Debug)]
pub enum RedisSoraCredentialSubkey {
  Bearer,
  Cookie,
  Sentinel,
}

impl RedisSoraCredentialSubkey {
  pub (crate) fn to_str(&self) -> &'static str {
    match self {
      RedisSoraCredentialSubkey::Bearer => BEARER_SUBKEY,
      RedisSoraCredentialSubkey::Cookie => COOKIE_SUBKEY,
      RedisSoraCredentialSubkey::Sentinel => SENTINEL_SUBKEY,
    }
  }
}
