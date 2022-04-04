#![allow(dead_code)]
#![allow(unused_mut)]
#![allow(unused_imports)]
#![warn(unused_must_use)]
//#![allow(warnings)]

#[macro_use]
extern crate lazy_static;
#[macro_use]
extern crate serde_derive;

mod clients;
mod dispatcher;
mod handlers;
mod protos;
mod secrets;
mod text_chat_parsers;

use anyhow::anyhow;
use anyhow::{Context, Error};
use log::{warn, info};
use redis::aio::Connection;
use redis::{AsyncCommands, RedisResult};
use std::thread;
use std::time::Duration;

use crate::clients::redis_client::RedisClient;
use crate::clients::redis_subscriber::RedisSubscribeClient;
use crate::dispatcher::Dispatcher;
use crate::handlers::coordinate_and_geocode_handler::CoordinateAndGeocodeHandler;
use crate::secrets::{Secrets, RedisSecrets};
use std::sync::{Arc, Mutex};
use crate::handlers::spawn_handler::SpawnHandler;
use crate::handlers::vocode_handler::TtsHandler;

pub type AnyhowResult<T> = anyhow::Result<T>;

const ENV_SUBSCRIBE_TOPIC : &'static str = "SUBSCRIBE_TOPIC";
const ENV_SUBSCRIBE_TOPIC_DEFAULT : &'static str = "firehose";

const ENV_PUBLISH_TOPIC : &'static str = "PUBLISH_TOPIC";
const ENV_PUBLISH_TOPIC_DEFAULT : &'static str = "unreal";

const ENV_REDIS_MAX_RETRY_COUNT : &'static str = "REDIS_MAX_RETRY_COUNT";
const ENV_REDIS_MAX_RETRY_COUNT_DEFAULT : u32 = 3;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
  easyenv::init_all_with_default_logging(None);

  info!("Reading env config...");

  let redis_subscribe_topic = easyenv::get_env_string_or_default(
    ENV_SUBSCRIBE_TOPIC, ENV_SUBSCRIBE_TOPIC_DEFAULT);

  let redis_max_retry_count = easyenv::get_env_num(
    ENV_REDIS_MAX_RETRY_COUNT,
    ENV_REDIS_MAX_RETRY_COUNT_DEFAULT)?;

  //let secrets = Secrets::from_file("secrets.toml")?;

  let redis_secrets = get_redis_secrets()?;

  let mut dispatcher = Dispatcher::new();

  let mut redis_client = RedisClient::new(
    &redis_secrets,
    redis_max_retry_count
  );

  info!("Connecting to Redis...");

  redis_client.connect().await?;

  let redis_client = Arc::new(Mutex::new(redis_client));

  dispatcher.add_text_command_handler(
    "goto",
    Box::new(CoordinateAndGeocodeHandler::new(redis_client.clone())));
  dispatcher.add_text_command_handler(
    "spawn",
    Box::new(SpawnHandler::new(redis_client.clone())));
  dispatcher.add_text_command_handler(
    "tts",
    Box::new(TtsHandler::new(redis_client.clone())));

  let mut redis_pubsub_client = RedisSubscribeClient::new(
    &redis_secrets,
    dispatcher
  );

  info!("Initial connect to PubSub Redis...");

  redis_pubsub_client.connect().await?;

  loop {
    info!("Main loop iter... (redis pubsub connect, subscribe, start stream...)");
    redis_pubsub_client.connect().await?;
    redis_pubsub_client.subscribe(&redis_subscribe_topic).await?;
    redis_pubsub_client.start_stream().await?;
    thread::sleep(Duration::from_secs(5));
  }

  Ok(())
}

fn get_redis_secrets() -> AnyhowResult<RedisSecrets> {
  Ok(RedisSecrets::new(
    &easyenv::get_env_string_or_default(
      "REDIS_USERNAME", ""),
    &easyenv::get_env_string_or_default(
      "REDIS_PASSWORD", ""),
    &easyenv::get_env_string_or_default(
      "REDIS_HOST", ""),
    easyenv::get_env_num::<u32>(
      "REDIS_PORT", 6379)?,
    easyenv::get_env_bool_or_default(
      "REDIS_USES_TLS", false),
  ))
}

