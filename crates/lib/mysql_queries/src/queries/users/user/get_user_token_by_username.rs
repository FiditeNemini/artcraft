use anyhow::anyhow;
use sqlx::MySqlPool;

use errors::AnyhowResult;
use tokens::users::user::UserToken;

pub async fn get_user_token_by_username(username: &str, pool: &MySqlPool) -> AnyhowResult<Option<UserToken>> {
  let username = username.to_lowercase();

  // NB: Lookup failure is Err(RowNotFound).
  let result = sqlx::query_as!(
    UsernameRecord,
        r#"
SELECT
  token as `token: tokens::users::user::UserToken`
FROM users
  WHERE username = ?
LIMIT 1
        "#,
        username
    )
      .fetch_one(pool)
      .await;

  match result {
    Ok(record) => Ok(Some(record.token)),
    Err(sqlx::Error::RowNotFound) => Ok(None),
    Err(err) => Err(anyhow!("query error: {:?}", err)),
  }
}

struct UsernameRecord {
  token: UserToken,
}
