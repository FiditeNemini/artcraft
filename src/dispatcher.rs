use crate::protos::protos;
use lazy_static::lazy_static;
use log::{info, warn};
use regex::Regex;
use std::collections::HashMap;

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

    let payload_type = message.ingestion_payload_type
      .and_then(|num| protos::pubsub_event_payload_v1::IngestionPayloadType::from_i32(num));

    let payload_type = match payload_type {
      Some(p) => p,
      None => {
        warn!("No payload type; skipping.");
        return;
      }
    };

    match payload_type {
      protos::pubsub_event_payload_v1::IngestionPayloadType::TwitchMessage => {

      },
      _ => {},
    }

    /*let message = match twitch_message.message_contents {
      None => return,
      Some(ref m) => m.clone(),
    };

    let captures = match COMMAND_REGEX.captures(&message) {
      None => return,
      Some(caps) => caps,
    };

    let command = match captures.get(1) {
      None => return,
      Some(cmd) => cmd.as_str().trim().to_lowercase(),
    };

    info!("Command: {}", command);

    let unparsed_payload = match captures.get(2) {
      None => return,
      Some(p) => p.as_str().trim(),
    };

    info!("Unparsed payload: {}", unparsed_payload);

    if let Some(ref handler) = self.handlers.get(&command) {
      handler.handle_message(&command, unparsed_payload, twitch_message);
    }*/
  }

  fn parse_message(&self, message: &str) -> String {
    lazy_static! {
      static ref COMMAND_REGEX : Regex = Regex::new(r"^\s*(\w+)\s+(.*)$").expect("Regex should work");
    }

    "".to_string()


  }
}

