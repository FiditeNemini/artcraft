use crate::AnyhowResult;
use crate::clients::redis_client::RedisClient;
use crate::dispatcher::TextCommandHandler;
use crate::text_chat_parsers::first_pass_command_parser::FirstPassParsedCommand;
use futures::executor::block_on;
use lazy_static::lazy_static;
use log::{info, warn, debug};
use prost::Message;
use regex::Regex;
use std::sync::{RwLock, Arc, Mutex};
use crate::protos::inbound_proto_utils::{InboundEvent, InboundEventSource};
use crate::protos::populate_source::populate_source;
use crate::protos::protos;
use crate::protos::binary_encode_proto::binary_encode_proto;

// TODO: maybe separate text command handling and data source concerns
//  like this? Though maybe it's too early to optimize this.
pub struct CoordinateAndGeocodeHandler {
  redis_client: Arc<Mutex<RedisClient>>,
}

impl CoordinateAndGeocodeHandler {
  pub fn new(redis_client: Arc<Mutex<RedisClient>>) -> Self {
    Self {
      redis_client,
    }
  }

  fn handle_lat_long(&self,
                     lat_long: LatLong,
                     event: &InboundEvent,
                     event_source: &InboundEventSource) -> AnyhowResult<()>
  {
    let mut unreal_proto = protos::UnrealEventPayloadV1::default();

    // Cesium
    let mut cesium_proto = protos::CesiumWarpRequest::default();
    cesium_proto.latitude = lat_long.latitude;
    cesium_proto.longitude = lat_long.longitude;

    debug!("Payload Proto: {:?}", cesium_proto);

    unreal_proto.payload_type = protos::unreal_event_payload_v1::PayloadType::CesiumWarp as i32;
    unreal_proto.payload_data = binary_encode_proto(cesium_proto)?;
    unreal_proto.debug_message = "Hello from Rust!".to_string();

    populate_source(&mut unreal_proto, event_source)?;

    let final_binary = binary_encode_proto(unreal_proto)?;

    match self.redis_client.lock() {
      Ok(mut redis_client) => {
        debug!("Publishing to Redis...");
        let future = redis_client.publish_bytes("unreal", &final_binary);
        block_on(future);
        info!("Published to redis.");
      },
      Err(_) => {},
    }

    Ok(())
  }
}

impl TextCommandHandler for CoordinateAndGeocodeHandler {
  fn handle_text_command(&self,
                         command: &FirstPassParsedCommand,
                         event: &InboundEvent,
                         event_source: &InboundEventSource)
    -> AnyhowResult<()>
  {
    let maybe_lat_long = parse_lat_long(&command.unparsed_arguments);

    if let Some(lat_long) = maybe_lat_long {
      self.handle_lat_long(lat_long, event, event_source);
    }

    // TODO: Geocoding.

    Ok(())
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
