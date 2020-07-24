use actix_web::HttpRequest;
use actix_web::http::header::HeaderMap;

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
  /// Potentially try to rate limit.
  /// Certain headers can be used to bypass.
  fn maybe_ratelimit_request(&self, ip_address: &str, headers: &HeaderMap) -> Result<(), RateLimiterError>;

  /// Attempt to acquire the rate limiter.
  fn acquire(&self, rate_limit_key: &str) -> Result<(), RateLimiterError>;
}
