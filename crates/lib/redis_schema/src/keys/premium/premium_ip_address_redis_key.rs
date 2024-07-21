use chrono::{Datelike, DateTime, Duration, Utc};

pub struct PremiumIpAddressRedisKey(pub String);

impl_string_key!(PremiumIpAddressRedisKey);

const DURATION : Duration = Duration::milliseconds(1000 * 60 * 60 * 24 * 32); // 32 days

impl PremiumIpAddressRedisKey {
  pub fn new_for_user(ip_addr: &str, time: DateTime<Utc>) -> Self {
    let month = time.month();
    let key = format!("premium:ip:{}:{}", ip_addr, month);
    Self(key)
  }

  pub fn get_redis_ttl() -> Duration {
    DURATION
  }
}

#[cfg(test)]
mod tests {
  use chrono::TimeZone;

  use super::*;

  #[test]
  fn test_new_for_user() {
    let time = Utc.with_ymd_and_hms(2021, 7, 4, 0, 0, 0).unwrap();
    let key = PremiumIpAddressRedisKey::new_for_user("127.0.0.1", time);
    assert_eq!(key.as_str(), "premium:ip:127.0.0.1:7");
  }

  #[test]
  fn test_duration() {
    assert_eq!(PremiumIpAddressRedisKey::get_redis_ttl().num_days(), 32);
  }
}
