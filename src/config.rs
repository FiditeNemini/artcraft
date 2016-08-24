// Copyright (c) 2016 Brandon Thomas <bt@brand.io>

use std::fs::File;
use std::io::Error;
use std::io::prelude::*;
use toml;

#[derive(Debug, RustcEncodable, RustcDecodable)]
pub struct Config {
  pub sound_path_development: String,
  pub sound_path_production: String,
  pub phoneme_dictionary_file_development: String,
  pub phoneme_dictionary_file_production: String,
}

impl Config {
  pub fn read(filename: &str) -> Option<Config> {
    match Config::read_file(filename) {
      Err(_) => None,
      Ok(contents) => {
        let value = toml::Parser::new(&contents).parse().unwrap();
        toml::decode(toml::Value::Table(value))
      }
    }
  }

  fn read_file(filename: &str) -> Result<String, Error> {
    let mut file = try!(File::open(filename));
    let mut buf = String::new();
    try!(file.read_to_string(&mut buf));
    Ok(buf)
  }
}

