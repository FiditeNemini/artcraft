use crate::AnyhowResult;
use regex::Regex;

pub struct MessageToCommandParser {}

pub struct ParsedCommandFirstPass {
  pub command: String,
  pub raw_arguments: String,
}

impl MessageToCommandParser {

  pub fn parse_raw_command(message: &str) -> AnyhowResult<ParsedCommandFirstPass> {
    lazy_static! {
      static ref COMMAND_REGEX : Regex = Regex::new(r"^\s*(\w+)\s+(.*)$").expect("Regex should work");
    }

    Ok(ParsedCommandFirstPass {
      command: "".to_string(),
      raw_arguments: "".to_string()
    })
  }
}
