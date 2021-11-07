#![forbid(private_in_public)]
#![forbid(unused_must_use)]
//#![forbid(warnings)]

#![allow(dead_code)]
#![allow(non_snake_case)]
#![allow(unused_imports)]
#![allow(unused_mut)]
#![allow(unused_variables)]

#[macro_use] extern crate lazy_static;
#[macro_use] extern crate magic_crypt;
#[macro_use] extern crate serde_derive;

use actix_cors::Cors;
use actix_http::http;
use actix_web::middleware::{Logger, DefaultHeaders};
use actix_web::{HttpServer, web, HttpResponse, App};
use config::shared_constants::DEFAULT_MYSQL_CONNECTION_STRING;
use config::shared_constants::DEFAULT_REDIS_CONNECTION_STRING;
use config::shared_constants::DEFAULT_RUST_LOG;
use futures::Future;
use futures::executor::ThreadPool;
use limitation::Limiter;
use log::{info};
use r2d2_redis::RedisConnectionManager;
use r2d2_redis::r2d2;
use r2d2_redis::redis::Commands;
use sqlx::MySqlPool;
use sqlx::mysql::MySqlPoolOptions;
use std::sync::Arc;
use std::time::Duration;

const DEFAULT_BIND_ADDRESS : &'static str = "0.0.0.0:12345";

pub type AnyhowResult<T> = anyhow::Result<T>;

/// State that is injected into every endpoint.
#[derive(Clone)]
pub struct ObsGatewayServerState {
  /// Configuration from ENV vars.
  /// Some of this might not be used.
  pub env_config: EnvConfig,
  pub hostname: String,
}

#[derive(Clone)]
pub struct EnvConfig {
  // Number of thread workers.
  pub num_workers: usize,
  pub bind_address: String,
  pub cookie_domain: String,
  pub cookie_secure: bool,
  pub cookie_http_only: bool,
  pub website_homepage_redirect: String,
}

#[actix_web::main]
async fn main() -> AnyhowResult<()> {
  easyenv::init_all_with_default_logging(Some(DEFAULT_RUST_LOG));

  // NB: Do not check this secrets-containing dotenv file into VCS.
  // This file should only contain *development* secrets, never production.
  let _ = dotenv::from_filename(".env-secrets").ok();

  info!("Obtaining hostname...");

  let server_hostname = hostname::get()
      .ok()
      .and_then(|h| h.into_string().ok())
      .unwrap_or("obs-gateway-server-unknown".to_string());

  info!("Hostname: {}", &server_hostname);

  info!("Connecting to database...");

  let db_connection_string =
      easyenv::get_env_string_or_default(
        "MYSQL_URL",
        DEFAULT_MYSQL_CONNECTION_STRING);

  let redis_connection_string =
      easyenv::get_env_string_or_default(
        "REDIS_URL",
        DEFAULT_REDIS_CONNECTION_STRING);

  let pool = MySqlPoolOptions::new()
      .max_connections(5)
      .connect(&db_connection_string)
      .await?;

  let redis_manager = RedisConnectionManager::new(redis_connection_string.clone())?;

  let redis_pool = r2d2::Pool::builder()
      .build(redis_manager)?;

  info!("Reading env vars and setting up utils...");

  let bind_address = easyenv::get_env_string_or_default("BIND_ADDRESS", DEFAULT_BIND_ADDRESS);
  let num_workers = easyenv::get_env_num("NUM_WORKERS", 8)?;
  let hmac_secret = easyenv::get_env_string_or_default("COOKIE_SECRET", "notsecret");
  let cookie_domain = easyenv::get_env_string_or_default("COOKIE_DOMAIN", ".vo.codes");
  let cookie_secure = easyenv::get_env_bool_or_default("COOKIE_SECURE", true);
  let cookie_http_only = easyenv::get_env_bool_or_default("COOKIE_HTTP_ONLY", true);
  let website_homepage_redirect =
      easyenv::get_env_string_or_default("WEBSITE_HOMEPAGE_REDIRECT", "https://vo.codes/");

  let server_state = ObsGatewayServerState {
    env_config: EnvConfig {
      num_workers,
      bind_address,
      cookie_domain,
      cookie_secure,
      cookie_http_only,
      website_homepage_redirect,
    },
    hostname: server_hostname,
  };

  serve(server_state)
      .await?;
  Ok(())
}

pub async fn serve(server_state: ObsGatewayServerState) -> AnyhowResult<()>
{
  let bind_address = server_state.env_config.bind_address.clone();
  let num_workers = server_state.env_config.num_workers.clone();
  let hostname = server_state.hostname.clone();

  let server_state_arc = web::Data::new(Arc::new(server_state));

  info!("Starting HTTP service.");

  let log_format = "[%{HOSTNAME}e] %a \"%r\" %s %b \"%{Referer}i\" \"%{User-Agent}i\" %T";

  HttpServer::new(move || {
    App::new()
        .app_data(server_state_arc.clone())
        .wrap(Cors::default()
            .allowed_origin("http://api.fakeyou.com")
            .allowed_origin("http://api.jungle.horse")
            .allowed_origin("http://api.vo.codes")
            .allowed_origin("http://fakeyou.com")
            .allowed_origin("http://jungle.horse")
            .allowed_origin("http://jungle.horse:12345")
            .allowed_origin("http://jungle.horse:7000")
            .allowed_origin("http://localhost:12345")
            .allowed_origin("http://localhost:3000")
            .allowed_origin("http://localhost:5555")
            .allowed_origin("http://localhost:7000")
            .allowed_origin("http://localhost:8000")
            .allowed_origin("http://localhost:8080")
            .allowed_origin("http://mumble.stream")
            .allowed_origin("http://trumped.com")
            .allowed_origin("http://vo.codes")
            .allowed_origin("http://vocodes.com")
            .allowed_origin("https://api.fakeyou.com")
            .allowed_origin("https://api.jungle.horse")
            .allowed_origin("https://api.vo.codes")
            .allowed_origin("https://fakeyou.com")
            .allowed_origin("https://jungle.horse")
            .allowed_origin("https://mumble.stream")
            .allowed_origin("https://trumped.com")
            .allowed_origin("https://vo.codes")
            .allowed_origin("https://vocodes.com")
            .allowed_methods(vec!["GET", "POST", "OPTIONS"])
            .supports_credentials()
            .allowed_headers(vec![
              http::header::ACCEPT,
              http::header::ACCESS_CONTROL_ALLOW_ORIGIN, // Tabulator Ajax
              http::header::CONTENT_TYPE,
              http::header::ACCESS_CONTROL_ALLOW_CREDENTIALS, // https://stackoverflow.com/a/46412839
              http::header::HeaderName::from_static("x-requested-with") // Tabulator Ajax sends
            ])
            .max_age(3600))
        .wrap(Logger::new(&log_format)
            .exclude("/liveness")
            .exclude("/readiness"))
        .wrap(DefaultHeaders::new()
            .header("X-Backend-Hostname", &hostname)
            .header("X-Build-Sha", ""))
        // Twitch
        //.service(
        //  web::resource("/twitch")
        //      .route(web::get().to(ws_index))
        //      .route(web::head().to(|| HttpResponse::Ok()))
        //)
        //.service(get_root_index)
        //.default_service( web::route().to(default_route_404))
  })
      .bind(bind_address)?
      .workers(num_workers)
      .run()
      .await?;

  Ok(())
}
