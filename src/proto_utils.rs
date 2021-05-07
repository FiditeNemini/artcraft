use anyhow::anyhow;
use crate::AnyhowResult;
use crate::protos::protos::IngestionTwitchMessage;
use crate::protos::protos::IngestionTwitchMetadata;
use crate::protos::protos::PubsubEventPayloadV1;
use crate::protos::protos::pubsub_event_payload_v1::IngestionPayloadType;
use crate::protos::protos::pubsub_event_payload_v1::IngestionSourceType;
use crate::protos::protos;
use prost::Message;

// TODO: add some type safety w/ generics and type bounds

pub fn get_source_type(event_payload: &PubsubEventPayloadV1)
  -> Option<IngestionSourceType>
{
  event_payload.ingestion_payload_type
    .and_then(|num| IngestionSourceType::from_i32(num))
}

pub fn get_payload_type(event_payload: &PubsubEventPayloadV1)
  -> Option<IngestionPayloadType>
{
  event_payload.ingestion_payload_type
    .and_then(|num| IngestionPayloadType::from_i32(num))
}


// ================= TWITCH ================= //

// TODO: make an enum wrapper for each type, then return that
pub fn get_twitch_metadata(event_payload: &PubsubEventPayloadV1)
  -> AnyhowResult<IngestionTwitchMetadata>
{
  let source_type = match get_source_type(event_payload) {
    None => return Err(anyhow!("no source type!")),
    Some(p) => p,
  };

  match source_type {
    IngestionSourceType::IstTwitch => {},
    _ => return Err(anyhow!("wrong source type!")),
  }

  IngestionTwitchMetadata::decode(event_payload.ingestion_source_data())
    .map_err(|_| anyhow!("error decoding source proto"))
}

// TODO: make an enum wrapper for each type, then return that
pub fn get_twitch_message(event_payload: &PubsubEventPayloadV1)
  -> AnyhowResult<IngestionTwitchMessage>
{
  let payload_type = match get_payload_type(event_payload) {
    None => return Err(anyhow!("no payload type!")),
    Some(p) => p,
  };

  match payload_type {
    IngestionPayloadType::TwitchMessage => {},
    _ => return Err(anyhow!("wrong payload type!")),
  }

  IngestionTwitchMessage::decode(event_payload.ingestion_payload_data())
    .map_err(|_| anyhow!("error decoding payload proto"))
}
