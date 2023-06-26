use actix_web::Error;
use actix_web::dev::Service;
use actix_web::dev::{ServiceRequest, ServiceResponse};
use crate::extractors::get_service_request_ip_address::get_service_request_ip_address;
use crate::middleware::cidr_filter::cidr_ban_set::CidrBanSet;
use crate::middleware::ip_filter::banned_error::BannedError;
use futures_util::future::{err, Either, Ready};
use std::net::IpAddr;
use std::str::FromStr;
use std::task::{Context, Poll};

pub struct CidrFilterMiddleware<S> {
  pub (crate) service: S,
  pub (crate) cidr_bans: CidrBanSet,
}

impl<S> Service<ServiceRequest> for CidrFilterMiddleware<S>
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
    let ip_address = match IpAddr::from_str(&ip_address) {
      Ok(ip) => ip,
      Err(_err) => {
        return Either::Left(self.service.call(request));
      }
    };

    // NB: Fail open again.
    let is_banned = self.cidr_bans
        .ip_is_banned(ip_address)
        .unwrap_or(false);

    if is_banned {
      Either::Right(err(Error::from(BannedError {})))
    } else {
      Either::Left(self.service.call(request))
    }
  }
}
