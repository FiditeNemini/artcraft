// Never allow these
#![forbid(private_in_public)]
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

#[macro_use] extern crate lazy_static;
#[macro_use] extern crate magic_crypt;
#[macro_use] extern crate serde_derive;

mod routes;
mod server_state;

use actix_web::middleware::{DefaultHeaders, Logger};
use actix_web::{App, HttpServer, web};
use config::common_env::CommonEnv;
use config::shared_constants::{DEFAULT_MYSQL_CONNECTION_STRING, DEFAULT_RUST_LOG};
use container_common::anyhow_result::AnyhowResult;
use crate::routes::add_routes;
use crate::server_state::{EnvConfig, InMemoryCaches, ServerState};
use http_server_common::cors::build_production_cors_config;
use limitation::Limiter;
use log::info;
use memory_caching::single_item_ttl_cache::SingleItemTtlCache;
use r2d2_redis::{r2d2, RedisConnectionManager};
use sqlx::mysql::MySqlPoolOptions;
use std::sync::Arc;
use std::time::Duration;
use storage_buckets_common::bucket_client::BucketClient;
use tokio::runtime::Runtime;

const DEFAULT_BIND_ADDRESS : &'static str = "0.0.0.0:12345";

#[actix_web::main]
async fn main() -> AnyhowResult<()> {
  easyenv::init_all_with_default_logging(Some(DEFAULT_RUST_LOG));

  // NB: Do not check this secrets-containing dotenv file into VCS.
  // This file should only contain *development* secrets, never production.
  let _ = dotenv::from_filename(".env-secrets").ok();

  let common_env = CommonEnv::read_from_env()?; // TODO: Deprecate and remove

  info!("Obtaining hostname...");

  let server_hostname = hostname::get()
      .ok()
      .and_then(|h| h.into_string().ok())
      .unwrap_or("image-generation-service".to_string());

  info!("Hostname: {}", &server_hostname);

  info!("Connecting to database...");

  let db_connection_string =
      easyenv::get_env_string_or_default(
        "MYSQL_URL",
        DEFAULT_MYSQL_CONNECTION_STRING);

  let pool = MySqlPoolOptions::new()
      .max_connections(easyenv::get_env_num("MYSQL_MAX_CONNECTIONS", 5)?)
      .connect(&db_connection_string)
      .await?;

  // let firehose_publisher = FirehosePublisher {
  //   mysql_pool: pool.clone(), // NB: Pool is clone/sync/send-safe
  // };
  //
  // let badge_granter = BadgeGranter {
  //   mysql_pool: pool.clone(), // NB: Pool is clone/sync/send-safe
  //   firehose_publisher: firehose_publisher.clone(), // NB: Also safe
  // };

  let redis_manager = RedisConnectionManager::new(
    common_env.redis_0_connection_string.clone())?;

  let redis_pool = r2d2::Pool::builder()
      .build(redis_manager)?;

  info!("Setting up Redis rate limiters...");

  //let logged_out_redis_rate_limiter = {
  //  let limiter_enabled = easyenv::get_env_bool_or_default("LIMITER_LOGGED_OUT_ENABLED", true);
  //  let limiter_max_requests = easyenv::get_env_num("LIMITER_LOGGED_OUT_MAX_REQUESTS", 3)?;
  //  let limiter_window_seconds = easyenv::get_env_num("LIMITER_LOGGED_OUT_WINDOW_SECONDS", 10)?;
  //
  //  let limiter = Limiter::build(&common_env.redis_0_connection_string)
  //      .limit(limiter_max_requests)
  //      .period(Duration::from_secs(limiter_window_seconds))
  //      .finish()?;
  //
  //  RedisRateLimiter::new(limiter, "logged_out", limiter_enabled)
  //};

  //let logged_in_redis_rate_limiter = {
  //  let limiter_enabled = easyenv::get_env_bool_or_default("LIMITER_LOGGED_IN_ENABLED", true);
  //  let limiter_max_requests = easyenv::get_env_num("LIMITER_LOGGED_IN_MAX_REQUESTS", 3)?;
  //  let limiter_window_seconds = easyenv::get_env_num("LIMITER_LOGGED_IN_WINDOW_SECONDS", 10)?;
  //
  //  let limiter = Limiter::build(&common_env.redis_0_connection_string)
  //      .limit(limiter_max_requests)
  //      .period(Duration::from_secs(limiter_window_seconds))
  //      .finish()?;
  //
  //  RedisRateLimiter::new(limiter, "logged_in", limiter_enabled)
  //};

  //let api_high_priority_redis_rate_limiter = {
  //  let limiter_enabled = easyenv::get_env_bool_or_default("LIMITER_API_HIGH_PRIORITY_ENABLED", true);
  //  let limiter_max_requests = easyenv::get_env_num("LIMITER_API_HIGH_PRIORITY_MAX_REQUESTS", 30)?;
  //  let limiter_window_seconds = easyenv::get_env_num("LIMITER_API_HIGH_PRIORITY_WINDOW_SECONDS", 30)?;
  //
  //  let limiter = Limiter::build(&common_env.redis_0_connection_string)
  //      .limit(limiter_max_requests)
  //      .period(Duration::from_secs(limiter_window_seconds))
  //      .finish()?;
  //
  //  RedisRateLimiter::new(limiter, "api_high_priority", limiter_enabled)
  //};

  //let model_upload_rate_limiter = {
  //  let limiter_enabled = easyenv::get_env_bool_or_default("LIMITER_MODEL_UPLOAD_ENABLED", true);
  //  let limiter_max_requests = easyenv::get_env_num("LIMITER_MODEL_UPLOAD_MAX_REQUESTS", 3)?;
  //  let limiter_window_seconds = easyenv::get_env_num("LIMITER_MODEL_UPLOAD_WINDOW_SECONDS", 10)?;
  //
  //  let limiter = Limiter::build(&common_env.redis_0_connection_string)
  //      .limit(limiter_max_requests)
  //      .period(Duration::from_secs(limiter_window_seconds))
  //      .finish()?;
  //
  //  RedisRateLimiter::new(limiter, "model_upload", limiter_enabled)
  //};

  info!("Reading env vars and setting up utils...");

  let bind_address = easyenv::get_env_string_or_default("BIND_ADDRESS", DEFAULT_BIND_ADDRESS);
  let num_workers = easyenv::get_env_num("NUM_WORKERS", 8)?;
  let hmac_secret = easyenv::get_env_string_or_default("COOKIE_SECRET", "notsecret");
  let cookie_domain = easyenv::get_env_string_or_default("COOKIE_DOMAIN", ".vo.codes");
  let cookie_secure = easyenv::get_env_bool_or_default("COOKIE_SECURE", true);
  let cookie_http_only = easyenv::get_env_bool_or_default("COOKIE_HTTP_ONLY", true);
  let website_homepage_redirect =
      easyenv::get_env_string_or_default("WEBSITE_HOMEPAGE_REDIRECT", "https://vo.codes/");

  //let cookie_manager = CookieManager::new(&cookie_domain, &hmac_secret);
  //let session_checker = SessionChecker::new(&cookie_manager);

  let access_key = easyenv::get_env_string_required("ACCESS_KEY")?;
  let secret_key = easyenv::get_env_string_required("SECRET_KEY")?;
  let region_name = easyenv::get_env_string_required("REGION_NAME")?;

  // NB: This secret really isn't too important.
  // We can even rotate it without too much impact to users.
  //let sort_key_crypto_secret =
  //    easyenv::get_env_string_or_default("SORT_KEY_SECRET", "webscale");
  //let sort_key_crypto = SortKeyCrypto::new(&sort_key_crypto_secret);

  // Background jobs.

  // let health_check_status = HealthCheckStatus::new();
  // let health_check_status2 = health_check_status.clone();
  // let ip_banlist = IpBanlistSet::new();
  // let ip_banlist2 = ip_banlist.clone();
  // let mysql_pool3 = pool.clone();
  // let mysql_pool4 = pool.clone();

  let tokio_runtime = Runtime::new()?;

  // info!("Spawning DB health checker thread.");
  //
  // tokio_runtime.spawn(async {
  //   db_health_checker_thread(health_check_status2, mysql_pool3).await;
  // });
  //
  // info!("Spawning IP ban polling thread.");
  //
  // tokio_runtime.spawn(async {
  //   poll_ip_bans(ip_banlist2, mysql_pool4).await;
  // });

  let server_state = ServerState {
    env_config: EnvConfig {
      num_workers,
      bind_address,
      cookie_domain,
      cookie_secure,
      cookie_http_only,
      website_homepage_redirect,
    },
    hostname: server_hostname,
    mysql_pool: pool,
    redis_pool,
    caches: InMemoryCaches {
    },
  };

  serve(server_state)
      .await?;
  Ok(())
}

pub async fn serve(server_state: ServerState) -> AnyhowResult<()>
{
  let bind_address = server_state.env_config.bind_address.clone();
  let num_workers = server_state.env_config.num_workers.clone();
  let hostname = server_state.hostname.clone();

  let server_state_arc = web::Data::new(Arc::new(server_state));

  info!("Starting HTTP service.");

  let log_format = "[%{HOSTNAME}e] %a \"%r\" %s %b \"%{Referer}i\" \"%{User-Agent}i\" %T";

  HttpServer::new(move || {
    // NB: Safe to clone due to internal arc
    //let ip_banlist = server_state_arc.ip_banlist.clone();
    let build_sha = std::fs::read_to_string("/GIT_SHA").unwrap_or(String::from("unknown"));

    let app = App::new()
        .app_data(server_state_arc.clone())
        .wrap(build_production_cors_config())
        .wrap(DefaultHeaders::new()
            .header("X-Backend-Hostname", &hostname)
            .header("X-Build-Sha", build_sha.trim()))
        //.wrap(IpFilter::new(ip_banlist))
        .wrap(Logger::new(&log_format)
            .exclude("/liveness")
            .exclude("/readiness"));

    add_routes(app)
  })
      .bind(bind_address)?
      .workers(num_workers)
      .run()
      .await?;

  Ok(())
}
