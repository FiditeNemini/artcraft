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

pub mod endpoints_ws;
pub mod server_state;

use actix_cors::Cors;
use actix_http::http;
use actix_web::middleware::{Logger, DefaultHeaders};
use actix_web::{HttpServer, web, HttpResponse, App};
use config::shared_constants::DEFAULT_MYSQL_CONNECTION_STRING;
use config::shared_constants::DEFAULT_REDIS_DATABASE_1_CONNECTION_STRING;
use config::shared_constants::DEFAULT_RUST_LOG;
use container_common::anyhow_result::AnyhowResult;
use crate::endpoints_ws::obs_gateway_websocket_handler::obs_gateway_websocket_handler;
use crate::server_state::{ObsGatewayServerState, EnvConfig, TwitchOauthSecrets, BackendsConfig};
use futures::Future;
use futures::executor::ThreadPool;
use http_server_common::cors::build_common_cors_config;
use http_server_common::endpoints::default_route_404::default_route_404;
use http_server_common::endpoints::root_index::get_root_index;
use limitation::Limiter;
use log::{info};
use r2d2_redis::RedisConnectionManager;
use r2d2_redis::r2d2;
use r2d2_redis::redis::Commands;
use sqlx::MySqlPool;
use sqlx::mysql::MySqlPoolOptions;
use std::sync::Arc;
use std::thread::sleep;
use std::time::Duration;
use tokio::runtime::{Handle, Runtime};
use twitch_api2::pubsub::Topic;
use twitch_api2::pubsub;
use twitch_common::twitch_secrets::TwitchSecrets;
use twitch_oauth2::tokens::UserTokenBuilder;
use twitch_oauth2::{AppAccessToken, Scope, TwitchToken, tokens::errors::AppAccessTokenError, ClientId, ClientSecret};

const DEFAULT_BIND_ADDRESS : &'static str = "0.0.0.0:54321";

#[actix_web::main]
//#[tokio::main]
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

  info!("Reading Twitch secrets...");

  let twitch_secrets = TwitchSecrets::from_env()?;

  info!("Reading env vars and setting up utils...");

  let bind_address = easyenv::get_env_string_or_default("BIND_ADDRESS", DEFAULT_BIND_ADDRESS);
  let num_workers = easyenv::get_env_num("NUM_WORKERS", 8)?;
  let hmac_secret = easyenv::get_env_string_or_default("COOKIE_SECRET", "notsecret");
  let cookie_domain = easyenv::get_env_string_or_default("COOKIE_DOMAIN", ".vo.codes");
  let cookie_secure = easyenv::get_env_bool_or_default("COOKIE_SECURE", true);
  let cookie_http_only = easyenv::get_env_bool_or_default("COOKIE_HTTP_ONLY", true);
  let website_homepage_redirect =
      easyenv::get_env_string_or_default("WEBSITE_HOMEPAGE_REDIRECT", "https://vo.codes/");

  let db_connection_string =
      easyenv::get_env_string_or_default(
        "MYSQL_URL",
        DEFAULT_MYSQL_CONNECTION_STRING);

  let redis_connection_string =
      easyenv::get_env_string_or_default(
        "REDIS_1_URL",
        DEFAULT_REDIS_DATABASE_1_CONNECTION_STRING);

  info!("Connecting to mysql...");

  let pool = MySqlPoolOptions::new()
      .max_connections(5)
      .connect(&db_connection_string)
      .await?;

  info!("Connecting to redis...");

  let redis_manager = RedisConnectionManager::new(redis_connection_string.clone())?;

  let redis_pool = r2d2::Pool::builder()
      .build(redis_manager)?;

  let server_state = ObsGatewayServerState {
    env_config: EnvConfig {
      num_workers,
      bind_address,
      cookie_domain,
      cookie_secure,
      cookie_http_only,
      website_homepage_redirect,
    },
    twitch_oauth_secrets: TwitchOauthSecrets {
      client_id: twitch_secrets.app_client_id.clone(),
      client_secret: twitch_secrets.app_client_secret.clone(),
    },
    hostname: server_hostname,
    backends: BackendsConfig {
      mysql_pool: pool,
      redis_pool,
    }
  };

  info!("Starting server...");

  serve(server_state).await?;

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
        .wrap(build_common_cors_config())
        .wrap(Logger::new(&log_format)
            .exclude("/liveness")
            .exclude("/readiness"))
        .wrap(DefaultHeaders::new()
            .header("X-Backend-Hostname", &hostname)
            .header("X-Build-Sha", ""))
        .service(web::resource("/")
            .route(web::get().to(get_root_index))
        )
        // Twitch websocket
        .service(web::resource("/obs/{twitch_username}")
            .route(web::get().to(obs_gateway_websocket_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
        )
        // Local development debugging
        .service(
          actix_files::Files::new("/static", "static")
              .show_files_listing()
              .use_last_modified(true),
        )
    .default_service( web::route().to(default_route_404))
  })
      .bind(bind_address)?
      .workers(num_workers)
      .run()
      .await?;

  Ok(())
}
