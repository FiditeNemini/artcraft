use actix_web::Error;
use actix_web::dev::{Service, Transform};
use actix_web::dev::{ServiceRequest, ServiceResponse};
use futures_util::future::{err, ok, Either, Ready};
use std::task::{Context, Poll};
use crate::middleware::endpoint_disablement::disabled_endpoints::disabled_endpoints::DisabledEndpoints;
use crate::middleware::endpoint_disablement::disabled_error::DisabledError;

// There are two steps in middleware processing.
// 1. Middleware initialization, middleware factory gets called with
//    next service in chain as parameter.
// 2. Middleware's call method gets called with normal request.

#[derive(Clone)]
pub struct EndpointDisablementFilter {
  disabled_endpoints: DisabledEndpoints,
}

impl EndpointDisablementFilter {
  pub fn new(disabled_endpoints: DisabledEndpoints) -> Self {
    Self {
      disabled_endpoints,
    }
  }
}

impl<S> Transform<S, ServiceRequest> for EndpointDisablementFilter
  where
      S: Service<ServiceRequest, Response = ServiceResponse, Error = Error>,
      S::Future: 'static,
{
  type Response = ServiceResponse;
  type Error = Error;
  type InitError = ();
  type Transform = EndpointDisablementFilterMiddleware<S>;
  type Future = Ready<Result<Self::Transform, Self::InitError>>;

  fn new_transform(&self, service: S) -> Self::Future {
    ok(EndpointDisablementFilterMiddleware { service, disabled_endpoints: self.disabled_endpoints.clone() })
  }
}

pub struct EndpointDisablementFilterMiddleware<S> {
  service: S,
  disabled_endpoints: DisabledEndpoints,
}

impl<S> Service<ServiceRequest> for EndpointDisablementFilterMiddleware<S>
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

  fn call(&self, request: ServiceRequest) -> Self::Future {
    let endpoint = request.path();

    // NB: Fail open.
    // We don't want our service to explode because we can't read our configs.
    let is_disabled = self.disabled_endpoints.endpoint_is_disabled(&endpoint);

    if is_disabled {
      Either::Right(err(Error::from(DisabledError {})))
    } else {
      Either::Left(self.service.call(request))
    }
  }
}
