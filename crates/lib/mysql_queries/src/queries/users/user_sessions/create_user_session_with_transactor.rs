use anyhow::anyhow;
use log::info;
use sqlx::MySqlPool;

use crate::utils::transactor::Transactor;
use errors::AnyhowResult;
use tokens::tokens::user_sessions::UserSessionToken;

pub async fn create_user_session_with_transactor(
  user_token: &str,
  ip_address: &str,
  mut transactor: Transactor<'_, '_>
)
    -> AnyhowResult<String>
{
  let session_token = UserSessionToken::generate().to_string();

  let query = sqlx::query!(
        r#"
INSERT INTO user_sessions (
  token,
  user_token,
  ip_address_creation,
  expires_at
)
VALUES ( ?, ?, ?, NOW() + interval 1 year )
        "#,
        session_token,
        user_token.to_string(),
        ip_address.to_string(),
    );

  let query_result = transactor.execute(query).await;

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
