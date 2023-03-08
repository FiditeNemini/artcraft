use actix_http::StatusCode;
use actix_http::http::{header, HeaderMap, HeaderValue};
use actix_http::{error, body::Body, Response};
use actix_web::dev::{Service, Transform};
use actix_web::dev::{ServiceRequest, ServiceResponse};
use actix_web::web::{BytesMut, Buf, BufMut};
use actix_web::{Error, HttpResponse};
use actix_web::{ResponseError, HttpMessage, HttpRequest, HttpResponseBuilder};
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::threads::ip_banlist_set::IpBanlistSet;
use futures_util::future::{err, ok, Either, Ready};
use http_server_common::request::get_request_ip::get_service_request_ip;
use std::io::Write;
use std::task::{Context, Poll};
use crate::server_state::StaticFeatureFlags;

// There are two steps in middleware processing.
// 1. Middleware initialization, middleware factory gets called with
//    next service in chain as parameter.
// 2. Middleware's call method gets called with normal request.

#[derive(Debug)]
pub struct PushbackError {}

impl std::fmt::Display for PushbackError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    let response = "ERR429.67: too many requests";
    write!(f, "{}", response)
  }
}

impl std::error::Error for PushbackError {}

impl ResponseError for PushbackError {
  fn status_code(&self) -> StatusCode {
    StatusCode::TOO_MANY_REQUESTS
  }

  fn error_response(&self) -> HttpResponse<Body> {
    // NB: I'm setting a string error code because I mistakenly got caught by this in local dev
    // and couldn't figure out the issue for a bit. At least I can grep for this string.
    // However, I need to balance this requirement with not cluing in those that are banned.
    to_simple_json_error(
      "ERR429.67: too many requests",
      self.status_code())
  }
}

#[derive(Clone)] // NB: Internal state must be Clone-safe (Arc, etc.)
pub struct PushbackFilter {
  feature_flags: StaticFeatureFlags,
}

impl PushbackFilter {
  pub fn new(feature_flags: &StaticFeatureFlags) -> Self {
    Self {
      feature_flags: feature_flags.clone(),
    }
  }
}

impl<S> Transform<S, ServiceRequest> for PushbackFilter
  where
      S: Service<ServiceRequest, Response = ServiceResponse, Error = Error>,
      S::Future: 'static,
{
  type Response = ServiceResponse;
  type Error = Error;
  type InitError = ();
  type Transform = PushbackFilterMiddleware<S>;
  type Future = Ready<Result<Self::Transform, Self::InitError>>;

  fn new_transform(&self, service: S) -> Self::Future {
    ok(PushbackFilterMiddleware { service, feature_flags: self.feature_flags.clone() })
  }
}

pub struct PushbackFilterMiddleware<S> {
  service: S,
  feature_flags: StaticFeatureFlags,
}

impl<S> Service<ServiceRequest> for PushbackFilterMiddleware<S>
  where
      S: Service<ServiceRequest, Response = ServiceResponse, Error = Error>,
      S::Future: 'static,
{
  type Response = ServiceResponse;
  type Error = Error;
  type Future = Either<S::Future, Ready<Result<Self::Response, Self::Error>>>;

  // alternatively(?), actix_service::forward_ready!(service);
  fn poll_ready(&self, cx: &mut Context) -> Poll<Result<(), Self::Error>> {
    self.service.poll_ready(cx)
  }

  fn call(&self, req: ServiceRequest) -> Self::Future {
    // NB: Ordinarily the filter should be disabled.
    let mut can_bypass_filter = !self.feature_flags.global_429_pushback_filter_enabled;

    if !can_bypass_filter {
      // Don't kill the load balancer!
      can_bypass_filter = req.path().starts_with("/_status");
    }

    if !can_bypass_filter {
      // TODO: Clean up with transpose() once stable
      let result = req.headers()
          .get("bypass-pushback-filter")
          .map(|h| h.to_str());

      can_bypass_filter = match result {
        Some(Ok(header)) => true,
        Some(Err(_)) => false,
        None => false,
      };
    }

    if can_bypass_filter {
      Either::Left(self.service.call(req))
    } else {
      Either::Right(err(Error::from(PushbackError {})))
    }
  }
}
