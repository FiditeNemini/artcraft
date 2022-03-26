use container_common::anyhow_result::AnyhowResult;
use sqlx::MySqlPool;

pub async fn delete_tts_inference_result_as_user(
  inference_result_token: &str,
  mysql_pool: &MySqlPool
) -> AnyhowResult<()> {
  let _r = sqlx::query!(
        r#"
UPDATE tts_results
SET
  user_deleted_at = CURRENT_TIMESTAMP
WHERE
  token = ?
LIMIT 1
        "#,
      inference_result_token,
    )
      .execute(mysql_pool)
      .await?;
  Ok(())
}

pub async fn delete_tts_inference_result_as_mod(
  inference_result_token: &str,
  mod_user_token: &str,
  mysql_pool: &MySqlPool
) -> AnyhowResult<()> {
  let _r = sqlx::query!(
        r#"
UPDATE tts_results
SET
  mod_deleted_at = CURRENT_TIMESTAMP,
  maybe_mod_user_token = ?
WHERE
  token = ?
LIMIT 1
        "#,
      mod_user_token,
      inference_result_token,
    )
      .execute(mysql_pool)
      .await?;
  Ok(())
}

pub async fn undelete_tts_inference_result_as_user(
  inference_result_token: &str,
  mysql_pool: &MySqlPool
) -> AnyhowResult<()> {
  let _r = sqlx::query!(
        r#"
UPDATE tts_results
SET
  user_deleted_at = NULL
WHERE
  token = ?
LIMIT 1
        "#,
      inference_result_token,
    )
      .execute(mysql_pool)
      .await?;
  Ok(())
}

pub async fn undelete_tts_inference_result_as_mod(
  inference_result_token: &str,
  mod_user_token: &str,
  mysql_pool: &MySqlPool
) -> AnyhowResult<()> {
  let _r = sqlx::query!(
        r#"
UPDATE tts_results
SET
  mod_deleted_at = NULL,
  maybe_mod_user_token = ?
WHERE
  token = ?
LIMIT 1
        "#,
      mod_user_token,
      inference_result_token,
    )
      .execute(mysql_pool)
      .await?;
  Ok(())
}
