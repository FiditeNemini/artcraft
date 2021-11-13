// There are two steps in middleware processing.
// 1. Middleware initialization, middleware factory gets called with
//    next service in chain as parameter.
// 2. Middleware's call method gets called with normal request.

use actix_http::StatusCode;
use actix_http::http::{header, HeaderMap, HeaderValue};
use actix_http::{error, body::Body, Response};
use actix_web::dev::{Service, Transform};
use actix_web::dev::{ServiceRequest, ServiceResponse};
use actix_web::web::{BytesMut, Buf, BufMut};
use actix_web::{Error, HttpResponse};
use actix_web::{ResponseError, HttpMessage, HttpRequest, HttpResponseBuilder};
use crate::http_server::web_utils::ip_address::get_service_request_ip;
use crate::threads::ip_banlist_set::IpBanlistSet;
use derive_more::{Display, Error as ErrorE};
use futures_util::future::{err, ok, Either, Ready};
use std::io::Write;
use std::task::{Context, Poll};

#[derive(Debug, Display, ErrorE)]
pub struct BannedError {}

impl ResponseError for BannedError {
  fn status_code(&self) -> StatusCode {
    StatusCode::UNAUTHORIZED
  }

  fn error_response(&self) -> HttpResponse<Body> {
    HttpResponseBuilder::new(self.status_code())
      .append_header((header::CONTENT_TYPE, "application/json"))
      .body("{}")
  }
}

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
    // NB: IpBanlist is clone-safe due to internal Arc.
    ok(IpFilterMiddleware { service, ip_banlist: self.ip_banlist.clone() })
  }
}

pub struct IpFilterMiddleware<S> {
  service: S,
  ip_banlist: IpBanlistSet,
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

  fn call(&self, req: ServiceRequest) -> Self::Future {
    let ip_address = get_service_request_ip(&req);

    // NB: Fail open.
    let is_banned = self.ip_banlist
        .is_banned(&ip_address)
        .unwrap_or(false);

    if is_banned {
      return Either::Right(err(Error::from(BannedError {})))
    }

    Either::Left(self.service.call(req))
  }
}
