use actix_http::http::StatusCode;
use actix_web::{HttpResponse, HttpRequest, Responder, get};
use log::info;

#[get("/")]
pub async fn get_root_index() -> impl Responder {
  info!("GET /");
  HttpResponse::build(StatusCode::OK)
    .content_type("text/html; charset=utf-8")
    .body("<h1>hello friend</h1>")
}
