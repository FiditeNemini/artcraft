use crate::http_server::web_utils::ip_address::get_service_request_ip;
use crate::threads::ip_banlist_set::IpBanlistSet;

//use actix_web::error::ErrorForbidden;
//use actix_web::{HttpResponse, ResponseError};
//use anyhow::anyhow;
//use futures::Future;
//use futures::future::{ok, Ready, LocalBoxFuture, err, Either};
//use log::info;
//use log::warn;
//use std::pin::Pin;
//use std::task::{Context, Poll};
//use actix_web::body::{AnyBody, MessageBody};
//use actix_http::{http, StatusCode, header, Response};
//use actix_http::body::{Body, ResponseBody};
//use actix_web::web::{BytesMut, Buf, BufMut};
//use std::fmt;
//use std::{io::Write as _};
//use futures::future::FutureExt;

use std::task::{Context, Poll};

use actix_web::dev::{Service, Transform};
use actix_web::dev::{ServiceRequest, ServiceResponse};
use actix_web::Error;
use futures_util::future::{err, ok, Either, Ready};

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

  //actix_service::forward_ready!(service);
  fn poll_ready(&self, cx: &mut Context) -> Poll<Result<(), Self::Error>> {
    self.service.poll_ready(cx)
  }

  fn call(&self, req: ServiceRequest) -> Self::Future {
    let ip_address = get_service_request_ip(&req);

    // NB: Fail open.
    let is_banned = self.ip_banlist.is_banned(&ip_address).unwrap_or(false);

    Either::Left(self.service.call(req))
  }
}