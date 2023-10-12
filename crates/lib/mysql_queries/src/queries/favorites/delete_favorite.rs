use sqlx::{Executor, MySql};

use errors::AnyhowResult;
use tokens::tokens::favorites::FavoriteToken;

#[derive(Copy, Clone)]
pub enum DeleteFavoriteAs {
  Author,
  Moderator,
}

pub async fn delete_favorite<'e, 'c, E>(
  favorite_token: &'e FavoriteToken,
  delete_as: DeleteFavoriteAs,
  mysql_executor: E
)
  -> AnyhowResult<()>
  where E: 'e + Executor<'c, Database = MySql>
{

  match delete_as {
    DeleteFavoriteAs::Author => {
      sqlx::query!(
        r#"
UPDATE favorites
SET
  user_deleted_at = CURRENT_TIMESTAMP,
  version = version + 1
WHERE
  token = ?
LIMIT 1
        "#,
        favorite_token
      )
    }
    DeleteFavoriteAs::Moderator => {
      sqlx::query!(
        r#"
UPDATE favorites
SET
  mod_deleted_at = CURRENT_TIMESTAMP,
  version = version + 1
WHERE
  token = ?
LIMIT 1
        "#,
        favorite_token
      )
    }
  }
      .execute(mysql_executor)
      .await?;

  Ok(())
}
