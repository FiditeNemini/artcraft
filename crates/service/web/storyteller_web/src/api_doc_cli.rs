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

use utoipa_swagger_ui::SwaggerUi;

use actix_web::{App, HttpServer, middleware, web};
use actix_web::middleware::{DefaultHeaders, Logger};

use r2d2_redis::r2d2;
use r2d2_redis::redis::Commands;
use r2d2_redis::RedisConnectionManager;
use sqlx::mysql::MySqlPoolOptions;
use sqlx::MySqlPool;
use tokio::runtime::Runtime;

use errors::AnyhowResult;

use crate::configs::static_api_tokens::{StaticApiTokenConfig, StaticApiTokens, StaticApiTokenSet};
use crate::server_state::{DurableInMemoryCaches, EnvConfig, EphemeralInMemoryCaches, InMemoryCaches, RedisRateLimiters, ServerInfo, ServerState, StaticFeatureFlags, StripeSettings, TrollBans};

pub mod billing;
pub mod configs;
pub mod cookies;
pub mod http_server;
pub mod memory_cache;
pub mod model;
pub mod routes;
pub mod server_state;
pub mod subscriptions;
pub mod threads;
pub mod util;
pub mod validations;

use std::{
  error::Error,
  future::{self, Ready},
  net::Ipv4Addr,
};
use std::fs::File;
use std::io::Write;

pub mod api_doc;
use api_doc::ApiDoc;

use futures::future::LocalBoxFuture;
use utoipa::OpenApi;

#[actix_web::main]
async fn main() -> AnyhowResult<()> {
  let api_json = ApiDoc::openapi().to_pretty_json()?;

  let mut file = File::create("api.json")?;
  file.write_all(api_json.as_bytes())?;

  Ok(())
}
