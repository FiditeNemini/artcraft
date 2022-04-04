use anyhow::anyhow;
use crate::AnyhowResult;
use crate::clients::redis_client::RedisClient;
use crate::message_adapters::privmsg::privmsg_to_proto;
use crate::protos::{protos, binary_encode_proto};
use crate::secrets::TwitchSecrets;
use log::{info, warn, debug};
use prost::Message;
use std::thread;
use std::time::Duration;
use twitchchat::messages::Commands::*;
use twitchchat::messages::Join;
use twitchchat::messages::Privmsg;
use twitchchat::{AsyncRunner, Status};

pub struct TwitchClient {
  secrets: TwitchSecrets,
  channels_to_join: Vec<String>,
  redis_client: RedisClient,

  /// Redis topic to publish pubsub events to.
  redis_publish_topic: String,

  /// This manages our connection.
  /// It's meant to be absent when not connected.
  /// TODO: Probably need to reset this when we disconnect.
  runner: Option<AsyncRunner>,
}

impl TwitchClient {

  pub fn new(
    secrets: &TwitchSecrets,
    redis_client: RedisClient,
    redis_publish_topic: &str) -> Self
  {
    Self {
      secrets: secrets.clone(),
      redis_client,
      channels_to_join: secrets.watch_channels.clone(), // TODO: Configure these elsewhere.
      runner: None,
      redis_publish_topic: redis_publish_topic.to_string(),
    }
  }

  pub async fn connect(&mut self) -> AnyhowResult<()> {
    let user_config = self.secrets.get_user_config()?;
    let connector = twitchchat::connector::tokio::Connector::twitch()?;

    info!("Connecting to Twitch...");
    let mut runner = AsyncRunner::connect(connector, &user_config).await?;

    info!("Connected. Our Twitch identity: {:#?}", runner.identity);

    for channel in self.channels_to_join.iter() {
      info!("Attempting to join channel '{}'", channel);
      let _ = runner.join(&channel).await?;

      info!("Joined channel '{}'!", channel);
    }

    self.runner = Some(runner);

    Ok(())
  }

  pub async fn main_loop(&mut self) {
    loop {
      let mut runner = match &mut self.runner {
        Some(runner) => runner,
        None => {
          info!("Connecting to Twitch...");
          match self.connect().await {
            Ok(_) => {},
            Err(e) => {
              warn!("Failure to connect to Twitch: {:?}", e);
              thread::sleep(Duration::from_secs(5));
            },
          }
          continue;
        },
      };

      let next_message = match runner.next_message().await {
        Ok(msg) => msg,
        Err(e) => {
          warn!("Error getting message from Twitch: {:?}", e);
          thread::sleep(Duration::from_secs(5));
          continue;
        },
      };

      match next_message {
        Status::Message(message) => {
          // NB: Handles across all channels (and notifications from Twitch)
          match self.handle_message(message).await {
            Ok(_) => {},
            Err(e) => {
              warn!("Error handling most recent message: {:?}", e);
            }
          }
        },
        Status::Quit => {
          // we signaled a quit
          warn!("Status: Quit.");
        },
        Status::Eof => {
          // the connection closed normally
          warn!("Status: EOF.");
        },
      }
    }
  }

  async fn handle_message<'a>(&mut self,
                              message: twitchchat::messages::Commands<'a>) -> AnyhowResult<()>
  {
    match message {
      // These happen when you initially connect
      IrcReady(_) => {}
      Ready(_) => {}
      Cap(_) => {}

      // This is the one users send to channels
      Privmsg(msg) => self.handle_privmsg(&msg).await?,

      // This is when a user joins the channel
      // NB: These messages are delayed about 15-30 seconds.
      // Doesn't appear to work...?
      Join(msg) => info!("Join: {:?}", msg),

      // This should happen on subscription, etc.
      // Doesn't appear to work...?
      UserNotice(msg) => info!("UserNotice: {:?}", msg),

      // This should happen when a user joins, etc.
      // Doesn't appear to work...?
      // https://dev.twitch.tv/docs/irc/tags#userstate-twitch-tags
      UserState(msg) => info!("UserState: {:?}", msg),

      // and a bunch of other messages you may be interested in
      ClearChat(msg) => debug!("ClearChat: {:?}", msg),
      ClearMsg(msg) => debug!("ClearMsg: {:?}", msg),
      GlobalUserState(msg) => debug!("GlobalUserState: {:?}", msg),
      HostTarget(msg) => debug!("HostTarget: {:?}", msg),
      Notice(msg) => debug!("Notice: {:?}", msg),
      Part(msg) => debug!("Part: {:?}", msg),
      Ping(_) => {}
      Pong(_) => {}
      Reconnect(_) => {}
      RoomState(msg) => debug!("RoomState: {:?}", msg),
      Whisper(msg) => debug!("Whisper: {:?}", msg),

      // This one is special, if twitch adds any new message
      // types, this will catch it until future releases of
      // this crate add them.
      Raw(msg) => debug!("Raw: {:?}", msg),

      _ => {}
    }

    Ok(())
  }

  /// Handle user messages.
  /// The "privmsg" type is for normal in-channel messages.
  async fn handle_privmsg<'a>(&mut self, message: &Privmsg<'a>) -> AnyhowResult<()> {
    info!("[{}] {}: {}", message.channel(), message.name(), message.data());
    debug!("Full Message: {:?}", message);

    let message_proto = privmsg_to_proto(&message)?;
    let message_proto_binary = binary_encode_proto(message_proto)?;

    let _ = self.redis_client.publish_bytes(
      &self.redis_publish_topic, &message_proto_binary).await?;

    Ok(())
  }
}
