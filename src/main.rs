#![allow(dead_code)]
#![allow(unused_mut)]
#![allow(unused_imports)]
#![warn(unused_must_use)]
//#![allow(warnings)]

#[macro_use]
extern crate serde_derive;

mod clients;
mod secrets;
//mod util;

//use futures::TryStreamExt;
use egg_mode::stream::StreamMessage;
use crate::secrets::Secrets;
use crate::clients::redis_client::RedisClient;

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


  //let config = common::Config::load().await;
  //println!("Streaming tweets containing popular programming languages (and also Rust)");
  //println!("Ctrl-C to quit\n");

  let stream = egg_mode::stream::filter()
      .follow(&[1297106371238932481]) // vocodes
      //.track(&["rustlang", "python", "java", "javascript"])
      .language(&["en"])
      .start(&config.token)
      .try_for_each(|m| {
          if let StreamMessage::Tweet(tweet) = m {
              common::print_tweet(&tweet);
              println!("──────────────────────────────────────");
          } else {
              println!("{:?}", m);
          }
          futures::future::ok(())
      });

  if let Err(e) = stream.await {
      println!("Stream error: {}", e);
      println!("Disconnected")
  }

  Ok(())
}