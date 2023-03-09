//! This service is meant to help with debugging.

pub mod env_args;
pub mod handlers;

use actix_helpers::route_builder::RouteBuilder;
use actix_http::StatusCode;
use actix_web::middleware::{Compress, DefaultHeaders, Logger};
use actix_web::{App, HttpResponse, HttpServer};
use crate::env_args::env_args;
use errors::AnyhowResult;
use http_server_common::cors::build_cors_config;

pub const DEFAULT_RUST_LOG: &'static str = concat!(
  "debug,",
  "actix_web=info,",
  "hyper::proto::h1::io=warn,",
  "http_server_common::request::get_request_ip=info," // Debug spams Rust logs
);

#[actix_web::main]
async fn main() -> AnyhowResult<()> {
  easyenv::init_all_with_default_logging(Some(DEFAULT_RUST_LOG));

  let log_format = "[%{HOSTNAME}e] %a \"%r\" %s %b \"%{Referer}i\" \"%{User-Agent}i\" %T";

  let env_args = env_args()?;

  let server_hostname = hostname::get()
      .ok()
      .and_then(|h| h.into_string().ok())
      .unwrap_or("hostname-unknown".to_string());

  HttpServer::new(move || {
    let mut app = App::new();

    //app.wrap(Compress::default())
    let mut app = app
        .wrap(Logger::new(&log_format))
        .wrap(DefaultHeaders::new()
            .header("X-Backend-Hostname", &server_hostname));

        let mut route_builder = RouteBuilder::from_app(app);

        let mut app = route_builder
            .add_get("/", simple_handler)
            .add_get("/_status", simple_handler)
            .add_post("/{tail:.*}", simple_handler)
            .into_app();

        app
      })

      .bind(&env_args.bind_address)?
      .workers(env_args.num_workers)
      .run()
      .await?;

  Ok(())
}

pub async fn simple_handler() -> HttpResponse {
  HttpResponse::build(StatusCode::OK)
      .content_type("application/json; charset=utf-8")
      .body("{\"success\": true}")
}

