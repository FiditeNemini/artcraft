// NB: Incrementally getting rid of build warnings...
#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

use actix_web::HttpRequest;
use actix_web::cookie::Cookie;
use anyhow::anyhow;
use container_common::anyhow_result::AnyhowResult;
use hmac::Hmac;
use hmac::NewMac;
use jwt::SignWithKey;
use jwt::VerifyWithKey;
use log::warn;
use sha2::Sha256;
use std::collections::BTreeMap;
use time::OffsetDateTime;

const COOKIE_VERSION : u32 = 1;

const SESSION_COOKIE_NAME : &'static str = "session";

// TODO(echelon,2022-08-29): Make a CryptedCookieManager that this uses.
// TODO(echelon,2022-08-29): Fix how domains and "secure" cookies are handled

#[derive(Clone)]
pub struct SessionCookieManager {
  cookie_domain: String,
  hmac_secret: String,
}

impl SessionCookieManager {
  pub fn new(cookie_domain: &str, hmac_secret: &str) -> Self {
    Self {
      cookie_domain: cookie_domain.to_string(),
      hmac_secret: hmac_secret.to_string(),
    }
  }

  pub fn create_cookie(&self, session_token: &str) -> AnyhowResult<Cookie> {
    let key: Hmac<Sha256> = Hmac::new_varkey(self.hmac_secret.as_bytes())
      .map_err(|e| anyhow!("invalid hmac: {:?}", e))?;

    let cookie_version = COOKIE_VERSION.to_string();

    let mut claims = BTreeMap::new();
    claims.insert("session_token", session_token);
    claims.insert("cookie_version", &cookie_version);

    let jwt_string = claims.sign_with_key(&key)?;

    let make_secure = !self.cookie_domain.to_lowercase().contains("jungle.horse")
      && !self.cookie_domain.to_lowercase().contains("localhost");

    Ok(Cookie::build(SESSION_COOKIE_NAME, jwt_string)
      //.domain(&self.cookie_domain)
      .secure(make_secure) // HTTPS-only
      //.path("/")
      //.http_only(true) // Not exposed to Javascript
      //.expires(OffsetDateTime::now_utc() + time::Duration::days(365))
      .permanent()
      //.same_site(SameSite::Lax)
      .finish())
  }

  pub fn delete_cookie(&self) -> Cookie {
    Cookie::build(SESSION_COOKIE_NAME, "DELETED")
      .expires(OffsetDateTime::unix_epoch())
      .finish()
  }

  pub fn decode_session_token(&self, session_cookie: &Cookie) -> AnyhowResult<String> {
    let key: Hmac<Sha256> = Hmac::new_varkey(self.hmac_secret.as_bytes())
      .map_err(|e| anyhow!("invalid hmac: {:?}", e))?;

    let cookie_contents = session_cookie.value().to_string();

    let claims: BTreeMap<String, String> = cookie_contents.verify_with_key(&key)?;

    let session_token = claims["session_token"].clone();

    Ok(session_token)
  }

  pub fn decode_session_token_from_request(&self, request: &HttpRequest)
    -> AnyhowResult<Option<String>>
  {
    let cookie = match request.cookie(SESSION_COOKIE_NAME) {
      None => return Ok(None),
      Some(cookie) => cookie,
    };

    match self.decode_session_token(&cookie) {
      Err(e) => {
        warn!("Session cookie decode error: {:?}", e);
        Err(anyhow!("Could not decode session cookie: {:?}", e))
      },
      Ok(payload) => Ok(Some(payload)),
    }
  }
}

