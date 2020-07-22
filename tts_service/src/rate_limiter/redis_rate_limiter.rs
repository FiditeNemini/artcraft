use limitation::{Limiter, Status, Error as LimitationError, Error};
use std::time::Duration;
use std::thread;
use futures::{future, Future};
use crate::rate_limiter::redis_rate_limiter::RateLimiterError::RateLimitExceededError;
use crate::rate_limiter::{RateLimiterError, RateLimiter};

pub struct RedisRateLimiter {
  limiter: Limiter,
}

enum ErrorOrTimeoutInternal {
  Error(LimitationError),
  PermitAcquireTimeout,
}

impl RedisRateLimiter {
  pub fn new(limiter: Limiter) -> Self {
    RedisRateLimiter {
      limiter,
    }
  }

  fn _acquire_with_timeout(&self, rate_limit_key: &str, timeout_duration: Duration) -> Result<(), RateLimiterError> {
    let permit = self.limiter.count(rate_limit_key)
        .map_err(|e| ErrorOrTimeoutInternal::Error(e));

    // TODO: This is mostly in the correct shape, but the control flow is wrong. The
    //  self-imposed timeout is always triggered and the "warning" branch about timing out is
    //  always hit, which offers zero protection.
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

impl RateLimiter for RedisRateLimiter {
  fn acquire(&self, rate_limit_key: &str) -> Result<(), RateLimiterError> {
    let permit = self.limiter.count(rate_limit_key)
        .map_err(|e| ErrorOrTimeoutInternal::Error(e));

    // TODO: Theoretically this could block.
    match permit.wait() {
      Ok(_) => Ok(()),
      Err(err) => match err {
        ErrorOrTimeoutInternal::PermitAcquireTimeout => Ok(()),
        ErrorOrTimeoutInternal::Error(err) => match err {
          Error::Client(_) => Ok(()),
          Error::Time(_) => Ok(()),
          Error::LimitExceeded(_) => Err(RateLimiterError::RateLimitExceededError),
        },
      },
    }
  }
}

