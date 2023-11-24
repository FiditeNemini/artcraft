use sqlx::MySqlPool;
use errors::AnyhowResult;



pub async fn delete_weights_as_user(
    weight_token: &str,
    mysql_pool: &MySqlPool
) -> AnyhowResult<()> {
    let _r = sqlx
        ::query!(
            r#"
UPDATE model_weights
SET
  user_deleted_at = CURRENT_TIMESTAMP
WHERE
  token = ?
LIMIT 1
        "#,
            weight_token
        )
        .execute(mysql_pool).await?;
    Ok(())
}

pub async fn delete_voice_as_mod(weight_token: &str, mysql_pool: &MySqlPool) -> AnyhowResult<()> {
    let _r = sqlx
        ::query!(
            r#"
UPDATE model_weights
SET
  mod_deleted_at = CURRENT_TIMESTAMP
WHERE
  token = ?
LIMIT 1
        "#,
            weight_token
        )
        .execute(mysql_pool).await?;
    Ok(())
}

pub async fn undelete_weights_as_user(
    weight_token: &str,
    mysql_pool: &MySqlPool
) -> AnyhowResult<()> {
    let _r = sqlx
        ::query!(
            r#"
UPDATE model_weights
SET
  user_deleted_at = NULL
WHERE
  token = ?
LIMIT 1
        "#,
            weight_token
        )
        .execute(mysql_pool).await?;
    Ok(())
}

pub async fn undelete_weights_as_mod(
    weight_token: &str,
    mysql_pool: &MySqlPool
) -> AnyhowResult<()> {
    let _r = sqlx
        ::query!(
            r#"
UPDATE model_weights
SET
  mod_deleted_at = NULL
WHERE
  token = ?
LIMIT 1
        "#,
            weight_token
        )
        .execute(mysql_pool).await?;
    Ok(())
}
