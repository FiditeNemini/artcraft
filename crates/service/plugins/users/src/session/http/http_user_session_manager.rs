// NB: Incrementally getting rid of build warnings...
#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

use std::collections::BTreeMap;

use actix_web::cookie::{Cookie, SameSite};
use actix_web::cookie::time::OffsetDateTime;
use actix_web::HttpRequest;
use anyhow::anyhow;
use log::warn;

use cookies::jwt_signer::JwtSigner;
use errors::AnyhowResult;

use crate::session::http::http_user_session_payload::HttpUserSessionPayload;

/**
 * Cookie version history
 *
 *  Version 1: Claims include "session_token" and "cookie_version"
 *  Version 2: The "user_token" is added to the claims, and the version is bumped to "2"
 */
const COOKIE_VERSION : u32 = 2;

/// Name of the HTTP cookie that carries the session payload
const SESSION_COOKIE_NAME : &str = "session";

/// Name of the HTTP header that carries the session payload
const SESSION_HEADER_NAME : &str = "session";

// TODO(echelon,2022-08-29): Make a CryptedCookieManager that this uses.
// TODO(echelon,2022-08-29): Fix how domains and "secure" cookies are handled

#[derive(Clone)]
pub struct HttpUserSessionManager {
  cookie_domain: String,
  jwt_signer: JwtSigner,
}

impl HttpUserSessionManager {
  pub fn new(cookie_domain: &str, hmac_secret: &str) -> AnyhowResult<Self> {
    Ok(Self {
      cookie_domain: cookie_domain.to_string(),
      jwt_signer: JwtSigner::new(hmac_secret)?
    })
  }

  pub fn create_cookie(&self, session_token: &str, user_token: &str) -> AnyhowResult<Cookie> {
    let cookie_version = COOKIE_VERSION.to_string();

    let mut claims = BTreeMap::new();
    claims.insert("session_token", session_token);
    claims.insert("user_token", user_token);
    claims.insert("cookie_version", &cookie_version);

    let jwt_string = self.jwt_signer.claims_to_jwt(&claims)?;

    let make_secure = !self.cookie_domain.to_lowercase().contains("jungle.horse")
      && !self.cookie_domain.to_lowercase().contains("localhost");

    let same_site = if make_secure {
      SameSite::None // NB: Allow usage from other domains
    } else {
      SameSite::Lax // NB: You can't set "SameSite=None" on non-secure cookies
    };

    Ok(Cookie::build(SESSION_COOKIE_NAME, jwt_string)
      .secure(make_secure) // HTTPS-only
      .same_site(same_site)
      .permanent()
      .path("/") // NB: Otherwise it'll be set to `/v1`
      //.domain(&self.cookie_domain)
      //.http_only(true) // Not exposed to Javascript
      //.expires(OffsetDateTime::now_utc() + time::Duration::days(365))
      .finish())
  }

  pub fn delete_cookie(&self) -> Cookie {
    let mut cookie = Cookie::build(SESSION_COOKIE_NAME, "DELETED")
      .path("/") // NB: Otherwise it'll be set to `/v1`
      .expires(OffsetDateTime::UNIX_EPOCH)
      .finish();
    cookie.make_removal();
    cookie
  }

  pub fn decode_session_payload_from_request(
    &self,
    request: &HttpRequest
  ) -> AnyhowResult<Option<HttpUserSessionPayload>>
  {
    let mut signed_session_payload= request.cookie(SESSION_COOKIE_NAME)
        .map(|cookie| cookie.value().to_string());

    if signed_session_payload.is_none() {
      signed_session_payload = request.headers().get(SESSION_HEADER_NAME)
          .map(|header| header.to_str())
          .transpose()?
          .map(|payload| payload.to_string());
    }

    let signed_session_payload = match signed_session_payload {
      Some(payload) => payload,
      None => return Ok(None),
    };

    match self.decode_session_cookie_payload(&signed_session_payload) {
      Err(e) => {
        warn!("Session cookie decode error: {:?}", e);
        Err(anyhow!("Could not decode session cookie: {:?}", e))
      },
      Ok(payload) => Ok(Some(payload)),
    }
  }

  fn decode_session_cookie_payload(&self, session_payload_contents: &str)
    -> AnyhowResult<HttpUserSessionPayload>
  {
    let claims = self.jwt_signer.jwt_to_claims(&session_payload_contents)?;

    let session_token = claims["session_token"].clone();
    let maybe_user_token = claims.get("user_token")
        .map(|t| t.to_string());

    Ok(HttpUserSessionPayload {
      session_token,
      maybe_user_token,
    })
  }
}

#[cfg(test)]
mod tests {
  use crate::session::http::http_user_session_manager::HttpUserSessionManager;

  #[test]
  fn test_cookie_payload() {
    // NB: Let's make extra sure this always works when migrating cookies, else we'll accidentally log out logged-in users.
    // (These are version 2 cookies.)
    let manager = HttpUserSessionManager::new("fakeyou.com", "secret").unwrap();
    let cookie = manager.create_cookie("ex_session_token", "ex_user_token").unwrap();

    assert_eq!(cookie.value(), "eyJhbGciOiJIUzI1NiJ9.eyJjb29raWVfdmVyc2lvbiI6IjIiLCJzZXNzaW9uX3Rva2VuIjoiZXhfc2Vzc2lvbl90b2tlbiIsInVzZXJfdG9rZW4iOiJleF91c2VyX3Rva2VuIn0.94ly2gHhlPVtnANsNy6cJozFVmId4imwW5v-mei7jD8");
  }

  #[test]
  fn test_cookie_round_trip() {
    // NB: Let's make extra sure this always works when migrating cookies, else we'll accidentally log out logged-in users.
    // (These are version 2 cookies.)
    let manager = HttpUserSessionManager::new("fakeyou.com", "secret").unwrap();
    let cookie = manager.create_cookie("ex_session_token", "ex_user_token").unwrap();

    let decoded = manager.decode_session_cookie_payload(cookie.value()).unwrap();

    assert_eq!(decoded.session_token, "ex_session_token".to_string());
    assert_eq!(decoded.maybe_user_token, Some("ex_user_token".to_string()));
  }
}
