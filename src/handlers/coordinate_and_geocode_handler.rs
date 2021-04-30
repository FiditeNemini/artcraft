use crate::dispatcher::Handler;
use crate::protos::protos;
use crate::redis_client::RedisClient;
use futures::executor::block_on;
use lazy_static::lazy_static;
use log::{info, warn};
use prost::Message;
use regex::Regex;
use std::sync::{RwLock, Arc, Mutex};

pub struct CoordinateAndGeocodeHandler {
  redis_client: Arc<Mutex<RedisClient>>,
}

impl CoordinateAndGeocodeHandler {
  pub fn new(redis_client: Arc<Mutex<RedisClient>>) -> Self {
    Self {
      redis_client,
    }
  }

  fn handle_lat_long(&self, lat_long: LatLong, twitch_message: protos::TwitchMessage) {
    let mut cesium_proto = protos::CesiumWarpRequest::default();

    // Cesium
    cesium_proto.latitude = Some(lat_long.latitude);
    cesium_proto.longitude = Some(lat_long.longitude);

    // Twitch
    cesium_proto.twitch_username = twitch_message.username.clone();
    cesium_proto.twitch_user_id = twitch_message.user_id.clone();
    cesium_proto.twitch_user_is_mod = twitch_message.is_mod.clone();
    cesium_proto.twitch_user_is_subscribed = twitch_message.is_subscribed.clone();

    let mut unreal_proto = protos::UnrealEventPayloadV1::default();
    unreal_proto.payload_type = Some(protos::unreal_event_payload_v1::PayloadType::CesiumWarp as i32);

    let mut buffer : Vec<u8> = Vec::with_capacity(cesium_proto.encoded_len());
    let encode_result = cesium_proto.encode(&mut buffer);
    match encode_result {
      Err(e) => {
        warn!("Proto encode result: {:?}", e);
        return;
      }
      Ok(_) => {
        unreal_proto.payload = Some(buffer);
      }
    }

    info!("Proto: {:?}", cesium_proto);

    match self.redis_client.lock() {
      Ok(mut redis_client) => {
        let future = redis_client.publish("goto", "");
        block_on(future);
      },
      Err(_) => {},
    }
  }
}

impl Handler for CoordinateAndGeocodeHandler {

  /// Command payload contains the following example instruction:
  ///   * "34.0659° N, 84.6769° W"
  ///   * "33.753746, -84.386330"
  ///   * "Obihiro, Hokkaido, Japan"
  ///   * "Daytona, FL"
  fn handle_message(&self, command: &str, unparsed_command_args: &str, twitch_message: protos::TwitchMessage) {
    let maybe_lat_long = parse_lat_long(unparsed_command_args);

    if let Some(lat_long) = maybe_lat_long {
      self.handle_lat_long(lat_long, twitch_message);
      return;
    }

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
  const NUMERAL : &'static str = r"(\-?\d+\.?\d*)\s*°?\s*([NSEW])?";
  lazy_static! {
    static ref COORDINATE_REGEX: Regex =
      Regex::new(&format!(r"^({})\s*,?\s*({})$", NUMERAL, NUMERAL)).expect("Regex should work");
  }

  let captures = match COORDINATE_REGEX.captures(&input) {
    None => return None,
    Some(caps) => caps,
  };

  let maybe_lat = captures.get(2)
    .map(|m| m.as_str())
    .and_then(|s| s.parse::<f64>().ok());

  let maybe_lat_dir = captures.get(3)
    .map(|m| m.as_str());

  let maybe_long = captures.get(5)
    .map(|m| m.as_str())
    .and_then(|s| s.parse::<f64>().ok());

  let maybe_long_dir = captures.get(6)
    .map(|m| m.as_str());

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

  #[test]
  fn parse_lat_long_directions_degrees() {
    expect!(parse_lat_long("34.0659°  N, 84.6769° W")).to(
      be_eq(Some(LatLong {
        latitude: 34.0659,
        longitude: -84.6769,
      })));

    expect!(parse_lat_long("123°S, 777° E")).to(
      be_eq(Some(LatLong {
        latitude: -123.0,
        longitude: 777.0,
      })));
  }
}
