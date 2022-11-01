use anyhow::anyhow;
use container_common::anyhow_result::AnyhowResult;
use crate::tokens::Tokens;
use log::{info, warn};
use sqlx::MySqlPool;

pub async fn create_user_session(user_token: &str, ip_address: &str, mysql_pool: &MySqlPool)
    -> AnyhowResult<String>
{
  let session_token = Tokens::new_session()?;

  let query_result = sqlx::query!(
        r#"
INSERT INTO user_sessions (
  token,
  user_token,
  ip_address_creation,
  expires_at
)
VALUES ( ?, ?, ?, NOW() + interval 1 year )
        "#,
        session_token.to_string(),
        user_token.to_string(),
        ip_address.to_string(),
    )
    .execute(mysql_pool)
    .await;

  let record_id = match query_result {
    Ok(res) => {
      res.last_insert_id()
    },
    Err(err) => {
      return Err(anyhow!("session creation DB error: {:?}", err));
    }
  };

  info!("Created session id: {}", record_id);

  Ok(session_token)
}
