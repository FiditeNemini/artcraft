use anyhow::anyhow;
use sqlx::{Error, MySqlPool};

use errors::AnyhowResult;
use tokens::tokens::users::UserToken;

pub struct PasswordResetLookupInfo {
  pub user_token: UserToken,
}

// TODO: SELECT FOR UPDATE in a transaction.
pub async fn lookup_password_reset_request(password_reset_token: &str, pool: &MySqlPool) -> AnyhowResult<Option<PasswordResetLookupInfo>> {
  // NB: Lookup failure is Err(RowNotFound).
  let result = sqlx::query_as!(
    PasswordResetLookupInfo,
        r#"
SELECT
  pw.user_token as `user_token: tokens::tokens::users::UserToken`
FROM password_resets AS pw
JOIN users AS u
  ON pw.user_token = u.token
WHERE secret_key = ?
  AND pw.expires_at < NOW()
  AND pw.current_password_version = u.password_version
  AND NOT pw.is_redeemed
  AND NOT u.is_banned
LIMIT 1
        "#,
        password_reset_token,
    )
      .fetch_one(pool)
      .await;

  match result {
    Ok(record) => Ok(Some(record)),
    Err(err) => match err {
      Error::RowNotFound => Ok(None),
      _ => Err(anyhow!(err)),
    },
  }
}
