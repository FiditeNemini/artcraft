use crate::rate_limiter::rate_limiter::{RateLimiterError, RateLimiter};
use crate::rate_limiter::redis_rate_limiter::RateLimiterError::RateLimitExceededError;
use futures::{future, Future};
use limitation::{Limiter, Status, Error as LimitationError, Error};
use std::thread;
use std::time::Duration;
use actix_web::HttpRequest;
use crate::endpoints::helpers::ip_address::get_request_ip;
use actix_web::http::header::HeaderMap;
use actix_web::http::HeaderName;
use crate::endpoints::speak::api::SpeakRequest;

const RATE_LIMIT_BYPASS_HEADER : &'static str = "limitless";

pub struct RedisRateLimiter {
  limiter: Limiter,
  rate_limit_bypass_header: HeaderName,
}

enum ErrorOrTimeoutInternal {
  Error(LimitationError),
  PermitAcquireTimeout,
}

impl RedisRateLimiter {
  pub fn new(limiter: Limiter) -> Self {
    let rate_limit_bypass_header = HeaderName::from_static(RATE_LIMIT_BYPASS_HEADER);
    RedisRateLimiter {
      limiter,
      rate_limit_bypass_header,
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
  fn maybe_ratelimit_request(&self, ip_address: &str, headers: &HeaderMap, speak_request: &SpeakRequest) -> Result<(), RateLimiterError> {
    if speak_request.skip_rate_limiter {
      info!("Bypassing rate limiter with request param.");
      return Ok(());
    }

    if headers.contains_key(&self.rate_limit_bypass_header) {
      info!("Bypassing rate limiter with admin debug header.");
      return Ok(());
    }

    if speak_request.retry_attempt_number > 0 {
      info!("Retries bypass the rate limiter.");
      return Ok(());
    }

    self.acquire(ip_address)
  }

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

