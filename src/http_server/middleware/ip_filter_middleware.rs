use std::pin::Pin;
use std::task::{Context, Poll};

use actix_service::{Service, Transform};
use actix_web::{dev::ServiceRequest, dev::ServiceResponse, Error};
use futures::future::{ok, Ready};
use futures::Future;
use crate::threads::ip_banlist_set::IpBanlistSet;
use log::warn;
use log::info;
use crate::http_server::web_utils::ip_address::get_service_request_ip;
use actix_web::error::ErrorForbidden;

// There are two steps in middleware processing.
// 1. Middleware initialization, middleware factory gets called with
//    next service in chain as parameter.
// 2. Middleware's call method gets called with normal request.
#[derive(Clone)] // NB: Clone is safe because IpBanlist is clone-safe (internal Arc)
pub struct IpFilter {
  ip_banlist: IpBanlistSet,
}

impl IpFilter {
  pub fn new(ip_banlist: IpBanlistSet) -> Self {
    Self {
      ip_banlist,
    }
  }
}

// Middleware factory is `Transform` trait from actix-service crate
// `S` - type of the next service
// `B` - type of response's body
impl<S, B> Transform<S> for IpFilter
  where
      S: Service<Request = ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
      S::Future: 'static,
      B: 'static,
{
  type Request = ServiceRequest;
  type Response = ServiceResponse<B>;
  type Error = Error;
  type InitError = ();
  type Transform = IpFilterMiddleware<S>;
  type Future = Ready<Result<Self::Transform, Self::InitError>>;

  fn new_transform(&self, service: S) -> Self::Future {
    // NB: IpBanlist is clone-safe due to internal Arc.
    ok(IpFilterMiddleware { service, ip_banlist: self.ip_banlist.clone() })
  }
}

pub struct IpFilterMiddleware<S> {
  service: S,
  ip_banlist: IpBanlistSet,
}

impl<S, B> Service for IpFilterMiddleware<S>
  where
      S: Service<Request = ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
      S::Future: 'static,
      B: 'static,
{
  type Request = ServiceRequest;
  type Response = ServiceResponse<B>;
  type Error = Error;
  type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>>>>;

  fn poll_ready(&mut self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
    self.service.poll_ready(cx)
  }

  fn call(&mut self, req: ServiceRequest) -> Self::Future {
    let ip_address = get_service_request_ip(&req);

    // NB: Fail open.
    let is_banned = self.ip_banlist.is_banned(&ip_address).unwrap_or(false);

    if is_banned {
      warn!("Ip is banned: {}", &ip_address);
      return Box::pin(ok(req.error_response(ErrorForbidden("Forbidden"))))
    }

    let fut = self.service.call(req);

    Box::pin(async move {
      let res = fut.await?;

      println!("Hi from response");
      Ok(res)
    })
  }
}