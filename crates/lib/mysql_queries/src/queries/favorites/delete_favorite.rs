use sqlx::{Executor, MySql};

use errors::AnyhowResult;
use tokens::tokens::favorites::FavoriteToken;
use tokens::tokens::users::UserToken;

// NB: UserToken is only supplied as an optimistic form of validation
pub async fn delete_favorite<'e, 'c, E>(
  favorite_token: &'e FavoriteToken,
  user_token: &'e UserToken,
  mysql_executor: E
)
  -> AnyhowResult<()>
  where E: 'e + Executor<'c, Database = MySql>
{

    sqlx::query!(
      r#"
UPDATE favorites
SET
deleted_at = CURRENT_TIMESTAMP,
version = version + 1
WHERE
token = ?
AND user_token = ?
LIMIT 1
      "#,
      favorite_token,
      user_token
    )
    .execute(mysql_executor)
    .await?;

  Ok(())
}
