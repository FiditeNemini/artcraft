#![allow(dead_code)]
#![allow(unused_mut)]
#![allow(unused_imports)]
#![warn(unused_must_use)]
//#![allow(warnings)]


#[macro_use]
extern crate serde_derive;

mod clients;
mod message_adapters;
mod protos;
mod secrets;

// NOTE: this demo requires `--features="tokio/full tokio-util"`.
use twitchchat::{
  commands, connector, messages,
  runner::{AsyncRunner, Status},
  UserConfig,
};

use anyhow::anyhow;
use anyhow::{Context, Error};
use crate::clients::redis_client::RedisClient;
use crate::clients::twitch_client::TwitchClient;
use crate::secrets::Secrets;
use log::{info, warn};
use redis::aio::Connection;
use redis::{AsyncCommands, RedisResult};
use std::thread;
use std::time::Duration;

pub type AnyhowResult<T> = anyhow::Result<T>;

const ENV_PUBLISH_TOPIC : &'static str = "PUBLISH_TOPIC";
const ENV_PUBLISH_TOPIC_DEFAULT : &'static str = "firehose";

const ENV_REDIS_MAX_RETRY_COUNT : &'static str = "REDIS_MAX_RETRY_COUNT";
const ENV_REDIS_MAX_RETRY_COUNT_DEFAULT : u32 = 3;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
  easyenv::init_env_logger(None);

  let redis_publish_topic = easyenv::get_env_string_or_default(
    ENV_PUBLISH_TOPIC, ENV_PUBLISH_TOPIC_DEFAULT);

  let redis_max_retry_count = easyenv::get_env_num(
    ENV_REDIS_MAX_RETRY_COUNT,
    ENV_REDIS_MAX_RETRY_COUNT_DEFAULT)?;

  let secrets = Secrets::from_file("secrets.toml")?;

  let mut redis_client = RedisClient::new(
    &secrets.redis,
    redis_max_retry_count
  );

  redis_client.connect().await?;

  let mut twitch_client = TwitchClient::new(
    &secrets.twitch,
    redis_client,
    &redis_publish_topic
  );

  loop {
    twitch_client.main_loop().await; // NB: Doesn't return.
    thread::sleep(Duration::from_secs(5));
    warn!("Restarting Twitch client...");
  }

  Ok(())
}
