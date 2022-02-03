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

pub mod redis;
pub mod threads;
pub mod twitch;
pub mod util;

use config::shared_constants::{DEFAULT_RUST_LOG, DEFAULT_REDIS_DATABASE_1_CONNECTION_STRING, DEFAULT_MYSQL_CONNECTION_STRING};
use container_common::anyhow_result::AnyhowResult;
use crate::threads::listen_for_active_obs_sessions_thread::ListenForActiveObsSessionThread;
use crate::twitch::oauth::oauth_token_refresher::OauthTokenRefresher;
use crate::twitch::websocket_client::TwitchWebsocketClient;
use futures::executor::{ThreadPool, ThreadPoolBuilder};
use futures::task::SpawnExt;
use log::info;
use r2d2_redis::RedisConnectionManager;
use r2d2_redis::r2d2::Pool;
use r2d2_redis::r2d2;
use redis_common::redis_keys::RedisKeys;
use sqlx::mysql::MySqlPoolOptions;
use std::sync::Arc;
use std::thread::sleep;
use std::time::Duration;
use tokio::runtime::{Builder, Runtime};
use twitch_common::twitch_secrets::TwitchSecrets;
use twitch_oauth2::{ClientId, ClientSecret, RefreshToken, AccessToken};

#[tokio::main]
pub async fn main() -> AnyhowResult<()> {
  easyenv::init_all_with_default_logging(Some(DEFAULT_RUST_LOG));

  // NB: Do not check this secrets-containing dotenv file into VCS.
  // This file should only contain *development* secrets, never production.
  let _ = dotenv::from_filename(".env-secrets").ok();

  let server_hostname = hostname::get()
      .ok()
      .and_then(|h| h.into_string().ok())
      .unwrap_or("twitch-pubsub-job".to_string());

  info!("Reading Twitch secrets...");

  let secrets = TwitchSecrets::from_env()?;
  let client_id = ClientId::new(&secrets.app_client_id);
  let client_secret = ClientSecret::new(&secrets.app_client_secret);

  let oauth_token_refresher = OauthTokenRefresher::from_secrets(client_id, client_secret)?;

  let db_connection_string =
      easyenv::get_env_string_or_default(
        "MYSQL_URL",
        DEFAULT_MYSQL_CONNECTION_STRING);

  let redis_connection_string =
      easyenv::get_env_string_or_default(
        "REDIS_1_URL",
        DEFAULT_REDIS_DATABASE_1_CONNECTION_STRING);

  info!("Connecting to mysql...");

  let mysql_pool = MySqlPoolOptions::new()
      .max_connections(5)
      .connect(&db_connection_string)
      .await?;

  let mysql_pool = Arc::new(mysql_pool);

  info!("Connecting to redis...");

  let redis_manager = RedisConnectionManager::new(redis_connection_string.clone())?;

  let redis_pool = r2d2::Pool::builder()
      .build(redis_manager)?;

  let redis_pool = Arc::new(redis_pool);

  info!("Connecting to pubsub redis...");

  let redis_pubsub_manager = RedisConnectionManager::new(redis_connection_string.clone())?;

  let redis_pubsub_pool = r2d2::Pool::builder()
      .build(redis_pubsub_manager)?;

  let redis_pubsub_pool = Arc::new(redis_pubsub_pool);

  info!("Creating thread pool...");

  // "The thread pool multiplexes any number of tasks onto a fixed number
  //  of worker threads."
  let thread_pool = ThreadPoolBuilder::new()
      .pool_size(8)
      .name_prefix("twitch-pubsub-")
      .create()?;

  // https://docs.rs/tokio/latest/tokio/runtime/struct.Builder.html
  let runtime = Builder::new_multi_thread()
      .worker_threads(4)
      .thread_name("twitch-pubsub-")
      .thread_stack_size(3 * 1024 * 1024)
      .enable_all()
      .build()?;

  let runtime = Arc::new(runtime);
  //let runtime_2 = runtime.clone();

  // https://docs.rs/tokio/latest/tokio/runtime/struct.Builder.html
  let runtime_2 = Builder::new_multi_thread()
      .worker_threads(4)
      .thread_name("twitch-pubsub-")
      .thread_stack_size(3 * 1024 * 1024)
      .enable_all()
      .build()?;

  let runtime_2 = Arc::new(runtime_2);

  info!("Thread pool created");

  let thread = ListenForActiveObsSessionThread::new(
    server_hostname.to_string(),
    oauth_token_refresher,
    mysql_pool,
    redis_pool,
    redis_pubsub_pool,
    runtime_2,
  );

  runtime.spawn(thread.start_thread());

  loop {
    sleep(Duration::from_millis(10_000));
  }
}

pub async fn watch_user_thread(user_id: u32) {
  let mut client = TwitchWebsocketClient::new().unwrap();

  info!("Connecting to Twitch PubSub... {}", user_id);
  client.connect().await.unwrap();

  loop {
    info!("Sending ping... {}", user_id);
    client.send_ping().await.unwrap();
    sleep(Duration::from_millis(10_000));
  }
}

