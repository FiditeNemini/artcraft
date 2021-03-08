use crate::filesystem::secrets::TwitchSecrets;
use twitchchat::{AsyncRunner, Status};
use twitchchat::messages::Commands::*;
use std::thread;
use std::time::Duration;
use crate::AnyhowResult;

pub struct TwitchClient {
  secrets: TwitchSecrets,
  channels_to_join: Vec<String>,

  /// This manages our connection.
  /// It's meant to be absent when not connected.
  /// TODO: Probably need to reset this when we disconnect.
  runner: Option<AsyncRunner>,
}

impl TwitchClient {

  pub fn new(secrets: &TwitchSecrets) -> Self {
    Self {
      secrets: secrets.clone(),
      channels_to_join: secrets.watch_channels.clone(), // TODO: Configure these elsewhere.
      runner: None,
    }
  }

  pub async fn connect(&mut self) -> AnyhowResult<()> {
    let user_config = self.secrets.get_user_config()?;
    let connector = twitchchat::connector::tokio::Connector::twitch()?;

    println!("Connecting...");
    let mut runner = AsyncRunner::connect(connector, &user_config).await?;

    println!("Connected. Our Twitch identity: {:#?}", runner.identity);

    for channel in self.channels_to_join.iter() {
      // the runner itself has 'blocking' join/part to ensure you join/leave a channel.
      // these two methods return whether the connection was closed early.
      // we'll ignore it for this demo
      println!("attempting to join '{}'", channel);

      let _ = runner.join(&channel).await?;
      println!("joined '{}'!", channel);
    }

    self.runner = Some(runner);

    Ok(())
  }

  pub async fn main_loop(&mut self) -> AnyhowResult<()> {
    loop {
      let runner = match &mut self.runner {
        None => {
          thread::sleep(Duration::from_secs(5));
          println!("Connecting...");
          self.connect().await?;
          continue;
        },
        Some(runner) => runner,
      };

      match runner.next_message().await? {
        Status::Message(message) => {
          // NB: Handles across all channels (and notifications from Twitch)
          self.handle_message(message)
        },
        Status::Quit => {
          // we signaled a quit
        },
        Status::Eof => {
          // the connection closed normally
        },
      }
    }

    Ok(())
  }

  pub fn handle_message(&self, message: twitchchat::messages::Commands<'_>) {
    match message {
      // This is the one users send to channels
      Privmsg(msg) => {
        println!("[{}] {}: {}", msg.channel(), msg.name(), msg.data());
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
}
