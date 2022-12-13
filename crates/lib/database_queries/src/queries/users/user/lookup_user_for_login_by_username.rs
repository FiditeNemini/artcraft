use container_common::anyhow_result::AnyhowResult;
use crate::queries::users::user::lookup_user_for_login_result::UserRecordForLogin;
use sqlx::MySqlPool;

pub async fn lookup_user_for_login_by_username(username: &str, pool: &MySqlPool) -> AnyhowResult<UserRecordForLogin>
{
  // NB: Lookup failure is Err(RowNotFound).
  let record = sqlx::query_as!(
    UserRecordForLogin,
        r#"
SELECT
  token as `token: tokens::users::user::UserToken`,
  username,
  email_address,
  password_hash,
  is_banned
FROM users
WHERE username = ?
LIMIT 1
        "#,
        username,
    )
      .fetch_one(pool)
      .await?;

  Ok(record)
}
