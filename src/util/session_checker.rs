use crate::util::cookies::CookieManager;
use sqlx::MySqlPool;
use crate::AnyhowResult;
use actix_web::HttpRequest;

#[derive(Clone)]
pub struct SessionChecker {
  cookie_manager: CookieManager,
}

pub struct SessionRecord {
  session_token: String,
  user_token: String,
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
    let session_record = sqlx::query_as!(
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
      .await?; // TODO: This will return error if it doesn't exist

    Ok(Some(session_record))
  }

  /*pub async fn maybe_get_user(request: &HttpRequest, pool: &MySqlPool)
    -> AnyhowResult<SessionUserRecord>
  {
    Ok(SessionUserRecord {

    })
  }*/
}