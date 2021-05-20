use actix_http::http::StatusCode;
use actix_web::{HttpResponse, HttpRequest, Responder, get};
use log::debug;

#[get("/")]
pub async fn get_root_index() -> impl Responder {
  debug!("GET /"); // NB: Google load balancer hits this a lot, and it spams.
  HttpResponse::build(StatusCode::OK)
    .content_type("text/html; charset=utf-8")
    .body("<h1>hello friend</h1>")
}
