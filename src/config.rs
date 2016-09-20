// Copyright (c) 2016 Brandon Thomas <bt@brand.io>

use resolve::hostname;
use std::fs::File;
use std::io::Error;
use std::io::prelude::*;
use toml;

#[derive(Clone, Debug, RustcEncodable, RustcDecodable)]
pub struct Config {
  /// Machine hostname
  /// TODO: This being public is a total hack.
  /// Really, this shouldn't even be in the config.
  pub hostname: String,

  /// Whether or not to send/respect client caching headers.
  pub use_caching_headers: bool,

  pub sound_path_development: String,
  pub sound_path_production: String,

  pub phoneme_dictionary_file_development: String,
  pub phoneme_dictionary_file_production: String,

  pub extra_dictionary_file_development: String,
  pub extra_dictionary_file_production: String,

  pub square_dictionary_file_development: String,
  pub square_dictionary_file_production: String,
}

impl Config {
  /// Static CTOR.
  pub fn read(filename: &str) -> Option<Config> {
    match read_file(filename) {
      Err(_) => None,
      Ok(contents) => {
        let value = toml::Parser::new(&contents).parse().unwrap();
        let mut config = toml::decode(toml::Value::Table(value));

        config.map(|mut c: Config| {
          c.hostname = get_hostname();
          c
        })
      }
    }
  }

  /// Get the sound directory path.
  pub fn get_sound_path(&self) -> String {
    if self.hostname == "x16" {
      self.sound_path_development.clone()
    } else {
      self.sound_path_production.clone()
    }
  }
}

fn read_file(filename: &str) -> Result<String, Error> {
  let mut file = try!(File::open(filename));
  let mut buf = String::new();
  try!(file.read_to_string(&mut buf));
  Ok(buf)
}

// TODO: This is a total hack.
fn get_hostname() -> String {
  match hostname::get_hostname() {
    Ok(s) => { s.to_string() },
    Err(_) => { "".to_string() },
  }
}

