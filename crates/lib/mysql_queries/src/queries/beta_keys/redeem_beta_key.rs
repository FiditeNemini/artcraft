use sqlx::{Executor, MySql};

use errors::AnyhowResult;
use tokens::tokens::users::UserToken;

pub async fn redeem_beta_key<'e, 'c, E>(
  key_value: &'e str,
  redeemer_user_token: &'e UserToken,
  mysql_executor: E
)
  -> AnyhowResult<()>
  where E: 'e + Executor<'c, Database = MySql>
{
      sqlx::query!(
        r#"
UPDATE beta_keys
SET
  maybe_redeemer_user_token = ?,
  maybe_redeemed_at = CURRENT_TIMESTAMP
WHERE
  key_value = ?
LIMIT 1
        "#,
       redeemer_user_token.as_str(),
       key_value
      )
      .execute(mysql_executor)
      .await?;

  Ok(())
}
