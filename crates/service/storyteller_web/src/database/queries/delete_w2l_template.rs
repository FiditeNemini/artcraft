use container_common::anyhow_result::AnyhowResult;
use sqlx::MySqlPool;

pub async fn delete_w2l_template_as_user(
  template_token: &str,
  creator_ip_address: &str,
  mysql_pool: &MySqlPool
) -> AnyhowResult<()> {
  let _r = sqlx::query!(
        r#"
UPDATE w2l_templates
SET
  creator_ip_address_last_update = ?,
  user_deleted_at = CURRENT_TIMESTAMP
WHERE
  token = ?
LIMIT 1
        "#,
      creator_ip_address,
      template_token,
    )
      .execute(mysql_pool)
      .await?;
  Ok(())
}

pub async fn delete_w2l_template_as_mod(
  template_token: &str,
  mod_user_token: &str,
  mysql_pool: &MySqlPool
) -> AnyhowResult<()> {
  let _r = sqlx::query!(
        r#"
UPDATE w2l_templates
SET
  maybe_mod_user_token = ?,
  mod_deleted_at = CURRENT_TIMESTAMP
WHERE
  token = ?
LIMIT 1
        "#,
      mod_user_token,
      template_token,
    )
      .execute(mysql_pool)
      .await?;
  Ok(())
}

pub async fn undelete_w2l_template_as_user(
  template_token: &str,
  creator_ip_address: &str,
  mysql_pool: &MySqlPool
) -> AnyhowResult<()> {
  let _r = sqlx::query!(
        r#"
UPDATE w2l_templates
SET
  creator_ip_address_last_update = ?,
  user_deleted_at = NULL
WHERE
  token = ?
LIMIT 1
        "#,
      creator_ip_address,
      template_token,
    )
      .execute(mysql_pool)
      .await?;
  Ok(())
}

pub async fn undelete_w2l_template_as_mod(
  template_token: &str,
  mod_user_token: &str,
  mysql_pool: &MySqlPool
) -> AnyhowResult<()> {
  let _r = sqlx::query!(
        r#"
UPDATE w2l_templates
SET
  maybe_mod_user_token = ?,
  mod_deleted_at = NULL
WHERE
  token = ?
LIMIT 1
        "#,
      mod_user_token,
      template_token,
    )
      .execute(mysql_pool)
      .await?;
  Ok(())
}
