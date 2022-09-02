use container_common::anyhow_result::AnyhowResult;
use sqlx::MySqlPool;

pub async fn delete_session(session_token: &str, mysql_pool: &MySqlPool) -> AnyhowResult<()> {
  let query_result = sqlx::query!(
        r#"
UPDATE user_sessions
SET deleted_at = CURRENT_TIMESTAMP()
WHERE
    token = ?
    AND deleted_at IS NULL
        "#,
        session_token.to_string(),
    )
      .execute(mysql_pool)
      .await;

  Ok(())
}
