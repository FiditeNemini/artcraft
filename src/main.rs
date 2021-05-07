#[macro_use]
extern crate lazy_static;
#[macro_use]
extern crate serde_derive;

mod dispatcher;
mod handlers;
mod proto_utils;
mod protos;
mod redis_client;
mod redis_subscriber;
mod secrets;
mod text_chat_parsers;

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
use crate::handlers::coordinate_and_geocode_handler::CoordinateAndGeocodeHandler;
use std::sync::{Arc, Mutex};

pub type AnyhowResult<T> = anyhow::Result<T>;

const ENV_SUBSCRIBE_TOPIC : &'static str = "SUBSCRIBE_TOPIC";
const ENV_SUBSCRIBE_TOPIC_DEFAULT : &'static str = "firehose";

const ENV_PUBLISH_TOPIC : &'static str = "PUBLISH_TOPIC";
const ENV_PUBLISH_TOPIC_DEFAULT : &'static str = "unreal";

#[tokio::main]
async fn main() -> anyhow::Result<()> {
  easyenv::init_env_logger(None);

  let redis_subscribe_topic = easyenv::get_env_string_or_default(
    ENV_SUBSCRIBE_TOPIC, ENV_SUBSCRIBE_TOPIC_DEFAULT);

  let secrets = Secrets::from_file("secrets.toml")?;

  let mut dispatcher = Dispatcher::new();

  let mut redis_client = RedisClient::new(&secrets.redis);
  redis_client.connect().await?;

  let redis_client = Arc::new(Mutex::new(redis_client));

  let coord_geo_handler = CoordinateAndGeocodeHandler::new(redis_client);

  dispatcher.add_text_command_handler("goto", Box::new(coord_geo_handler));

  let mut redis_pubsub_client = RedisSubscribeClient::new(
    &secrets.redis,
    dispatcher
  );

  redis_pubsub_client.connect().await?;

  loop {
    redis_pubsub_client.connect().await?;
    redis_pubsub_client.subscribe(&redis_subscribe_topic).await?;
    redis_pubsub_client.start_stream().await?;
    thread::sleep(Duration::from_secs(5));
  }

  Ok(())
}
