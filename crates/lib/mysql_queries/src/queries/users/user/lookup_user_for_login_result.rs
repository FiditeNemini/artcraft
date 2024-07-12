use tokens::tokens::users::UserToken;

// NB: Upgrade to sqlx 0.7 broke deserialization of Vec<u8>:
// https://github.com/launchbadge/sqlx/issues/2875
pub type VecBytes = Vec<u8>;

/// Shared result type for user lookups for login (via email or username)
#[derive(Debug)]
pub struct UserRecordForLogin {
  pub token: UserToken,
  pub username: String,
  pub email_address: String,
  pub password_hash: VecBytes,
  pub password_version: u32,
  pub is_banned: i8,

  /// Optional comma-separated list of parseable `UserFeatureFlag` enum features
  pub maybe_feature_flags: Option<String>,
}
