use anyhow::anyhow;
use sqlx::MySqlPool;

use errors::AnyhowResult;
use tokens::tokens::users::UserToken;

pub struct SetUserBanStatsArgs<'a> {
  pub subject_user_token: &'a UserToken,
  pub is_banned: bool,
  pub mod_user_token: &'a UserToken,
  pub maybe_mod_comments: Option<&'a str>,
  pub mysql_pool: &'a MySqlPool,
}

pub async fn set_user_ban_status(args: SetUserBanStatsArgs<'_>) -> AnyhowResult<()> {
  let query_result = sqlx::query!(
        r#"
UPDATE users
SET
    is_banned = ?,
    maybe_mod_comments = ?,
    maybe_mod_user_token  = ?,
    version = version + 1

WHERE users.token = ?
LIMIT 1
        "#,
      args.is_banned,
      args.maybe_mod_comments,
      args.mod_user_token,
      args.subject_user_token,
    )
      .execute(args.mysql_pool)
      .await;

  match query_result {
    Ok(_) => Ok(()),
    Err(err) => Err(anyhow!("error with query: {:?}", err)),
  }
}
