use actix_http::http::{HeaderName, HeaderMap};
use actix_web::HttpRequest;
use crate::http_server::web_utils::ip_address::get_request_ip;
use futures_old_for_limiter::Future;
use limitation::{Limiter, Error};
use log::info;

/// If this HTTP header is set, the rate limiter can be bypassed (eg. for debugging)
const RATE_LIMIT_BYPASS_HEADER : &'static str = "limitless";

#[derive(Clone)] // NB: Limiter is `Clone`
pub struct RedisRateLimiter {
  limiter: Limiter,
  limiter_enabled: bool,
  rate_limit_bypass_header: HeaderName,
}

pub enum RateLimiterError {
  RateLimitExceededError,
  ClientError, // NB: Fail open for this!
}

impl RedisRateLimiter {
  pub fn new(limiter: Limiter, limiter_enabled: bool) -> Self {
    let rate_limit_bypass_header = HeaderName::from_static(RATE_LIMIT_BYPASS_HEADER);
    RedisRateLimiter {
      limiter,
      limiter_enabled,
      rate_limit_bypass_header,
    }
  }

  pub fn rate_limit_request(&self, request: &HttpRequest) -> Result<(), RateLimiterError> {
    if !self.limiter_enabled {
      return Ok(())
    }

    let headers = request.headers();
    if headers.contains_key(&self.rate_limit_bypass_header) {
      info!("Bypassing rate limiter with special bypass/debug header.");
      return Ok(());
    }

    let ip_address = get_request_ip(&request);

    let rate_limit_key = format!("rate_limit:{}", ip_address);
    self.rate_limit_key(&rate_limit_key)
  }

  pub fn rate_limit_key(&self, rate_limit_key: &str) -> Result<(), RateLimiterError> {
    if !self.limiter_enabled {
      return Ok(())
    }

    // NB: This library uses old-school futures (pre-async/await)
    let permit = self.limiter.count(rate_limit_key);

    // TODO/FIXME: This could block.
    match permit.wait() {
      Ok(_) => Ok(()),
      Err(err) => match err {
        Error::Client(_) => Ok(()), // NB: Fail open for failure to connect to Redis
        Error::Time(_) => Ok(()), // NB: Fail open for key parsing
        Error::LimitExceeded(_) => Err(RateLimiterError::RateLimitExceededError),
      },
    }
  }
}
