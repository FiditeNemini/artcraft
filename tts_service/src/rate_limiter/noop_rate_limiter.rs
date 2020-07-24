use crate::rate_limiter::rate_limiter::{RateLimiter, RateLimiterError};
use actix_web::HttpRequest;
use actix_web::http::HeaderMap;

pub struct NoOpRateLimiter {}

impl RateLimiter for NoOpRateLimiter {
  fn maybe_ratelimit_request(&self, ip_address: &str, headers: &HeaderMap) -> Result<(), RateLimiterError> {
    Ok(())
  }

  fn acquire(&self, rate_limit_key: &str) -> Result<(), RateLimiterError> {
    Ok(())
  }
}