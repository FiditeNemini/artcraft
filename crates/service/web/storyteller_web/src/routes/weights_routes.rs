use actix_http::body::MessageBody;
use actix_service::ServiceFactory;
use actix_web::{App, Error, HttpResponse, web};
use actix_web::dev::{ServiceRequest, ServiceResponse};

use crate::http_server::endpoints::weights::delete_weight::delete_weight_handler;
use crate::http_server::endpoints::weights::get_weight::get_weight_handler;
use crate::http_server::endpoints::weights::list_available_weights::list_available_weights_handler;
use crate::http_server::endpoints::weights::list_featured_weights::list_featured_weights_handler;
use crate::http_server::endpoints::weights::list_weights_by_user::list_weights_by_user_handler;
use crate::http_server::endpoints::weights::search_model_weights_handler::search_model_weights_handler;
use crate::http_server::endpoints::weights::set_model_weight_cover_image::set_model_weight_cover_image_handler;
use crate::http_server::endpoints::weights::update_weight::update_weight_handler;

pub fn add_weights_routes<T, B>(app: App<T>) -> App<T>
  where
      B: MessageBody,
      T: ServiceFactory<
        ServiceRequest,
        Config = (),
        Response = ServiceResponse<B>,
        Error = Error,
        InitError = ()
      >
{
  app.service(
    web
    ::scope("/v1/weights")
        //.route("/upload", web::post().to(upload_weights_handler))
        .service(web::resource("/weight/{weight_token}")
            .route(web::get().to(get_weight_handler))
            .route(web::post().to(update_weight_handler))
            .route(web::delete().to(delete_weight_handler))
        )
        .service(web::resource("/search")
            .route(web::post().to(search_model_weights_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
        )
        .service(web::resource("/weight/{token}/cover_image")
            .route(web::post().to(set_model_weight_cover_image_handler))
        )
        .route("/by_user/{username}", web::get().to(list_weights_by_user_handler))
        .route("/list", web::get().to(list_available_weights_handler))
        .route("/list_featured", web::get().to(list_featured_weights_handler))
  )
}
