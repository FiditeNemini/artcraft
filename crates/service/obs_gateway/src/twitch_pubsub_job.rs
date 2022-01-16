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

use config::shared_constants::{DEFAULT_RUST_LOG, DEFAULT_REDIS_DATABASE_1_CONNECTION_STRING};
use container_common::anyhow_result::AnyhowResult;
use futures::executor::{ThreadPool, ThreadPoolBuilder};
use r2d2_redis::r2d2;
use log::info;
use std::thread::sleep;
use std::time::Duration;
use crate::twitch::twitch_client_wrapper::TwitchClientWrapper;
use crate::twitch::websocket_client::TwitchWebsocketClient;
use futures::task::SpawnExt;
use tokio::runtime::Builder;
use r2d2_redis::RedisConnectionManager;
use std::sync::Arc;
use r2d2_redis::r2d2::Pool;
use redis_common::redis_keys::RedisKeys;

pub mod threads;
pub mod twitch;
pub mod util;

#[tokio::main]
pub async fn main() -> AnyhowResult<()> {
  easyenv::init_all_with_default_logging(Some(DEFAULT_RUST_LOG));

  let redis_connection_string =
      easyenv::get_env_string_or_default(
        "REDIS_1_URL",
        DEFAULT_REDIS_DATABASE_1_CONNECTION_STRING);

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

  info!("Thread pool created");

  //runtime.spawn(watch_user_thread(10));
  //runtime.spawn(watch_user_thread(9999));
  runtime.spawn(listen_for_subscriptions_thread(redis_pubsub_pool));

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

pub async fn listen_for_subscriptions_thread(redis_pool: Arc<Pool<RedisConnectionManager>>) {

  // TODO: ERROR HANDLING
  let mut pool = redis_pool.get().unwrap();
  let mut pubsub = pool.as_pubsub();
  let channel = RedisKeys::obs_session_active_topic();
  pubsub.subscribe(channel).unwrap();

  //loop {
  //  let payload : String = try!(msg.get_payload());
  //  println!("channel '{}': {}", msg.get_channel_name(), payload);
  //}

  loop {
    info!("PubSub");
    let message = pubsub.get_message().unwrap();
    let payload : String = message.get_payload().unwrap();
    info!("Message: {}", payload);
  }
}
