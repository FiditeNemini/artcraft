use actix_service::{Service, Transform};
use actix_web::error::ErrorForbidden;
use actix_web::{dev::ServiceRequest, dev::ServiceResponse, Error, HttpResponse};
use crate::http_server::web_utils::ip_address::get_service_request_ip;
use crate::threads::ip_banlist_set::IpBanlistSet;
use futures::Future;
use futures::future::{ok, Ready, LocalBoxFuture, err, Either};
use log::info;
use log::warn;
use std::pin::Pin;
use std::task::{Context, Poll};
use actix_web::body::AnyBody;
use actix_http::http;

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
impl<S, B> Transform<S, ServiceRequest> for IpFilter
  where
      S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
      S::Future: 'static,
{
  type Response = ServiceResponse<B>;
  type Error = Error;
  type Transform = IpFilterMiddleware<S>;
  type InitError = ();
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

// Updated example from
//  - https://github.com/actix/examples/blob/master/basics/middleware/src/redirect.rs
impl<S, B> Service<ServiceRequest> for IpFilterMiddleware<S>
  where
      S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
      S::Future: 'static,
{
  type Response = ServiceResponse<B>;
  type Error = Error;
  //type Future = Either<S::Future,
  //  Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>>>>>;
  //type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>>>>;
  type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>>>>;
  //type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;
  //type Future = Either<S::Future, Ready<Result<Self::Response, Self::Error>>>;

  actix_service::forward_ready!(service);

  fn call(&self, req: ServiceRequest) -> Self::Future {
    let ip_address = get_service_request_ip(&req);

    // NB: Fail open.
    let is_banned = self.ip_banlist.is_banned(&ip_address).unwrap_or(false);

    if is_banned {
      warn!("Ip is banned: {}", &ip_address);
      //return Either::right(
      //  Box::pin(ok(req.error_response(ErrorForbidden("Forbidden")))))


      //return Box::pin(ok(req.error_response(ErrorForbidden("Forbidden"))));

      //return req.error_response(ErrorForbidden("Forbidden"))
      // TODO: RESTORE BLOCK
      //return Box::pin(AnyBody::from_message());
      //return Box::pin(req.error_response(ErrorForbidden("Forbidden")));
      //return Box::pin(AnyBody::from_message(""));


      //return Either::Right(ok(req.into_response(
      //  HttpResponse::Found()
      //      .finish()
      //      .into_body(),
      //)));

      //return Either::Right(ok(req.error_response(
      //  ErrorForbidden("")
      //)));

      //return Box::pin(async move {
      //  let res = req.into_response(
      //    HttpResponse::Unauthorized()
      //        .finish()
      //  );
      //  Ok(res)
      //})

    }

    Box::pin(self.service.call(req))
    //Either::Left(self.service.call(req))
  }
}