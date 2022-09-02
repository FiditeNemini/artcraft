use container_common::anyhow_result::AnyhowResult;
use crate::queries::users::user_sessions::lookup_user_for_login_result::UserRecordForLogin;
use sqlx::MySqlPool;

pub async fn lookup_user_for_login_by_email(email: &str, pool: &MySqlPool) -> AnyhowResult<UserRecordForLogin> {
  // NB: Lookup failure is Err(RowNotFound).
  let record = sqlx::query_as!(
    UserRecordForLogin,
        r#"
SELECT token, username, email_address, password_hash, is_banned
FROM users
WHERE email_address = ?
LIMIT 1
        "#,
        email.to_string(),
    )
      .fetch_one(pool)
      .await?;

  Ok(record)
}
