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
  const NUMERAL : &'static str = r"(\-?\d+\.?\d*)\s*([NSEW])?";
  lazy_static! {
      static ref COORDINATE_REGEX: Regex =
        Regex::new(&format!(r"^({})\s*,\s*({})$", NUMERAL, NUMERAL)).expect("Regex should work");
    }

  println!("{}", input);

  let captures = match COORDINATE_REGEX.captures(&input) {
    None => return None,
    Some(caps) => caps,
  };

  let maybe_lat = captures.get(2)
    .map(|m| {
      println!("{:?}", m);
      m.as_str()
    })
    .and_then(|s| s.parse::<f64>().ok());

  let maybe_lat_dir = captures.get(3)
    .map(|m| {
      println!("{:?}", m);
      m.as_str()
    });

  let maybe_long = captures.get(5)
    //.map(|m| m.as_str())
    .map(|m| {
      println!("{:?}", m);
      m.as_str()
    })
    .and_then(|s| s.parse::<f64>().ok());

  let maybe_long_dir = captures.get(6)
    .map(|m| {
      println!("{:?}", m);
      m.as_str()
    });

  println!("{:?}", maybe_lat);
  println!("{:?}", maybe_long);
  println!("{:?}", maybe_lat_dir);
  println!("{:?}", maybe_long_dir);

  let mut latitude = match maybe_lat {
    None => return None,
    Some(lat) => lat,
  };

  let mut longitude = match maybe_long {
    None => return None,
    Some(long) => long,
  };

  match maybe_lat_dir {
    Some("S") => latitude *= -1.0,
    _ => {},
  }

  match maybe_long_dir {
    Some("W") => longitude *= -1.0,
    _ => {},
  }

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
    expect!(parse_lat_long("33.753746, -84.386330")).to(
      be_eq(Some(LatLong {
        latitude: 33.753746,
        longitude: -84.386330,
      })));

    expect!(parse_lat_long("-123, -456")).to(
      be_eq(Some(LatLong {
        latitude: -123.0,
        longitude: -456.0,
      })));

    expect!(parse_lat_long("-99,100")).to(
      be_eq(Some(LatLong {
        latitude: -99.0,
        longitude: 100.0,
      })));
  }

  #[test]
  fn parse_lat_long_directions() {
    expect!(parse_lat_long("34.0659 N, 84.6769 W")).to(
      be_eq(Some(LatLong {
        latitude: 34.0659,
        longitude: -84.6769,
      })));

    expect!(parse_lat_long("123 S, 456 E")).to(
      be_eq(Some(LatLong {
        latitude: -123.0,
        longitude: 456.0,
      })));
  }
}
