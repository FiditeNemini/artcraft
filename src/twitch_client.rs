use anyhow::anyhow;
use log::{info, warn};
use prost::Message;
use std::thread;
use std::time::Duration;
use twitchchat::messages::Commands::*;
use twitchchat::messages::Privmsg;
use twitchchat::{AsyncRunner, Status};

use crate::AnyhowResult;
use crate::redis_client::RedisClient;
use crate::secrets::TwitchSecrets;
use crate::protos::protos;

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

  pub fn new(secrets: &TwitchSecrets, redis_client: RedisClient, redis_publish_topic: &str) -> Self {
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
      // the runner itself has 'blocking' join/part to ensure you join/leave a channel.
      // these two methods return whether the connection was closed early.
      // we'll ignore it for this demo
      info!("attempting to join '{}'", channel);

      let _ = runner.join(&channel).await?;
      info!("joined '{}'!", channel);
    }

    self.runner = Some(runner);

    Ok(())
  }

  pub async fn main_loop(&mut self) -> AnyhowResult<()> {
    loop {
      let runner = match &mut self.runner {
        None => {
          thread::sleep(Duration::from_secs(5));
          info!("Connecting to Twitch...");
          self.connect().await?;
          continue;
        },
        Some(runner) => runner,
      };

      match runner.next_message().await? {
        Status::Message(message) => {
          // NB: Handles across all channels (and notifications from Twitch)
          self.handle_message(message).await
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

  pub async fn handle_message<'a>(&mut self, message: twitchchat::messages::Commands<'a>) {
    match message {
      // This is the one users send to channels
      Privmsg(msg) => self.handle_privmsg(&msg).await,

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

  /// Handle user messages.
  /// The "privmsg" type is for normal in-channel messages.
  async fn handle_privmsg<'a>(&mut self, message: &Privmsg<'a>) {
    info!("[{}] {}: {}", message.channel(), message.name(), message.data());
    info!("Full Message: {:?}", message);

    info!("Encoding as proto...");

    let message_proto = match message_to_proto(&message) {
      Ok(message) => message,
      Err(e) => {
        warn!("Proto build error: {:?}", e);
        return;
      }
    };

    let message_proto_binary = match binary_encode_proto(message_proto) {
      Ok(binary) => binary,
      Err(e) => {
        warn!("Proto encode error: {:?}", e);
        return;
      }
    };

    let redis_result = self.redis_client.publish_bytes(
      &self.redis_publish_topic, &message_proto_binary).await;

    match redis_result {
      Ok(_) => {},
      Err(e) => {
        warn!("Redis error: {:?}", e);
        self.redis_client.failure_notify_maybe_reconnect().await;
      }
    }
  }
}

fn message_to_proto<'a>(message: &Privmsg<'a>) -> AnyhowResult<protos::PubsubEventPayloadV1> {
  let mut payload_proto = protos::PubsubEventPayloadV1::default();

  payload_proto.ingestion_source_type =
    Some(protos::pubsub_event_payload_v1::IngestionSourceType::IstTwitch as i32);

  let binary_twitch_metadata = {
    let mut twitch_metadata = protos::IngestionTwitchMetadata::default();
    twitch_metadata.username = Some(message.name().trim().to_string());
    twitch_metadata.user_id = message.user_id().map(|unsigned| unsigned as i64);
    twitch_metadata.user_is_mod = Some(message.is_moderator());
    twitch_metadata.user_is_subscribed = Some(message.is_subscriber());
    twitch_metadata.channel = Some(message.channel().trim().to_string());

    info!("Twitch Metadata Proto: {:?}", twitch_metadata);

    binary_encode_proto(twitch_metadata)
  }?;

  payload_proto.ingestion_source_data = Some(binary_twitch_metadata);

  payload_proto.ingestion_payload_type =
    Some(protos::pubsub_event_payload_v1::IngestionPayloadType::TwitchMessage as i32);

  let binary_twitch_message = {
    let mut twitch_message = protos::IngestionTwitchMessage::default();
    twitch_message.message_contents = Some(message.data().trim().to_string());

    // TODO: DEPRECATED
    twitch_message.username = Some(message.name().trim().to_string());
    twitch_message.user_id = message.user_id().map(|unsigned| unsigned as i64);
    twitch_message.is_mod = Some(message.is_moderator());
    twitch_message.is_subscribed = Some(message.is_subscriber());
    twitch_message.channel = Some(message.channel().trim().to_string());

    info!("Twitch Message Proto: {:?}", twitch_message);

    binary_encode_proto(twitch_message)
  }?;

  payload_proto.ingestion_payload_data = Some(binary_twitch_message);

  Ok(payload_proto)
}

// Binary encode a proto.
fn binary_encode_proto(proto: impl prost::Message) -> AnyhowResult<Vec<u8>> {
  let mut buffer : Vec<u8> = Vec::with_capacity(proto.encoded_len());
  let encode_result = proto.encode(&mut buffer);

  match encode_result {
    Err(e) => {
      Err(anyhow!("Inner proto encode result: {:?}", e))
    }
    Ok(_) => {
      Ok(buffer)
    }
  }
}

// Oh my god I'm lazy
// https://stackoverflow.com/a/41517340
fn split_once(in_string: &str) -> AnyhowResult<(&str, &str)> {
  let mut splitter = in_string.trim().splitn(2, ' ');
  let first = splitter.next().ok_or(anyhow!("no match"))?;
  let second = splitter.next().ok_or(anyhow!("no match"))?;
  Ok((first, second))
}
