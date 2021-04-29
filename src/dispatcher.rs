use crate::protos::protos;
use lazy_static::lazy_static;
use log::{info, warn};
use regex::Regex;

pub struct Dispatcher {
}

impl Dispatcher {
  pub fn new() -> Self {
    Self {}
  }

  pub fn handle_message(&self, message: protos::TwitchMessage) {
    lazy_static! {
      static ref COMMAND_REGEX : Regex = Regex::new(r"^\s*(\w+)\s+(.*)$").expect("Regex should work");
    }
    info!("Handling Proto: {:?}", message);

    //for cap in re.captures_iter(text) {
    //  println!("Month: {} Day: {} Year: {}", &cap[2], &cap[3], &cap[1]);
    //}

    let message_ref = match message.message_contents {
      None => return,
      Some(ref m) => m,
    };

    let captures = COMMAND_REGEX.captures(&message_ref).unwrap();
    info!("Captures: {:?}", captures);
  }
}

#[cfg(test)]
mod tests {
  #[test]
  fn test_types() {
  }
}
