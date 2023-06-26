use actix_web::Error;
use actix_web::dev::{Service, Transform};
use actix_web::dev::{ServiceRequest, ServiceResponse};
use crate::middleware::cidr_filter::cidr_ban_set::CidrBanSet;
use crate::middleware::cidr_filter::cidr_filter_middleware::CidrFilterMiddleware;
use futures_util::future::{ok, Ready};

// There are two steps in middleware processing.
// 1. Middleware initialization, middleware factory gets called with
//    next service in chain as parameter.
// 2. Middleware's call method gets called with normal request.

#[derive(Clone)]
pub struct CidrFilter {
  cidr_bans: CidrBanSet,
}

impl CidrFilter {
  pub fn new(cidr_bans: CidrBanSet) -> Self {
    Self {
      cidr_bans,
    }
  }
}

impl<S> Transform<S, ServiceRequest> for CidrFilter
  where
      S: Service<ServiceRequest, Response = ServiceResponse, Error = Error>,
      S::Future: 'static,
{
  type Response = ServiceResponse;
  type Error = Error;
  type InitError = ();
  type Transform = CidrFilterMiddleware<S>;
  type Future = Ready<Result<Self::Transform, Self::InitError>>;

  fn new_transform(&self, service: S) -> Self::Future {
    ok(CidrFilterMiddleware { service, cidr_bans: self.cidr_bans.clone() })
  }
}

