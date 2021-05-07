use crate::protos::protos;
use lazy_static::lazy_static;
use anyhow::anyhow;
use log::{info, warn};
use regex::Regex;
use std::collections::HashMap;
use crate::proto_utils::{get_payload_type, get_twitch_message, get_twitch_metadata};
use crate::AnyhowResult;

pub trait Handler {
  /*fn handle_message(&self,
                    command: &str,
                    unparsed_command_args: &str,
                    twitch_message: protos::TwitchMessage);*/
}

pub struct Dispatcher {
  handlers: HashMap<String, Box<dyn Handler>>,
}

impl Dispatcher {
  pub fn new() -> Self {
    Self {
      handlers: HashMap::new(),
    }
  }

  pub fn add_handler(&mut self, command: &str, handler: Box<dyn Handler>) {
    self.handlers.insert(command.to_string(), handler);
  }

  pub fn handle_pubsub_event(&self, message: protos::PubsubEventPayloadV1) -> AnyhowResult<()> {
    info!("Handling Proto: {:?}", message);

    let maybe_payload_type = get_payload_type(&message);

    let payload_type = match maybe_payload_type {
      Some(p) => p,
      None => {
        warn!("No payload type; skipping.");
        return Err(anyhow!("No payload type; skipping."));
      }
    };

    match payload_type {
      protos::pubsub_event_payload_v1::IngestionPayloadType::TwitchMessage => {
        let twitch_metadata = get_twitch_metadata(&message)?;
        info!("Twitch metadata: {:?}", twitch_metadata);

        let twitch_message = get_twitch_message(&message)?;
        info!("Twitch message: {:?}", twitch_message);
      },
      _ => {},
    }

    Ok(())
  }
}

