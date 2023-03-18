use sqlx::MySqlPool;
use errors::AnyhowResult;
use tokens::tokens::comments::CommentToken;

#[derive(Copy, Clone)]
pub enum DeleteCommentAs {
  Author,
  Moderator,
  ObjectOwner,
}

pub async fn delete_comment(
  comment_token: &CommentToken,
  delete_as: DeleteCommentAs,
  mysql_pool: &MySqlPool
) -> AnyhowResult<()> {

  match delete_as {
    DeleteCommentAs::Author => {
      sqlx::query!(
        r#"
UPDATE comments
SET
  user_deleted_at = CURRENT_TIMESTAMP,
  version = version + 1
WHERE
  token = ?
LIMIT 1
        "#,
        comment_token
      )
    }
    DeleteCommentAs::Moderator => {
      sqlx::query!(
        r#"
UPDATE comments
SET
  mod_deleted_at = CURRENT_TIMESTAMP,
  version = version + 1
WHERE
  token = ?
LIMIT 1
        "#,
        comment_token
      )
    }
    DeleteCommentAs::ObjectOwner => {

      sqlx::query!(
        r#"
UPDATE comments
SET
  object_owner_deleted_at = CURRENT_TIMESTAMP,
  version = version + 1
WHERE
  token = ?
LIMIT 1
        "#,
        comment_token
      )
    }
  }
      .execute(mysql_pool)
      .await?;

  Ok(())
}
