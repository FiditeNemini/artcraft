use anyhow::anyhow;
use sqlx::MySqlPool;

use errors::AnyhowResult;

pub async fn set_w2l_template_mod_approval(
  w2l_template_token: &str,
  mod_user_token: &str,
  is_approved: bool,
  mysql_pool: &MySqlPool,
) -> AnyhowResult<()> {

  let query_result = sqlx::query!(
        r#"
UPDATE w2l_templates
SET
  is_public_listing_approved = ?,
  maybe_mod_user_token = ?
WHERE
  token = ?
LIMIT 1
        "#,

      is_approved,
      mod_user_token,
      w2l_template_token,
    )
      .execute(mysql_pool)
      .await;

  match query_result {
    Ok(_) => Ok(()),
    Err(err) => Err(anyhow!("error setting w2l mod approval status: {:?}", err)),
  }
}