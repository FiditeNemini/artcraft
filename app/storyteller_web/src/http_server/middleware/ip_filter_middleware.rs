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
use actix_web::{Error, HttpResponse};
use futures_util::future::{err, ok, Either, Ready};

use derive_more::{Display, Error as ErrorE};
use actix_web::{ResponseError, HttpMessage, HttpRequest, HttpResponseBuilder};
use actix_http::StatusCode;
use actix_http::{error, body::Body, Response};
use actix_web::web::{BytesMut, Buf, BufMut};
use actix_http::http::{header, HeaderMap, HeaderValue};
use std::io::Write;

#[derive(Debug, Display, ErrorE)]
pub struct BannedError {
}

impl ResponseError for BannedError {
  fn status_code(&self) -> StatusCode {
    StatusCode::UNAUTHORIZED
  }
  fn error_response(&self) -> HttpResponse<Body> {
    // let mut res = Response::new(self.status_code());
    // res.headers_mut().insert(
    //     header::CONTENT_TYPE,
    //     header::HeaderValue::from_static("application/json"),
    // );
    // res.set_body(Body::from(self.to_string())).into()
    /*let mut res = Response::new(self.status_code());
    let mut buf = BytesMut::new().writer();
    let _ = write!(buf, "{}", self);

    res.headers_mut().insert(
      header::CONTENT_TYPE,
      header::HeaderValue::from_static("application/json"),
    );
    res.set_body(Body::from(buf.into_inner())).into()*/

    HttpResponseBuilder::new(self.status_code())
      .set_header(header::CONTENT_TYPE, "application/json")
      .body("TODO")
  }
}



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

    if is_banned {
      let res = req.into_response(
        HttpResponse::Unauthorized()
            .finish());
      //return Either::Right(err(Error::from(error)));
      //return Err(Error::from(UserError::ValidationError { field: "token invalid".to_string() }));
      return Either::Right(err(Error::from(BannedError {})))
    }

    Either::Left(self.service.call(req))
  }
}