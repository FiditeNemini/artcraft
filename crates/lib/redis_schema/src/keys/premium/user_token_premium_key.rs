use chrono::{Datelike, DateTime, Utc};

use tokens::tokens::users::UserToken;

pub struct UserTokenPremiumKey(pub String);

impl_string_key!(UserTokenPremiumKey);

impl UserTokenPremiumKey {
  pub fn new_for_user(user_token: &UserToken, time: DateTime<Utc>) -> Self {
    let month = time.month();
    let key = format!("premium:user:{}:{}", user_token.as_str(), month);
    Self(key)
  }
}

#[cfg(test)]
mod tests {
  use chrono::TimeZone;

  use tokens::tokens::users::UserToken;

  use super::*;

  #[test]
  fn test_new_for_user() {
    let user_token = UserToken::new_from_str("token");
    let time = Utc.with_ymd_and_hms(2021, 1, 1, 0, 0, 0).unwrap();
    let key = UserTokenPremiumKey::new_for_user(&user_token, time);
    assert_eq!(key.as_str(), "premium:user:token:1");
  }
}
