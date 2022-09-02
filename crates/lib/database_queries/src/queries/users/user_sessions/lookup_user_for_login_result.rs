/// Shared result type for user lookups for login (via email or username)
#[derive(Debug)]
pub struct UserRecordForLogin {
  pub token: String,
  pub username: String,
  pub email_address: String,
  pub password_hash: Vec<u8>,
  pub is_banned: i8,
}
