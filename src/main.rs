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
use crate::secrets::{Secrets, RedisSecrets, TwitchSecrets};
use log::{info, warn};
use redis::aio::Connection;
use redis::{AsyncCommands, RedisResult};
use std::thread;
use std::time::Duration;

pub type AnyhowResult<T> = anyhow::Result<T>;

// Redis connection

const ENV_REDIS_USERNAME : &'static str = "REDIS_USERNAME";
const ENV_REDIS_USERNAME_DEFAULT : &'static str = "root";

const ENV_REDIS_PASSWORD : &'static str = "REDIS_PASSWORD";
const ENV_REDIS_PASSWORD_DEFAULT : &'static str = "";

const ENV_REDIS_HOST: &'static str = "REDIS_HOST";
const ENV_REDIS_HOST_DEFAULT: &'static str = "localhost";

const ENV_REDIS_PORT: &'static str = "REDIS_PORT";
const ENV_REDIS_PORT_DEFAULT: u32 = 6379;

// Redis publishing

const ENV_PUBLISH_TOPIC : &'static str = "PUBLISH_TOPIC";
const ENV_PUBLISH_TOPIC_DEFAULT : &'static str = "firehose";

const ENV_REDIS_MAX_RETRY_COUNT : &'static str = "REDIS_MAX_RETRY_COUNT";
const ENV_REDIS_MAX_RETRY_COUNT_DEFAULT : u32 = 3;


#[tokio::main]
async fn main() -> anyhow::Result<()> {
  easyenv::init_env_logger(None);

  info!("Reading env configs...");

  let redis_secrets = get_redis_secrets()?;
  let twitch_secrets = get_twitch_secrets()?;

  let redis_publish_topic = easyenv::get_env_string_or_default(
    ENV_PUBLISH_TOPIC, ENV_PUBLISH_TOPIC_DEFAULT);

  let redis_max_retry_count = easyenv::get_env_num(
    ENV_REDIS_MAX_RETRY_COUNT,
    ENV_REDIS_MAX_RETRY_COUNT_DEFAULT)?;

  //let secrets = Secrets::from_file("secrets.toml")?;

  let mut redis_client = RedisClient::new(
    &redis_secrets,
    redis_max_retry_count
  );

  info!("Connecting Redis client...");

  redis_client.connect().await?;

  let mut twitch_client = TwitchClient::new(
    &twitch_secrets,
    redis_client,
    &redis_publish_topic
  );

  info!("Beginning Twitch main loop...");

  loop {
    twitch_client.main_loop().await; // NB: Doesn't return.
    thread::sleep(Duration::from_secs(5));
    warn!("Restarting Twitch client...");
  }
}

fn get_redis_secrets() -> AnyhowResult<RedisSecrets> {
  let redis_username = easyenv::get_env_string_or_default(
    ENV_REDIS_USERNAME, ENV_REDIS_USERNAME_DEFAULT);

  let redis_password = easyenv::get_env_string_or_default(
    ENV_REDIS_PASSWORD, ENV_REDIS_PASSWORD_DEFAULT);

  let redis_hostname = easyenv::get_env_string_or_default(
    ENV_REDIS_HOST, ENV_REDIS_HOST_DEFAULT);

  let redis_port = easyenv::get_env_num::<u32>(
    ENV_REDIS_PORT, ENV_REDIS_PORT_DEFAULT)?;

  Ok(RedisSecrets::new(
    &redis_username,
    &redis_password,
    &redis_hostname,
    redis_port
  ))
}

fn get_twitch_secrets() -> AnyhowResult<TwitchSecrets> {
  let watch_channels = vec![
    "#vocodes",
    "#testytest512",
    "#ech310n",
  ].iter()
    .map(|s| s.to_string())
    .collect();

  Ok(TwitchSecrets::new(
    &easyenv::get_env_string_required("TWITCH_USERNAME")?,
    &easyenv::get_env_string_required("TWITCH_STREAM_KEY")?,
    &easyenv::get_env_string_required("TWITCH_APP_CLIENT_ID")?,
    &easyenv::get_env_string_required("TWITCH_APP_CLIENT_SECRET")?,
    &easyenv::get_env_string_required("TWITCH_OAUTH_ACCESS_TOKEN")?,
    &watch_channels,
  ))
}
