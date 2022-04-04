use crate::AnyhowResult;
use crate::clients::redis_client::RedisClient;
use crate::dispatcher::TextCommandHandler;
use crate::protos::binary_encode_proto::binary_encode_proto;
use crate::protos::inbound_proto_utils::{InboundEvent, InboundEventSource};
use crate::protos::protos;
use crate::text_chat_parsers::first_pass_command_parser::FirstPassParsedCommand;
use futures::executor::block_on;
use lazy_static::lazy_static;
use log::{info, warn, debug};
use prost::Message;
use regex::Regex;
use std::sync::{RwLock, Arc, Mutex};
use crate::protos::populate_source::populate_source;

// TODO: maybe separate text command handling and data source concerns
//  like this? Though maybe it's too early to optimize this.
pub struct TtsHandler {
  redis_client: Arc<Mutex<RedisClient>>,
}

impl TtsHandler {
  pub fn new(redis_client: Arc<Mutex<RedisClient>>) -> Self {
    Self {
      redis_client,
    }
  }

  fn handle(&self,
            tts: TtsCommand,
            event: &InboundEvent,
            event_source: &InboundEventSource)
            -> AnyhowResult<()> {

    let mut unreal_proto = protos::UnrealEventPayloadV1::default();

    // Payload
    let mut tts_proto = protos::VocodesTtsRequest::default();
    tts_proto.voice_slug = tts.speaker_slug;
    tts_proto.text = tts.utterance;

    debug!("Payload Proto: {:?}", tts_proto);

    unreal_proto.payload_type = protos::unreal_event_payload_v1::PayloadType::VocodesTts as i32;
    unreal_proto.payload_data = binary_encode_proto(tts_proto)?;
    unreal_proto.debug_message = "Hello from Rust!".to_string();

    populate_source(&mut unreal_proto, event_source)?;

    let final_binary = binary_encode_proto(unreal_proto)?;

    match self.redis_client.lock() {
      Ok(mut redis_client) => {
        debug!("Publishing to Redis...");
        let future = redis_client.publish_bytes("unreal", &final_binary);
        block_on(future);
        debug!("Published to redis");
      },
      Err(_) => {},
    }

    Ok(())
  }
}

impl TextCommandHandler for TtsHandler {
  fn handle_text_command(&self,
                         command: &FirstPassParsedCommand,
                         event: &InboundEvent,
                         event_source: &InboundEventSource)
                         -> AnyhowResult<()>
  {
    let maybe_tts_command = parse_tts(&command.unparsed_arguments);

    debug!("Maybe tts command: {:?}", maybe_tts_command);

    if let Some(tts) = maybe_tts_command {
      self.handle(tts, event, event_source);
    }
    Ok(())
  }
}

#[derive(Clone,Debug,PartialEq)]
pub struct TtsCommand {
  pub speaker_slug: String,
  pub utterance: String,
}

pub fn parse_tts(input: &str) -> Option<TtsCommand> {
  lazy_static! {
    static ref REGEX: Regex =
      Regex::new(r"^\s*([\w\-]+)\s+(.*)\s*$").expect("Regex should work");
  }

  let captures = match REGEX.captures(&input) {
    None => return None,
    Some(caps) => caps,
  };

  let maybe_speaker = captures.get(1)
    .map(|m| m.as_str());

  let maybe_utterance = captures.get(2)
    .map(|m| m.as_str());

  let speaker = match maybe_speaker {
    None => return None,
    Some(cap) => cap,
  };

  let utterance = match maybe_utterance {
    None => return None,
    Some(cap) => cap,
  };

  Some(TtsCommand {
    speaker_slug: speaker.to_lowercase(),
    utterance: utterance.to_string(),
  })
}

#[cfg(test)]
mod tests {
  use super::*;
  use expectest::prelude::*;

  #[test]
  fn failure_cases() {
    expect!(parse_tts("onewordthatstretcheson")).to(be_none());
    expect!(parse_tts("")).to(be_none());
    expect!(parse_tts("     ")).to(be_none());
    expect!(parse_tts(" !!! nope    ")).to(be_none());
  }

  #[test]
  fn speaker_and_sentence() {
    expect!(parse_tts("sonic gotta go fast")).to(
      be_eq(Some(TtsCommand {
        speaker_slug: "sonic".to_string(),
        utterance: "gotta go fast".to_string()
      })));
  }

  fn speaker_lowercase() {
    expect!(parse_tts("LINK EXCUSE ME PRINCESS")).to(
      be_eq(Some(TtsCommand {
        speaker_slug: "link".to_string(),
        utterance: "EXCUSE ME PRINCESS".to_string()
      })));
  }
}
