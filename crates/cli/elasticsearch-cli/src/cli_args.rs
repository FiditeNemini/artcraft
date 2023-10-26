use std::str::FromStr;

use clap::{App, Arg, ArgMatches};
use strum::{EnumCount, EnumString, IntoEnumIterator};
use strum::EnumIter;

use errors::{anyhow, AnyhowResult, bail};

pub struct CliArgs {
  pub mysql_environment: Environment,
  pub elasticsearch_environment: Environment,
  pub action: Action,
}

#[derive(Clone, Copy, Debug)]
pub enum Environment {
  Development,
  Production,
}

#[derive(Clone, Copy, Debug, EnumIter, EnumCount, EnumString, strum::Display)]
#[strum(serialize_all = "snake_case")]
pub enum Action {
  ReindexTts,
  SearchTts,
}

pub fn parse_cli_args() -> AnyhowResult<CliArgs> {
  let matches = App::new("dev-database-seed")
      .arg(Arg::with_name("action")
          .long("action")
          .help("action to take")
          .takes_value(true)
          .required(true))
      .arg(Arg::with_name("mysql")
          .long("mysql")
          .help("Production or development")
          .takes_value(true)
          .required(false))
      .arg(Arg::with_name("elasticsearch")
        .long("elasticsearch")
        .help("Production or development")
        .takes_value(true)
        .required(false))
      .get_matches();

  Ok(CliArgs {
    mysql_environment: to_environment(&matches, "mysql")?,
    elasticsearch_environment: to_environment(&matches, "elasticsearch")?,
    action: get_action(&matches)?,
  })
}

fn to_environment(matches: &ArgMatches, key: &str) -> AnyhowResult<Environment> {
  let value = matches.value_of(key)
      .map(|s| s.to_lowercase());

  Ok(match value.as_deref() {
    None => Environment::Development,
    Some("dev") | Some("development") => Environment::Development,
    Some("prod") | Some("production") => Environment::Production,
    _ => bail!("invalid environment: {:?}", value),
  })
}

fn get_action(matches: &ArgMatches) -> AnyhowResult<Action> {
  let action = matches.value_of("action")
      .map(|s| action_from_str(s))
      .transpose()?
      .ok_or(anyhow!("no action provided"))?;

  Ok(action)
}

fn action_from_str(value: &str) -> AnyhowResult<Action> {
  let action = Action::from_str(value)
      .map_err(|err| {
        let choices = Action::iter()
            .map(|e| e.to_string())
            .collect::<Vec<_>>();
        anyhow!("parse error: {:?}, provided: \"{}\" choices: {:?}", err, value, choices)
      })?;
  Ok(action)
}
