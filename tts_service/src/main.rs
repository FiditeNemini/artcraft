#[macro_use] extern crate actix_web;
#[macro_use] extern crate serde_derive;

extern crate hound;
extern crate serde;
extern crate serde_json;
extern crate tch;

use tch::CModule;
use tch::Tensor;
use tch::nn::Module;
use tch::nn::ModuleT;

use actix_web::http::{header, Method, StatusCode};
use actix_web::{
  App,
  HttpRequest,
  HttpResponse,
  HttpServer,
  Responder,
  get,
  web,
};

#[get("/")]
async fn get_root(request: HttpRequest) -> std::io::Result<HttpResponse> {
  Ok(HttpResponse::build(StatusCode::OK)
      .content_type("text/html; charset=utf-8")
      .body("Hello World"))
}

#[get("/readiness")]
async fn get_readiness(request: HttpRequest) -> std::io::Result<HttpResponse> {
  Ok(HttpResponse::build(StatusCode::OK)
      .content_type("text/html; charset=utf-8")
      .body("Ready"))
}

#[get("/liveness")]
async fn get_liveness(request: HttpRequest) -> std::io::Result<HttpResponse> {
  Ok(HttpResponse::build(StatusCode::OK)
      .content_type("text/html; charset=utf-8")
      .body("Live"))
}

#[actix_rt::main]
async fn main() -> std::io::Result<()> {
  HttpServer::new(|| App::new()
      .service(get_root)
      .service(get_readiness)
      .service(get_liveness)
    )
    .bind("127.0.0.1:8080")?
    .run()
    .await
}

