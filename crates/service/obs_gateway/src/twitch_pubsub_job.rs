use config::shared_constants::DEFAULT_RUST_LOG;
use container_common::anyhow_result::AnyhowResult;
use futures::executor::{ThreadPool, ThreadPoolBuilder};
use log::info;
use std::thread::sleep;
use std::time::Duration;
use crate::twitch::twitch_client_wrapper::TwitchClientWrapper;
use crate::twitch::websocket_client::TwitchWebsocketClient;
use futures::task::SpawnExt;
use tokio::runtime::Builder;

pub mod twitch;
pub mod util;

#[tokio::main]
pub async fn main() -> AnyhowResult<()> {
  easyenv::init_all_with_default_logging(Some(DEFAULT_RUST_LOG));

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
      .thread_name("my-custom-name")
      .thread_stack_size(3 * 1024 * 1024)
      .enable_all()
      .build()?;

  info!("Thread pool created");

  //thread_pool.spawn(watch_user_thread())?;
  runtime.spawn(watch_user_thread(10));
  runtime.spawn(watch_user_thread(9999));

  loop {
    sleep(Duration::from_millis(1000));
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