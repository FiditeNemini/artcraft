use anyhow::anyhow;
use sqlx::{Error, MySqlPool};

use errors::AnyhowResult;

use crate::queries::users::user::lookup_user_for_login_result::UserRecordForLogin;

pub async fn lookup_user_for_login_by_email(email: &str, pool: &MySqlPool) -> AnyhowResult<Option<UserRecordForLogin>> {
  // NB: Lookup failure is Err(RowNotFound).
  let result = sqlx::query_as!(
    UserRecordForLogin,
        r#"
SELECT
  token as `token: tokens::tokens::users::UserToken`,
  username,
  email_address,
  password_hash as `password_hash: crate::queries::users::user::lookup_user_for_login_result::VecBytes`,
  password_version,
  is_banned,
  maybe_feature_flags
FROM users
WHERE email_address = ?
LIMIT 1
        "#,
        email.to_string(),
    )
      .fetch_one(pool)
      .await;

  match result {
    Ok(record) => Ok(Some(record)),
    Err(err) => match err {
      Error::RowNotFound => Ok(None),
      _ => Err(anyhow!(err))
    }
  }
}
