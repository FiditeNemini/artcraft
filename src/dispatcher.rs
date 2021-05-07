use crate::protos::protos;
use lazy_static::lazy_static;
use log::{info, warn};
use regex::Regex;
use std::collections::HashMap;
use crate::proto_utils::get_payload_type;

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

  pub fn handle_pubsub_event(&self, message: protos::PubsubEventPayloadV1) {
    info!("Handling Proto: {:?}", message);

    let maybe_payload_type = get_payload_type(&message);

    let payload_type = match maybe_payload_type {
      Some(p) => p,
      None => {
        warn!("No payload type; skipping.");
        return;
      }
    };

    match payload_type {
      protos::pubsub_event_payload_v1::IngestionPayloadType::TwitchMessage => {
        info!("TWITCH MESSAGE!!!");
      },
      _ => {},
    }
  }
}

