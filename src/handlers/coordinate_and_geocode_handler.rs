use crate::dispatcher::Handler;
use crate::protos::protos;

pub struct CoordinateAndGeocodeHandler {
}

impl CoordinateAndGeocodeHandler {
  pub fn new() -> Self {
    Self {}
  }
}

impl Handler for CoordinateAndGeocodeHandler {
  fn handle_message(&self, command: &str, unparsed_command_args: &str, twitch_message: protos::TwitchMessage) {
    todo!()
  }
}
