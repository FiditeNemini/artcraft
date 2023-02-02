use actix_http::body::MessageBody;
use actix_service::ServiceFactory;
use actix_web::dev::{Handler, ServiceRequest, ServiceResponse};
use actix_web::error::Error;
use actix_web::{App, web, HttpResponse, FromRequest, Responder};
use std::future::Future;

// TODO: Check that routes don't overlap.
// TODO: Properly handle scoped routes in a nice DSL.

/// Build routes more concisely.
pub struct RouteBuilder<T, B>
where
    B: MessageBody,
    T: ServiceFactory<
      ServiceRequest,
      Config = (),
      Response = ServiceResponse<B>,
      Error = Error,
      InitError = (),
    >,
{
  app: App<T, B>,
}

impl <T, B> RouteBuilder<T, B>
  where
      B: MessageBody,
      T: ServiceFactory<
        ServiceRequest,
        Config = (),
        Response = ServiceResponse<B>,
        Error = Error,
        InitError = (),
      >,
{
  /// Constructor
  pub fn from_app(app: App<T, B>) -> Self {
    Self {
      app
    }
  }

  /// Return back to Actix App.
  pub fn into_app(self) -> App<T, B> {
    self.app
  }

  /// Add an HTTP GET route.
  pub fn add_get<F, S, R>(mut self, path: &str, handler: F) -> Self
    where
        F: Handler<S, R>,
        S: FromRequest + 'static,
        R: Future + 'static,
        R::Output: Responder + 'static,
  {
    self.app = self.app.service(
      web::resource(path)
          .route(web::get().to(handler))
          .route(web::head().to(|| HttpResponse::Ok())) // NB: For XHR/CORS HEAD requests.
    );
    self
  }

  /// Add an HTTP POST route.
  pub fn add_post<F, S, R>(mut self, path: &str, handler: F) -> Self
    where
        F: Handler<S, R>,
        S: FromRequest + 'static,
        R: Future + 'static,
        R::Output: Responder + 'static,
  {
    self.app = self.app.service(
      web::resource(path)
          .route(web::post().to(handler))
          .route(web::head().to(|| HttpResponse::Ok())) // NB: For XHR/CORS HEAD requests.
    );
    self
  }
}
