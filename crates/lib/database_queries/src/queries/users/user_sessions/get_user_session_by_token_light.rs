// NB: Incrementally getting rid of build warnings...
#![forbid(unused_imports)]
#![forbid(unused_mut)]

use anyhow::anyhow;
use container_common::anyhow_result::AnyhowResult;
use log::warn;
use sqlx::MySql;
use sqlx::pool::PoolConnection;

pub struct SessionRecord {
  pub session_token: String,
  pub user_token: String,
}
pub async fn get_user_session_by_token_light(
  mysql_connection: &mut PoolConnection<MySql>,
  session_token: &str,
) -> AnyhowResult<Option<SessionRecord>> {

  // NB: Lookup failure is Err(RowNotFound).
  let maybe_session_record = sqlx::query_as!(
      SessionRecord,
        r#"
SELECT
    token as session_token,
    user_token
FROM user_sessions
WHERE token = ?
AND deleted_at IS NULL
        "#,
        session_token,
    )
      .fetch_one(mysql_connection)
      .await;

  match maybe_session_record {
    Ok(session_record) => Ok(Some(session_record)),
    Err(err) => {
      match err {
        RowNotFound => {
          warn!("Valid cookie; invalid session: {}", session_token);
          Ok(None)
        },
        _ => {
          warn!("Session query error: {:?}", err);
          Err(anyhow!("session query error: {:?}", err))
        }
      }
    }
  }
}
