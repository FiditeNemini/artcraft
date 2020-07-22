use crate::rate_limiter::{RateLimiter, RateLimiterError};

pub struct NoOpRateLimiter {}

impl RateLimiter for NoOpRateLimiter {
  fn acquire(&self, rate_limit_key: &str) -> Result<(), RateLimiterError> {
    Ok(())
  }
}