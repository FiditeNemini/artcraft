use actix_http::http::StatusCode;
use actix_web::{HttpResponse, HttpRequest, Responder, get};
use log::debug;


/*
error[E0277]: the trait bound `fn() -> impl futures::Future {get_root_index}: HttpServiceFactory` is not satisfied
   --> app/storyteller_web/src/main.rs:627:16
    |
627 |       .service(get_root_index)
    |                ^^^^^^^^^^^^^^ the trait `HttpServiceFactory` is not implemented for `fn() -> impl futures::Future {get_root_index}`
 */


pub async fn get_root_index() -> impl Responder {
  debug!("GET /"); // NB: Google load balancer hits this a lot, and it spams.
  HttpResponse::build(StatusCode::OK)
    .content_type("text/html; charset=utf-8")
    .body("<h1>hello!</h1><p>Are you looking for an API? Join our Discord!</p><p>Maybe you want to work with us? We can pay! Get in touch!</p>")
}
