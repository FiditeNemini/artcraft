use anyhow::anyhow;
use crate::AnyhowResult;
use crate::protos::protos::IngestionTwitchMessage;
use crate::protos::protos::pubsub_event_payload_v1::IngestionPayloadType;
use crate::protos::protos;
use prost::Message;

// TODO: add some type safety w/ generics and type bounds

pub fn get_payload_type(event_payload: &protos::PubsubEventPayloadV1)
  -> Option<protos::pubsub_event_payload_v1::IngestionPayloadType>
{
  event_payload.ingestion_payload_type
    .and_then(|num| IngestionPayloadType::from_i32(num))
}

pub fn get_twitch_message(event_payload: &protos::PubsubEventPayloadV1)
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
    .map_err(|_| anyhow!("error decoding proto"))
}
