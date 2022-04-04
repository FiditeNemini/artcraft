#![allow(dead_code)]
#![allow(unused_mut)]
#![allow(unused_imports)]
#![warn(unused_must_use)]
//#![allow(warnings)]

#[macro_use]
extern crate serde_derive;

mod clients;
mod protos;
mod secrets;

use crate::clients::redis_client::RedisClient;
use crate::clients::twitter_client::TwitterClient;
use crate::secrets::RedisSecrets;
use crate::secrets::Secrets;
use crate::secrets::TwitterSecrets;
use egg_mode::stream::StreamMessage;
use futures::TryStreamExt;
use log::{info, warn, debug};

pub type AnyhowResult<T> = anyhow::Result<T>;

const ENV_PUBLISH_TOPIC : &'static str = "PUBLISH_TOPIC";
const ENV_PUBLISH_TOPIC_DEFAULT : &'static str = "firehose";

const ENV_REDIS_MAX_RETRY_COUNT : &'static str = "REDIS_MAX_RETRY_COUNT";
const ENV_REDIS_MAX_RETRY_COUNT_DEFAULT : u32 = 3;

/// Monitor Twitter for interesting events against our account.
/// With this implementation, we can capture: Mentions, Retweets, Replies.
/// We cannot capture: Follows.
#[tokio::main]
async fn main() -> anyhow::Result<()>
{
  easyenv::init_all_with_default_logging(None);

  info!("Reading env config...");

  let redis_publish_topic = easyenv::get_env_string_or_default(
    ENV_PUBLISH_TOPIC, ENV_PUBLISH_TOPIC_DEFAULT);

  let redis_max_retry_count = easyenv::get_env_num(
    ENV_REDIS_MAX_RETRY_COUNT,
    ENV_REDIS_MAX_RETRY_COUNT_DEFAULT)?;

  //let secrets = Secrets::from_file("secrets.toml")?;

  let redis_secrets = get_redis_secrets()?;
  let twitter_secrets = get_twitter_secrets()?;

  let mut redis_client = RedisClient::new(
    &redis_secrets,
    redis_max_retry_count,
  );

  info!("Connecting to Redis...");

  redis_client.connect().await?;

  info!("Verifying Twitter access token...");
  let twitter_access_token = twitter_secrets.verify_access_token().await?;

  info!("Streaming from Twitter...");

  let mut twitter_client = TwitterClient::new(
    twitter_access_token,
    redis_client,
    redis_publish_topic,
  );

  twitter_client.main_loop().await;
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

fn get_twitter_secrets() -> AnyhowResult<TwitterSecrets> {
  Ok(TwitterSecrets::new(
    &easyenv::get_env_string_required("TWITTER_API_KEY")?,
    &easyenv::get_env_string_required("TWITTER_API_SECRET")?,
    &easyenv::get_env_string_optional("TWITTER_ACCESS_KEY"),
    &easyenv::get_env_string_optional("TWITTER_ACCESS_SECRET"),
  ))
}
