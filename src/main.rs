#[macro_use]
extern crate serde_derive;

use anyhow::{Context, Error};
use anyhow::anyhow;

use redis::aio::Connection;
use redis::{AsyncCommands, RedisResult};

pub type AnyhowResult<T> = anyhow::Result<T>;

use std::thread;
use std::time::Duration;

mod protos;
mod redis_client;
mod secrets;

use crate::secrets::Secrets;
use crate::redis_client::RedisClient;

const ENV_SUBSCRIBE_TOPIC : &'static str = "SUBSCRIBE_TOPIC";
const ENV_SUBSCRIBE_TOPIC_DEFAULT : &'static str = "twitch";

#[tokio::main]
async fn main() -> anyhow::Result<()> {
  easyenv::init_env_logger(None);

  let redis_publish_topic = easyenv::get_env_string_or_default(
    ENV_SUBSCRIBE_TOPIC, ENV_SUBSCRIBE_TOPIC_DEFAULT);

  let secrets = Secrets::from_file("secrets.toml")?;

  let mut redis_client = RedisClient::new(&secrets.redis);
  redis_client.connect().await?;

  loop {
    /*match twitch_client.main_loop().await {
      Ok(_) => {
        println!("Early exit? Restarting...");
        thread::sleep(Duration::from_secs(5));
      },
      Err(e) => {
        println!("There was an error: {:?}", e);
        thread::sleep(Duration::from_secs(5));
        println!("Restarting client...");
      }
    }*/
    thread::sleep(Duration::from_secs(5));
  }

  Ok(())
}
