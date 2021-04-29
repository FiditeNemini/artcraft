#[macro_use]
extern crate serde_derive;

mod dispatcher;
mod protos;
mod redis_client;
mod redis_subscriber;
mod secrets;
use anyhow::anyhow;
use anyhow::{Context, Error};
use log::{warn, info};
use redis::aio::Connection;
use redis::{AsyncCommands, RedisResult};
use std::thread;
use std::time::Duration;

use crate::secrets::Secrets;
use crate::redis_client::RedisClient;
use crate::redis_subscriber::RedisSubscribeClient;
use crate::dispatcher::Dispatcher;

pub type AnyhowResult<T> = anyhow::Result<T>;

const ENV_SUBSCRIBE_TOPIC : &'static str = "SUBSCRIBE_TOPIC";
const ENV_SUBSCRIBE_TOPIC_DEFAULT : &'static str = "twitch";

#[tokio::main]
async fn main() -> anyhow::Result<()> {
  easyenv::init_env_logger(None);

  let redis_publish_topic = easyenv::get_env_string_or_default(
    ENV_SUBSCRIBE_TOPIC, ENV_SUBSCRIBE_TOPIC_DEFAULT);

  let secrets = Secrets::from_file("secrets.toml")?;

  let dispatcher = Dispatcher::new();

  let mut redis_client = RedisSubscribeClient::new(
    &secrets.redis,
    dispatcher
  );

  redis_client.connect().await?;

  loop {
    redis_client.connect().await?;
    redis_client.subscribe(&redis_publish_topic).await?;
    redis_client.start_stream().await?;
    thread::sleep(Duration::from_secs(5));
  }

  Ok(())
}
