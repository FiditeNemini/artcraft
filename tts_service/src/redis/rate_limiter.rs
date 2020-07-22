use limitation::{Limiter, Status, Error as LimitationError};
use std::time::Duration;
use std::thread;
use futures::{future, Future};

pub struct RateLimiter {
  limiter: Limiter,
}

pub enum RateLimiterError {
  // Fail open
  //TimeoutError,
  //RedisError,
  //OtherError,
  // Fail closed
  RateLimitExceededError,
}

enum ErrorOrTimeoutInternal {
  Error(LimitationError),
  PermitAcquireTimeout,
}

impl RateLimiter {
  pub fn new(limiter: Limiter) -> Self {
    RateLimiter {
      limiter,
    }
  }

  pub fn acquire_with_timeout(&self, rate_limit_key: &str, timeout_duration: Duration) -> Result<(), RateLimiterError> {
    let permit = self.limiter.count(rate_limit_key)
        .map_err(|e| ErrorOrTimeoutInternal::Error(e));

    let permit_timeout = future::lazy(|| {
      thread::sleep(timeout_duration);
      future::err::<Status, ErrorOrTimeoutInternal>(ErrorOrTimeoutInternal::PermitAcquireTimeout)
    });

    let result = permit.select(permit_timeout).wait();

    match result {
      // We could return information about our remaining permits...
      Ok((permitted_status, _timeout_future)) => Ok(()),
      Err((permitted_status, timeout_error)) => {
        match permitted_status {
          // We hit our self imposed timeout.
          ErrorOrTimeoutInternal::PermitAcquireTimeout => {
            warn!("Timeout attempting to talk to redis.");
            Ok(())
          },
          ErrorOrTimeoutInternal::Error(limit_error) => match limit_error {
            LimitationError::Client(_) => {
              warn!("Redis failure. Failing open.");
              Ok(())
            },
            LimitationError::Time(_) => {
              warn!("Time parsing failure. Failing open.");
              Ok(())
            },
            LimitationError::LimitExceeded(status) => Err(RateLimiterError::RateLimitExceededError),
          }
        }
      }
    }
  }
}
