// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

use resolve::hostname;
use std::convert::From;
use std::fs::File;
use std::io::Error;
use std::io::Read;
use std::io;
use toml;

#[derive(Clone, Debug, RustcEncodable, RustcDecodable)]
pub struct Config {
  /// Whether or not to send/respect client caching headers.
  pub use_caching_headers: Option<bool>,

  /// Where sound files are located.
  pub sound_path: Option<String>,
  pub html_path: Option<String>,

  /// Where various arpabet files are located.
  pub phoneme_dictionary_file: Option<String>,
  pub extra_dictionary_file: Option<String>,
  pub square_dictionary_file: Option<String>,

  /// Where the abbreviation file is found.
  pub abbreviation_file: Option<String>,

  /// What events to log.
  pub log_handler: Option<bool>,
  pub log_parsing: Option<bool>,
  pub log_syllable_decomposition: Option<bool>,
  pub log_synthesis: Option<bool>,
  pub log_timing: Option<bool>,
}

#[derive(Debug)]
pub enum ConfigError {
  /// Wraps an IO error.
  IoError { cause: io::Error },
  /// TOML parsing error.
  TomlError,
  /// Configs absent.
  TomlMissing,
}

impl Config {
  /// Static CTOR.
  /// Read a [default] set of configs and merge with a ["$hostname"] set.
  pub fn read(filename: &str) -> Result<Config, ConfigError> {
    let contents = try!(read_file(filename));

    let table = match toml::Parser::new(&contents).parse() {
      None => { return Err(ConfigError::TomlError); },
      Some(table) => table,
    };

    let system_hostname = hostname::get_hostname().ok();

    let maybe_host = if system_hostname.is_some() {
      table.get(&system_hostname.unwrap())
          .and_then(|t| toml::decode::<Config>(t.clone()))
    } else {
      None
    };

    let maybe_default = table.get("default")
        .and_then(|t| toml::decode::<Config>(t.clone()));

    if maybe_default.is_none() {
      if maybe_host.is_none() {
        return Err(ConfigError::TomlMissing);
      } else {
        return Ok(maybe_host.unwrap());
      }
    }

    let default = maybe_default.unwrap();

    if maybe_host.is_some() {
      let host = maybe_host.unwrap();
      Ok(host.merge(default))
    } else {
      Ok(default)
    }
  }

  /// Merge another config object, keeping current values where they
  /// exist, and overriding Optional values where they do not.
  pub fn merge(&self, other: Config) -> Config {
    // TODO: Simplify using generics. Maybe a trait, such as "x.as_default_or(y)"
    Config {
      use_caching_headers: self.use_caching_headers
          .clone()
          .or(other.use_caching_headers.clone()),
      sound_path: self.sound_path
          .clone()
          .or(other.sound_path.clone()),
      html_path: self.html_path
          .clone()
          .or(other.html_path.clone()),
      phoneme_dictionary_file: self.phoneme_dictionary_file
          .clone()
          .or(other.phoneme_dictionary_file.clone()),
      extra_dictionary_file: self.extra_dictionary_file
          .clone()
          .or(other.extra_dictionary_file.clone()),
      square_dictionary_file: self.square_dictionary_file
          .clone()
          .or(other.square_dictionary_file.clone()),
      abbreviation_file: self.abbreviation_file
          .clone()
          .or(other.abbreviation_file.clone()),
      log_handler: self.log_handler
          .clone()
          .or(other.log_handler.clone()),
      log_parsing: self.log_parsing
          .clone()
          .or(other.log_parsing.clone()),
      log_syllable_decomposition: self.log_syllable_decomposition
          .clone()
          .or(other.log_syllable_decomposition.clone()),
      log_synthesis: self.log_synthesis
          .clone()
          .or(other.log_synthesis.clone()),
      log_timing: self.log_timing
          .clone()
          .or(other.log_timing.clone()),
    }
  }
}

impl From<io::Error> for ConfigError {
  fn from(error: io::Error) -> ConfigError {
    ConfigError::IoError { cause: error }
  }
}

fn read_file(filename: &str) -> Result<String, Error> {
  let mut file = try!(File::open(filename));
  let mut buf = String::new();
  try!(file.read_to_string(&mut buf));
  Ok(buf)
}

