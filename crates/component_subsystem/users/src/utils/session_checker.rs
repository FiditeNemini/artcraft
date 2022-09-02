// NB: Incrementally getting rid of build warnings...
#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

use actix_web::HttpRequest;
use container_common::anyhow_result::AnyhowResult;
use crate::utils::session_cookie_manager::SessionCookieManager;
use database_queries::queries::users::user_sessions::get_session_by_token::{get_session_by_token, SessionUserRecord};
use database_queries::queries::users::user_sessions::get_session_by_token_light::{get_session_by_token_light, SessionRecord};
use sqlx::pool::PoolConnection;
use sqlx::{MySqlPool, MySql};

#[derive(Clone)]
pub struct SessionChecker {
  cookie_manager: SessionCookieManager,
}

impl SessionChecker {

  pub fn new(cookie_manager: &SessionCookieManager) -> Self {
    Self {
      cookie_manager: cookie_manager.clone(),
    }
  }

  #[deprecated = "Use the PoolConnection<MySql> method instead of the MySqlPool one."]
  pub async fn maybe_get_session(
    &self,
    request: &HttpRequest,
    pool: &MySqlPool
  ) -> AnyhowResult<Option<SessionRecord>>
  {
    let mut connection = pool.acquire().await?;
    self.maybe_get_session_from_connection(request, &mut connection).await
  }

  pub async fn maybe_get_session_from_connection(
    &self,
    request: &HttpRequest,
    mysql_connection: &mut PoolConnection<MySql>,
  ) -> AnyhowResult<Option<SessionRecord>>
  {
    let session_token = match self.cookie_manager.decode_session_token_from_request(request)? {
      None => return Ok(None),
      Some(session_token) => session_token,
    };

    get_session_by_token_light(mysql_connection, &session_token).await
  }


  #[deprecated = "Use the PoolConnection<MySql> method instead of the MySqlPool one."]
  pub async fn maybe_get_user_session(
    &self,
    request: &HttpRequest,
    pool: &MySqlPool,
  ) -> AnyhowResult<Option<SessionUserRecord>>
  {
    let mut connection = pool.acquire().await?;
    self.maybe_get_user_session_from_connection(request, &mut connection).await
  }

  pub async fn maybe_get_user_session_from_connection(
    &self,
    request: &HttpRequest,
    mysql_connection: &mut PoolConnection<MySql>,
  ) -> AnyhowResult<Option<SessionUserRecord>>
  {
    let session_token = match self.cookie_manager.decode_session_token_from_request(request)? {
      None => return Ok(None),
      Some(session_token) => session_token,
    };

    get_session_by_token(mysql_connection, &session_token).await
  }
}

