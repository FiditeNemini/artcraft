use actix_web::HttpRequest;
use anyhow::anyhow;
use crate::AnyhowResult;
use crate::http_server::web_utils::cookie_manager::CookieManager;
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
  pub user_token: String,
  pub username: String,
  pub display_name: String,
  pub email_address: String,
  pub email_confirmed: i8,
  pub profile_markdown: String,
  pub profile_rendered_html: String,
  pub user_role_slug: String,
  pub banned: i8,
  pub dark_mode: String,
  pub avatar_public_bucket_hash: Option<String>,
  pub disable_gravatar: i8,
  pub hide_results_preference: i8,
  pub discord_username: Option<String>,
  pub twitch_username: Option<String>,
  pub twitter_username: Option<String>,
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

  pub async fn maybe_get_user_session(&self, request: &HttpRequest, pool: &MySqlPool)
    -> AnyhowResult<Option<SessionUserRecord>>
  {

    let session_token = match self.cookie_manager.decode_session_token_from_request(request)? {
      None => return Ok(None),
      Some(session_token) => session_token,
    };

    // NB: Lookup failure is Err(RowNotFound).
    let maybe_user_record = sqlx::query_as!(
      SessionUserRecord,
        r#"
SELECT
    users.token as user_token,
    username,
    display_name,
    email_address,
    email_confirmed,
    profile_markdown,
    profile_rendered_html,
    user_role_slug,
    banned,
    dark_mode,
    avatar_public_bucket_hash,
    disable_gravatar,
    hide_results_preference,
    discord_username,
    twitch_username,
    twitter_username
FROM users
LEFT OUTER JOIN user_sessions
ON users.token = user_sessions.user_token
WHERE user_sessions.token = ?
AND user_sessions.deleted_at IS NULL
AND users.deleted_at IS NULL
        "#,
        session_token.to_string(),
    )
      .fetch_one(pool)
      .await; // TODO: This will return error if it doesn't exist

    match maybe_user_record {
      Ok(user_record) => {
        Ok(Some(user_record))
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
}