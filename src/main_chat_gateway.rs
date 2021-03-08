#[macro_use]
extern crate serde_derive;

// NOTE: this demo requires `--features="tokio/full tokio-util"`.
use twitchchat::{
  commands, connector, messages,
  runner::{AsyncRunner, Status},
  UserConfig,
};

use anyhow::Context as _;
use anyhow::anyhow;

use redis::aio::Connection;
use redis::{AsyncCommands, RedisResult};

pub type AnyhowResult<T> = anyhow::Result<T>;

mod filesystem;
mod twitch_client;

use crate::filesystem::secrets::Secrets;

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

  let user_config = secrets.twitch.get_user_config()?;
  let channels = secrets.twitch.watch_channels.clone();

  // connect and join the provided channels
  let runner = connect(&user_config, &channels).await?;

  // you can get a handle to shutdown the runner
  /*let quit_handle = runner.quit_handle();

  // you can get a clonable writer
  let mut writer = runner.writer();

  // spawn something off in the background that'll exit in 10 seconds
  tokio::spawn({
    let mut writer = writer.clone();
    let channels = channels.clone();
    async move {

      for channel in &channels {
        println!("> SENDING HELLO");
        let cmd = commands::privmsg(&channel, "hello! testing from Rust");
        writer.encode(cmd).await.unwrap();

        println!("> SENDING HELLO #2");
        let cmd = commands::me(&channel, "hello! testing from Rust");
        writer.encode(cmd).await.unwrap();
      }


      println!("in 1000 seconds we'll exit");
      tokio::time::delay_for(std::time::Duration::from_secs(1000)).await;

      // send one final message to all channels
      for channel in &channels {
        let cmd = commands::privmsg(&channel, "goodbye, world");
        writer.encode(cmd).await.unwrap();
      }

      println!("sending quit signal");
      quit_handle.notify().await;
    }
  });*/

  // you can encode all sorts of 'commands'
  /*for channel in &channels {
    println!("> SENDING HELLO WORLD");
    writer
        .encode(commands::privmsg(channel, "hello world!"))
        .await?;
  }

  for channel in &channels {
    println!("> SENDING HELLO AGAIN");
    writer
        .encode(commands::privmsg(channel, "hello world again!"))
        .await?;
  }*/

  println!("starting main loop");
  // your 'main loop'. you'll just call next_message() until you're done
  main_loop(runner, &secrets).await
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
