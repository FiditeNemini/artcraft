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

use futures::TryStreamExt;
use egg_mode::stream::StreamMessage;
use crate::secrets::Secrets;
use crate::clients::redis_client::RedisClient;
use log::{info, warn, debug};
use crate::clients::twitter_client::TwitterClient;

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

  let redis_publish_topic = easyenv::get_env_string_or_default(
    ENV_PUBLISH_TOPIC, ENV_PUBLISH_TOPIC_DEFAULT);

  let redis_max_retry_count = easyenv::get_env_num(
    ENV_REDIS_MAX_RETRY_COUNT,
    ENV_REDIS_MAX_RETRY_COUNT_DEFAULT)?;

  let secrets = Secrets::from_file("secrets.toml")?;

  let mut redis_client = RedisClient::new(
    &secrets.redis,
    redis_max_retry_count,
  );

  redis_client.connect().await?;

  info!("Verifying Twitter access token...");
  let twitter_access_token = secrets.twitter.verify_access_token().await?;

  info!("Streaming...");

  let mut twitter_client = TwitterClient::new(
    twitter_access_token,
    redis_client,
    redis_publish_topic,
  );

  twitter_client.main_loop().await;
  Ok(())
}