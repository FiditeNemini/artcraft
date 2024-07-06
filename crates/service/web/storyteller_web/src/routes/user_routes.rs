//! These routes are recommended, but do not have to be used by consumers of the user system.
use actix_web::{App, HttpResponse, web};
use actix_web::body::MessageBody;
use actix_web::dev::{ServiceFactory, ServiceRequest, ServiceResponse};
use actix_web::error::Error;

use users_component::endpoints::create_account_handler::create_account_handler;
use users_component::endpoints::login_handler::login_handler;
use users_component::endpoints::logout_handler::logout_handler;
use users_component::endpoints::password_reset_redeem_handler::password_reset_redeem_handler;
use users_component::endpoints::password_reset_request_handler::password_reset_request_handler;
use users_component::endpoints::session_info_handler::session_info_handler;

// NB: This does not include the user edit endpoints since FakeYou's API mounts them alongside other things.
// A 'v2' API would mount under a v2 prefix and the entity type.

pub fn add_user_routes<T, B> (app: App<T>) -> App<T>
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
  app
      .service(
        // TODO(bt,2022-11-16): non-/v1/ endpoints are deprecated and subject for future removal
        web::resource("/create_account")
            .route(web::post().to(create_account_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/v1/create_account")
            .route(web::post().to(create_account_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        // TODO(bt,2022-11-16): non-/v1/ endpoints are deprecated and subject for future removal
        web::resource("/login")
            .route(web::post().to(login_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
          web::resource("/v1/login")
              .route(web::post().to(login_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        // TODO(bt,2022-11-16): non-/v1/ endpoints are deprecated and subject for future removal
        web::resource("/logout")
            .route(web::post().to(logout_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
          web::resource("/v1/logout")
              .route(web::post().to(logout_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        // TODO(bt,2022-11-16): non-/v1/ endpoints are deprecated and subject for future removal
        web::resource("/session")
            .route(web::get().to(session_info_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
          web::resource("/v1/session")
              .route(web::get().to(session_info_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/v1/password_reset/request")
          .route(web::post().to(password_reset_request_handler))
          .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/v1/password_reset/redeem")
            .route(web::post().to(password_reset_redeem_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
}
