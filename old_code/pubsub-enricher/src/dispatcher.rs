use crate::protos::protos;
use lazy_static::lazy_static;
use anyhow::anyhow;
use log::{info, warn, debug};
use regex::Regex;
use std::collections::HashMap;

use crate::AnyhowResult;
use crate::handlers::coordinate_and_geocode_handler::CoordinateAndGeocodeHandler;
use crate::text_chat_parsers::first_pass_command_parser::FirstPassParsedCommand;
use crate::protos::inbound_proto_utils::{InboundEvent, InboundEventSource};

pub trait TextCommandHandler {
  fn handle_text_command(&self,
                         command: &FirstPassParsedCommand,
                         event: &InboundEvent,
                         event_source: &InboundEventSource) -> AnyhowResult<()>;
}

pub struct Dispatcher {
  text_command_handlers: HashMap<String, Box<dyn TextCommandHandler>>,
}

impl Dispatcher {
  pub fn new() -> Self {
    Self {
      text_command_handlers: HashMap::new(),
    }
  }

  pub fn add_text_command_handler(&mut self, command: &str, handler: Box<dyn TextCommandHandler>) {
    self.text_command_handlers.insert(command.to_string(), handler);
  }

  pub fn handle_pubsub_event(&self, message: protos::PubsubEventPayloadV1) -> AnyhowResult<()> {
    info!("Handling Proto: {:?}", message);

    let event_source = InboundEventSource::parse_from_payload(&message)?;
    let event = InboundEvent::parse_from_payload(&message)?;

    info!("Source: {:?}", event_source);
    info!("Event: {:?}", event);

    match event {
      InboundEvent::TwitchMessage(ref message) => {
        let command = FirstPassParsedCommand::try_parse(&message.message_contents())?;
        self.handle_text_command(&command, &event, &event_source)?;
      }
    };

    // TODO... other event types, including non-text commands.

    Ok(())
  }

  /// Handle text-based commands.
  fn handle_text_command(&self,
                         command: &FirstPassParsedCommand,
                         event: &InboundEvent,
                         event_source: &InboundEventSource)
    -> AnyhowResult<()>
  {
    info!("Handle command: {}", &command.command);

    let handler = match self.text_command_handlers.get(&command.command) {
      Some(h) => h,
      None => {
        debug!("No handler for command: {}", &command.command);
        return Ok(());
      }
    };

    info!("Dispatching handler...");
    handler.handle_text_command(command, event, event_source)
  }
}
