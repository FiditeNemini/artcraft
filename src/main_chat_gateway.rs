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

mod filesystem;
mod twitch_client;

use crate::filesystem::secrets::Secrets;
use crate::twitch_client::TwitchClient;
use std::thread;
use std::time::Duration;

async fn connect(user_config: &UserConfig, channels: &[String]) -> anyhow::Result<AsyncRunner> {
  let connector = connector::tokio::Connector::twitch()?;

  println!("Connecting...");
  let mut runner = AsyncRunner::connect(connector, user_config).await?;

  println!("Connected.");

  println!("Our Twitch identity: {:#?}", runner.identity);

  for channel in channels {
    // the runner itself has 'blocking' join/part to ensure you join/leave a channel.
    // these two methods return whether the connection was closed early.
    // we'll ignore it for this demo
    println!("attempting to join '{}'", channel);
    let _ = runner.join(&channel).await?;
    println!("joined '{}'!", channel);
  }

  Ok(runner)
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
  let secrets = Secrets::from_file("secrets.toml")?;

  let mut twitch_client = TwitchClient::new(&secrets.twitch);

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

pub async fn main_loop(mut runner: AsyncRunner, secrets: &Secrets) -> anyhow::Result<()> {
  println!("Connect to redis: {}", secrets.redis.connection_url());
  let client = redis::Client::open(secrets.redis.connection_url())?;
  let mut connection = client.get_async_connection().await?;

  //let mut con = client.get_connection()?;
  //let mut pubsub = con.as_pubsub();

  loop {
    match runner.next_message().await? {
      // this is the parsed message -- across all channels (and notifications from Twitch)
      Status::Message(msg) => {
        println!("Handle message time!");
        handle_message(msg , &mut connection ).await;
      }

      // you signaled a quit
      Status::Quit => {
        println!("we signaled we wanted to quit");
        break;
      }
      // the connection closed normally
      Status::Eof => {
        println!("we got a 'normal' eof");
        break;
      }
    }
  }

  Ok(())
}


// Oh my god I'm lazy
// https://stackoverflow.com/a/41517340
fn split_once(in_string: &str) -> AnyhowResult<(&str, &str)> {
  let mut splitter = in_string.splitn(2, ' ');
  let first = splitter.next().ok_or(anyhow!("no match"))?;
  let second = splitter.next().ok_or(anyhow!("no match"))?;
  Ok((first, second))
}

// you can generally ignore the lifetime for these types.
async fn handle_message(msg: messages::Commands<'_> , connection: &mut Connection  ) {
  use messages::Commands::*;
  // All sorts of messages
  match msg {
    // This is the one users send to channels
    Privmsg(msg) => {
      println!("[{}] {}: {}", msg.channel(), msg.name(), msg.data());

      if let Ok((command, message)) = split_once(msg.data()) {
        println!("Command: {} message: {}", command, message);

        let result : RedisResult<u32> = connection.publish(command, message).await;
        result.expect("Should work");
      }
    },

    // This one is special, if twitch adds any new message
    // types, this will catch it until future releases of
    // this crate add them.
    Raw(_) => {}

    // These happen when you initially connect
    IrcReady(_) => {}
    Ready(_) => {}
    Cap(_) => {}

    // and a bunch of other messages you may be interested in
    ClearChat(_) => {}
    ClearMsg(_) => {}
    GlobalUserState(_) => {}
    HostTarget(_) => {}
    Join(_) => {}
    Notice(_) => {}
    Part(_) => {}
    Ping(_) => {}
    Pong(_) => {}
    Reconnect(_) => {}
    RoomState(_) => {}
    UserNotice(_) => {}
    UserState(_) => {}
    Whisper(_) => {}

    _ => {}
  }
}
