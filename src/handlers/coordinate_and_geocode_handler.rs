use crate::dispatcher::Handler;
use crate::protos::protos;
use lazy_static::lazy_static;
use regex::Regex;

pub struct CoordinateAndGeocodeHandler {
}

impl CoordinateAndGeocodeHandler {
  pub fn new() -> Self {
    Self {}
  }
}

impl Handler for CoordinateAndGeocodeHandler {

  /// Command payload contains the following example instruction:
  ///   * "34.0659° N, 84.6769° W"
  ///   * "33.753746, -84.386330"
  ///   * "Obihiro, Hokkaido, Japan"
  ///   * "Daytona, FL"
  fn handle_message(&self, command: &str, unparsed_command_args: &str, twitch_message: protos::TwitchMessage) {
    todo!()
  }
}

#[derive(Clone,Debug,PartialEq)]
pub struct LatLong {
  pub latitude: f64,
  pub longitude: f64,
}

/// Command payload contains the following example instruction:
///   * "34.0659° N, 84.6769° W"
///   * "33.753746, -84.386330"
pub fn parse_lat_long(input: &str) -> Option<LatLong> {
  lazy_static! {
      static ref COORDINATE_REGEX: Regex =
        Regex::new(r"^((\-?\d\.?\d*)\w*[NS]?).*,.*((\-?\d\.?\d*)\w*[EW]?)$").expect("Regex should work");
    }

  let captures = match COORDINATE_REGEX.captures(&input) {
    None => return None,
    Some(caps) => caps,
  };

  let maybe_lat = captures.get(2)
    .map(|m| m.as_str())
    .and_then(|s| s.parse::<f64>().ok());

  let maybe_long = captures.get(4)
    .map(|m| m.as_str())
    .and_then(|s| s.parse::<f64>().ok());

  let latitude = match maybe_lat {
    None => return None,
    Some(lat) => lat,
  };

  let longitude = match maybe_long {
    None => return None,
    Some(long) => long,
  };

  Some(LatLong {
    latitude,
    longitude
  })
}

#[cfg(test)]
mod tests {
  use super::*;
  use expectest::prelude::*;

  #[test]
  fn parse_lat_long_invalid() {
    expect!(parse_lat_long("foo bar baz")).to(be_none());
    expect!(parse_lat_long("1 2 3")).to(be_none());
  }

  #[test]
  fn parse_lat_long_raw_coordinates() {
    expect!(parse_lat_long("33.753746, -84.386330")).to(be_eq(Some(LatLong {
      latitude:33.753746,
      longitude: -84.386330,
    })));
  }

  #[test]
  fn parse_lat_long_directions() {
  }

}
