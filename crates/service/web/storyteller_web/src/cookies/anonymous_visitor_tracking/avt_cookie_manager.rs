use actix_web::cookie::Cookie;
use actix_web::HttpRequest;
use anyhow::anyhow;
use log::warn;

use cookies::jwt_signer::JwtSigner;
use errors::AnyhowResult;

use crate::cookies::anonymous_visitor_tracking::avt_cookie_payload::AvtCookiePayload;

const VISITOR_COOKIE_NAME : &str = "visitor";

/// Handle "anonymous visitor tracking" cookies.
/// This enables us to associate results with an anonymous user for a better experience,
/// as well as do some form of return visitor tracking.
pub struct AvtCookieManager {
  cookie_domain: String,
  jwt_signer: JwtSigner,
}

impl AvtCookieManager {

  pub fn new(cookie_domain: &str, hmac_secret: &str) -> AnyhowResult<Self> {
    Ok(Self {
      cookie_domain: cookie_domain.to_string(),
      jwt_signer: JwtSigner::new(hmac_secret)?,
    })
  }

  pub fn make_new_cookie(&self) -> AnyhowResult<Cookie> {
    let payload = AvtCookiePayload::new();
    let claims = payload.to_map();
    let jwt_string = self.jwt_signer.claims_to_jwt(&claims)?;

    let make_secure = !self.cookie_domain.to_lowercase().contains("jungle.horse")
        && !self.cookie_domain.to_lowercase().contains("localhost");

    Ok(Cookie::build(VISITOR_COOKIE_NAME, jwt_string)
        .secure(make_secure) // HTTPS-only
        .permanent()
        //.domain(&self.cookie_domain)
        //.path("/")
        //.http_only(true) // Not exposed to Javascript
        //.expires(OffsetDateTime::now_utc() + time::Duration::days(365))
        //.same_site(SameSite::Lax)
        .finish())
  }

  pub fn make_delete_cookie(&self) -> Cookie {
    let mut cookie = Cookie::build(VISITOR_COOKIE_NAME, "DELETED")
        .expires(actix_web::cookie::time::OffsetDateTime::UNIX_EPOCH)
        .finish();
    cookie.make_removal();
    cookie
  }

  pub fn decode_cookie_payload(&self, visitor_cookie: &Cookie) -> AnyhowResult<AvtCookiePayload> {
    let cookie_contents = visitor_cookie.value().to_string();
    let claims = self.jwt_signer.jwt_to_claims(&cookie_contents)?;
    let payload = AvtCookiePayload::from_map(claims)?;
    Ok(payload)
  }

  pub fn decode_cookie_payload_from_request(&self, request: &HttpRequest) -> AnyhowResult<Option<AvtCookiePayload>> {
    let cookie = match request.cookie(VISITOR_COOKIE_NAME) {
      None => return Ok(None),
      Some(cookie) => cookie,
    };

    match self.decode_cookie_payload(&cookie) {
      Err(e) => {
        warn!("Visitor cookie decode error: {:?}", e);
        Err(anyhow!("Could not decode visitor cookie: {:?}", e))
      },
      Ok(payload) => Ok(Some(payload)),
    }
  }
}
