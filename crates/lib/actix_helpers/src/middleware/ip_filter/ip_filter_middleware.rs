use actix_web::Error;
use actix_web::dev::{Service, Transform};
use actix_web::dev::{ServiceRequest, ServiceResponse};
use crate::extractors::get_service_request_ip_address::get_service_request_ip_address;
use crate::middleware::ip_filter::banned_error::BannedError;
use crate::middleware::ip_filter::ip_ban_list::ip_ban_list::IpBanList;
use futures_util::future::{err, ok, Either, Ready};
use std::task::{Context, Poll};

// There are two steps in middleware processing.
// 1. Middleware initialization, middleware factory gets called with
//    next service in chain as parameter.
// 2. Middleware's call method gets called with normal request.

#[derive(Clone)]
pub struct IpFilter {
  ip_ban_list: IpBanList,
}

impl IpFilter {
  pub fn new(ip_ban_list: IpBanList) -> Self {
    Self {
      ip_ban_list,
    }
  }
}

impl<S> Transform<S, ServiceRequest> for IpFilter
  where
      S: Service<ServiceRequest, Response = ServiceResponse, Error = Error>,
      S::Future: 'static,
{
  type Response = ServiceResponse;
  type Error = Error;
  type InitError = ();
  type Transform = IpFilterMiddleware<S>;
  type Future = Ready<Result<Self::Transform, Self::InitError>>;

  fn new_transform(&self, service: S) -> Self::Future {
    ok(IpFilterMiddleware { service, ip_ban_list: self.ip_ban_list.clone() })
  }
}

pub struct IpFilterMiddleware<S> {
  service: S,
  ip_ban_list: IpBanList,
}

impl<S> Service<ServiceRequest> for IpFilterMiddleware<S>
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
    let ip_address = get_service_request_ip_address(&request);

    // NB: Fail open.
    // We don't want our service to explode because we can't read bans.
    let is_banned = self.ip_ban_list
        .contains_ip_address(&ip_address)
        .unwrap_or(false);

    if is_banned {
      Either::Right(err(Error::from(BannedError {})))
    } else {
      Either::Left(self.service.call(request))
    }
  }
}
