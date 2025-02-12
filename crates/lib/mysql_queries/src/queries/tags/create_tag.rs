use crate::errors::database_insert_error::DatabaseInsertError;
use crate::utils::transactor::Transactor;
use tokens::tokens::tags::TagToken;

pub async fn create_tag(
  tag: &str,
  transactor: Transactor<'_, '_>,
) -> Result<TagToken, DatabaseInsertError>
{
  let tag = tag.trim().to_lowercase();
  let token = TagToken::generate();

  let query = sqlx::query!(
        r#"
INSERT INTO tags
SET
  token = ?,
  tag_value = ?
        "#,
      token,
      tag,
    );

  let _r = transactor.execute(query).await?;

  Ok(token)
}
