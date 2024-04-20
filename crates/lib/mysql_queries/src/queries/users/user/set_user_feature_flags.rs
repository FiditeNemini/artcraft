use anyhow::anyhow;
use sqlx::MySqlPool;

use errors::AnyhowResult;
use tokens::tokens::users::UserToken;

pub struct SetUserFeatureFlagArgs<'a> {
  pub subject_user_token: &'a UserToken,

  // Comma separated string of feature flags.
  pub maybe_feature_flags: Option<&'a str>,

  pub mod_user_token: &'a UserToken,
  pub mysql_pool: &'a MySqlPool,
}

pub async fn set_user_feature_flags(args: SetUserFeatureFlagArgs<'_>) -> AnyhowResult<()> {
  let query_result = sqlx::query!(
        r#"
UPDATE users
SET
    maybe_feature_flags = ?,
    maybe_mod_user_token = ?,
    version = version + 1

WHERE users.token = ?
LIMIT 1
        "#,
      args.maybe_feature_flags,
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
