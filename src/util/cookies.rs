use actix_web::cookie::Cookie;
use anyhow::anyhow;
use crate::AnyhowResult;
use hmac::Hmac;
use hmac::NewMac;
use std::collections::BTreeMap;
use sha2::Sha256;
use jwt::SignWithKey;

const COOKIE_VERSION : u32 = 1;

#[derive(Clone)]
pub struct CookieManager {
  cookie_domain: String,
  hmac_secret: String,
}

impl CookieManager {
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

    Ok(Cookie::build("session", jwt_string)
      .domain(&self.cookie_domain)
      .path("/")
      .secure(true) // HTTPS-only
      .http_only(true) // Not exposed to Javascript
      .finish())
  }
}

