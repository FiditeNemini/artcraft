use anyhow::anyhow;
use crate::AnyhowResult;
use lazy_static::lazy_static;
use log::debug;
use regex::Regex;

struct FirstPassParsedCommand {
  /// The first "word" / "verb" of a sentence.
  /// This is all-lowercase, no spaces, `[\w\-]+`
  pub command: String,

  /// The remaining portion, stripped of leading/trailing spaces.
  pub unparsed_arguments: String,
}

impl FirstPassParsedCommand {

  pub fn try_parse(message: &str) -> AnyhowResult<Self> {
    lazy_static! {
      static ref COMMAND_REGEX : Regex = Regex::new(r"^\s*([\w\-]+)\s+(.*)\s*$").expect("should parse");
    }

    let captures = match COMMAND_REGEX.captures(&message) {
      None => return Err(anyhow!("message could not parse")),
      Some(caps) => caps,
    };

    let command = match captures.get(1) {
      None => return Err(anyhow!("could not get first capture group")),
      Some(cmd) => cmd.as_str().trim().to_lowercase(),
    };

    debug!("Command: {}", &command);

    let unparsed_payload = match captures.get(2) {
      None => return Err(anyhow!("could not get second capture group")),
      Some(p) => p.as_str().trim().to_string(),
    };

    debug!("Unparsed payload: {}", &unparsed_payload);

    Ok(Self {
      command: command,
      unparsed_arguments: unparsed_payload,
    })
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn failure_cases() {
    assert!(FirstPassParsedCommand::try_parse("").is_err());
    assert!(FirstPassParsedCommand::try_parse("     ").is_err());
    assert!(FirstPassParsedCommand::try_parse("foo").is_err());
    assert!(FirstPassParsedCommand::try_parse("foo-bar").is_err());
  }

  #[test]
  fn parse_two_words() {
    let r = FirstPassParsedCommand::try_parse("foo bar");
    assert!(r.is_ok());
    let r = r.expect("Is okay");
    assert_eq!(&r.command, "foo");
    assert_eq!(&r.unparsed_arguments, "bar");
  }

  #[test]
  fn parse_two_words_spaces() {
    let r = FirstPassParsedCommand::try_parse("  foo \t   bar \t \n ");
    assert!(r.is_ok());
    let r = r.expect("Is okay");
    assert_eq!(&r.command, "foo");
    assert_eq!(&r.unparsed_arguments, "bar");
  }

  #[test]
  fn parse_hyphenated_command() {
    let r = FirstPassParsedCommand::try_parse("foo-bar baz");
    assert!(r.is_ok());
    let r = r.expect("Is okay");
    assert_eq!(&r.command, "foo-bar");
    assert_eq!(&r.unparsed_arguments, "baz");
  }
}
