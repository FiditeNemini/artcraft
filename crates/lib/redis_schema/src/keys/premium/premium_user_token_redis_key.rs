use chrono::{Datelike, DateTime, Duration, Utc};

use tokens::tokens::users::UserToken;

pub struct PremiumUserTokenRedisKey(pub String);

impl_string_key!(PremiumUserTokenRedisKey);

const DURATION : Duration = Duration::milliseconds(1000 * 60 * 60 * 24 * 32); // 32 days

impl PremiumUserTokenRedisKey {
  pub fn new_for_user(user_token: &UserToken, time: DateTime<Utc>) -> Self {
    let month = time.month();
    let key = format!("premium:user:{}:{}", user_token.as_str(), month);
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
    let user_token = UserToken::new_from_str("token");
    let time = Utc.with_ymd_and_hms(2021, 1, 1, 0, 0, 0).unwrap();
    let key = PremiumUserTokenRedisKey::new_for_user(&user_token, time);
    assert_eq!(key.as_str(), "premium:user:token:1");
  }

  #[test]
  fn test_duration() {
    assert_eq!(PremiumUserTokenRedisKey::get_redis_ttl().num_days(), 32);
  }
}
