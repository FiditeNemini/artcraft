use actix_service::ServiceFactory;
use actix_web::dev::{Handler, ServiceRequest, ServiceResponse};
use actix_web::error::Error;
use actix_web::{App, web, HttpResponse, FromRequest, Responder};

// TODO: Check that routes don't overlap.
// TODO: Properly handle scoped routes in a nice DSL.
// TODO: Add tests.

/// Build routes more concisely.
pub struct RouteBuilder<T>
where
    T: ServiceFactory<
      ServiceRequest,
      Config = (),
      Response = ServiceResponse,
      Error = Error,
      InitError = (),
    >,
{
  app: App<T>,
}

impl <T> RouteBuilder<T>
  where
      T: ServiceFactory<
        ServiceRequest,
        Config = (),
        Response = ServiceResponse,
        Error = Error,
        InitError = (),
      >,
{
  /// Constructor
  pub fn from_app(app: App<T>) -> Self {
    Self {
      app
    }
  }

  /// Return back to Actix App.
  pub fn into_app(self) -> App<T> {
    self.app
  }

  /// Add an HTTP GET route. This also adds the HEAD request for CORS.
  pub fn add_get<F, Args>(mut self, path: &str, handler: F) -> Self
    where
        F: Handler<Args>,
        Args: FromRequest + 'static,
        F::Output: Responder + 'static,
  {
    self.app = self.app.service(
      web::resource(path)
          .route(web::get().to(handler))
          .route(web::head().to(|| HttpResponse::Ok())) // NB: For XHR/CORS HEAD requests.
    );
    self
  }

  /// Add an HTTP POST route. This also adds the HEAD request for CORS.
  pub fn add_post<F, Args>(mut self, path: &str, handler: F) -> Self
    where
        F: Handler<Args>,
        Args: FromRequest + 'static,
        F::Output: Responder + 'static,
  {
    self.app = self.app.service(
      web::resource(path)
          .route(web::post().to(handler))
          .route(web::head().to(|| HttpResponse::Ok())) // NB: For XHR/CORS HEAD requests.
    );
    self
  }
}
