#[macro_use]
extern crate serde_derive;

// NOTE: this demo requires `--features="tokio/full tokio-util"`.
use twitchchat::{
  commands, connector, messages,
  runner::{AsyncRunner, Status},
  UserConfig,
};

use anyhow::{Context, Error};
use anyhow::anyhow;

use redis::aio::Connection;
use redis::{AsyncCommands, RedisResult};

pub type AnyhowResult<T> = anyhow::Result<T>;

use std::thread;
use std::time::Duration;

mod redis_client;
mod secrets;
mod twitch_client;

use crate::twitch_client::TwitchClient;
use crate::secrets::Secrets;
use crate::redis_client::RedisClient;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
  let secrets = Secrets::from_file("secrets.toml")?;

  let mut redis_client = RedisClient::new(&secrets.redis);
  let mut twitch_client = TwitchClient::new(&secrets.twitch, redis_client);

  loop {
    match twitch_client.main_loop().await {
      Ok(_) => {
        println!("Early exit? Restarting...");
        thread::sleep(Duration::from_secs(5));
      },
      Err(e) => {
        println!("There was an error: {:?}", e);
        thread::sleep(Duration::from_secs(5));
        println!("Restarting client...");
      }
    }
  }

  Ok(())
}
