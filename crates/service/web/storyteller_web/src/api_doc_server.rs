// Never allow these
#![forbid(private_bounds)]
#![forbid(private_interfaces)]
#![forbid(unused_must_use)] // NB: It's unsafe to not close/check some things

// Okay to toggle
//#![forbid(warnings)]
#![allow(unreachable_patterns)]
#![allow(unused_imports)]
#![allow(unused_mut)]
#![allow(unused_variables)]

// Always allow
#![allow(dead_code)]
#![allow(non_snake_case)]

#[macro_use] extern crate magic_crypt;
#[macro_use] extern crate serde_derive;

use std::error::Error;

use actix_web::{App, HttpServer};
use r2d2_redis::redis::Commands;
use sqlx::MySqlPool;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

use api_doc::ApiDoc;
use errors::AnyhowResult;

use crate::configs::static_api_tokens::StaticApiTokenSet;
use crate::state::server_state::ServerState;

pub mod billing;
pub mod configs;
pub mod http_server;
pub mod memory_cache;
pub mod model;
pub mod state;
pub mod threads;
pub mod util;

pub mod api_doc;

#[actix_web::main]
async fn main() -> Result<(), impl Error> {
  HttpServer::new(move || {
      App::new()
          .service(
              SwaggerUi::new("/{_:.*}")
                  .url("/api-docs/openapi.json", ApiDoc::openapi()),
          )
  })
  .bind(("localhost", 8989)).unwrap()
  .run().await
}