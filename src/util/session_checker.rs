use actix_web::HttpRequest;
use anyhow::anyhow;
use crate::AnyhowResult;
use crate::util::cookies::CookieManager;
use log::{info, warn};
use sqlx::MySqlPool;
use sqlx::error::Error::RowNotFound;

#[derive(Clone)]
pub struct SessionChecker {
  cookie_manager: CookieManager,
}

pub struct SessionRecord {
  pub session_token: String,
  pub user_token: String,
}

pub struct SessionUserRecord {
  pub token: String,
  pub username: String,
  pub display_name: String,
  pub email_address: String,
  pub banned: bool,
}

impl SessionChecker {

  pub fn new(cookie_manager: &CookieManager) -> Self {
    Self {
      cookie_manager: cookie_manager.clone(),
    }
  }

  pub async fn maybe_get_session(&self, request: &HttpRequest, pool: &MySqlPool)
    -> AnyhowResult<Option<SessionRecord>>
  {
    let session_token = match self.cookie_manager.decode_session_token_from_request(request)? {
      None => return Ok(None),
      Some(session_token) => session_token,
    };

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
        session_token.to_string(),
    )
      .fetch_one(pool)
      .await; // TODO: This will return error if it doesn't exist

    match maybe_session_record {
      Ok(session_record) => {
        Ok(Some(session_record))
      },
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

  /*pub async fn maybe_get_user(request: &HttpRequest, pool: &MySqlPool)
    -> AnyhowResult<SessionUserRecord>
  {
    Ok(SessionUserRecord {

    })
  }*/
}