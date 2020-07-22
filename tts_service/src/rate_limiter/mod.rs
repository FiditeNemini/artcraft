pub mod noop_rate_limiter;
pub mod redis_rate_limiter;

#[derive(Debug)]
pub enum RateLimiterError {
  // Fail open
  //TimeoutError,
  //RedisError,
  //OtherError,
  // Fail closed
  RateLimitExceededError,
}

pub trait RateLimiter : Send + Sync {
  /// Attempt to acquire the rate limiter
  fn acquire(&self, rate_limit_key: &str) -> Result<(), RateLimiterError>;
}
