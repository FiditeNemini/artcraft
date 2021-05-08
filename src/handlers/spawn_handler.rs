use crate::AnyhowResult;
use crate::clients::redis_client::RedisClient;
use crate::dispatcher::TextCommandHandler;
use crate::inbound_proto_utils::{InboundEvent, InboundEventSource};
use crate::protos::{protos, binary_encode_proto};
use crate::text_chat_parsers::first_pass_command_parser::FirstPassParsedCommand;
use futures::executor::block_on;
use lazy_static::lazy_static;
use log::{info, warn, debug};
use prost::Message;
use regex::Regex;
use std::sync::{RwLock, Arc, Mutex};

// TODO: maybe separate text command handling and data source concerns
//  like this? Though maybe it's too early to optimize this.
pub struct SpawnHandler {
  redis_client: Arc<Mutex<RedisClient>>,
}

impl SpawnHandler {
  pub fn new(redis_client: Arc<Mutex<RedisClient>>) -> Self {
    Self {
      redis_client,
    }
  }

  fn handle(&self,
            spawn: SpawnCommand,
            event: &InboundEvent,
            event_source: &InboundEventSource)
            -> AnyhowResult<()> {

    let mut unreal_proto = protos::UnrealEventPayloadV1::default();

    // Payload
    let mut spawn_proto = protos::SpawnCreatureRequest::default();
    spawn_proto.name_slug = spawn.spawn_slug;

    debug!("Payload Proto: {:?}", spawn_proto);

    unreal_proto.payload_type = protos::unreal_event_payload_v1::PayloadType::CesiumWarp as i32;
    unreal_proto.payload_data = binary_encode_proto(spawn_proto)?;
    unreal_proto.debug_message = "Hello from Rust!".to_string();

    // Source data
    match event_source {
      InboundEventSource::Twitch(ref twitch_source) => {
        let mut twitch_metadata = protos::TwitchMetadata::default();
        twitch_metadata.username = twitch_source.username.clone().unwrap_or("".to_string());
        twitch_metadata.user_id = twitch_source.user_id.clone().unwrap_or(0);
        twitch_metadata.user_is_mod = twitch_source.user_is_mod.unwrap_or(false);
        twitch_metadata.user_is_subscribed = twitch_source.user_is_subscribed.unwrap_or(false);
        twitch_metadata.channel = twitch_source.channel.clone().unwrap_or("".to_string());

        debug!("Source Proto: {:?}", twitch_metadata);

        unreal_proto.source_type = protos::unreal_event_payload_v1::SourceType::StTwitch as i32;
        unreal_proto.source_data = binary_encode_proto(twitch_metadata)?;
      }
    }

    let publish_binary = binary_encode_proto(unreal_proto)?;

    match self.redis_client.lock() {
      Ok(mut redis_client) => {
        debug!("Publishing to Redis...");
        let future = redis_client.publish_bytes("unreal", &publish_binary);
        block_on(future);
        debug!("Published to redis");
      },
      Err(_) => {},
    }

    Ok(())
  }
}

impl TextCommandHandler for SpawnHandler {
  fn handle_text_command(&self,
                         command: &FirstPassParsedCommand,
                         event: &InboundEvent,
                         event_source: &InboundEventSource)
                         -> AnyhowResult<()>
  {
    let maybe_spawn_command = parse_spawn(&command.unparsed_arguments);

    debug!("Maybe spawn command: {:?}", maybe_spawn_command);

    if let Some(spawn) = maybe_spawn_command {
      self.handle(spawn, event, event_source);
    }
    Ok(())
  }
}

#[derive(Clone,Debug,PartialEq)]
pub struct SpawnCommand {
  pub spawn_slug: String,
  // TODO: Args in the future.
}

pub fn parse_spawn(input: &str) -> Option<SpawnCommand> {
  lazy_static! {
    static ref REGEX: Regex =
      Regex::new(r"^\s*([\w\-]+)\s*$").expect("Regex should work");
  }

  let captures = match REGEX.captures(&input) {
    None => return None,
    Some(caps) => caps,
  };

  let maybe_capture = captures.get(1)
    .map(|m| m.as_str());


  let capture = match maybe_capture {
    None => return None,
    Some(cap) => cap,
  };

  Some(SpawnCommand {
    spawn_slug: capture.to_string(),
  })
}

#[cfg(test)]
mod tests {
  use super::*;
  use expectest::prelude::*;

  #[test]
  fn failure_cases() {
    expect!(parse_spawn("too many words")).to(be_none());
    expect!(parse_spawn("")).to(be_none());
    expect!(parse_spawn("     ")).to(be_none());
  }

  #[test]
  fn single_word() {
    expect!(parse_spawn("goomba")).to(
      be_eq(Some(SpawnCommand {
        spawn_slug: "goomba".to_string(),
      })));
  }

  #[test]
  fn hyphenated_word() {
    expect!(parse_spawn("like-like")).to(
      be_eq(Some(SpawnCommand {
        spawn_slug: "like-like".to_string(),
      })));
  }
}
