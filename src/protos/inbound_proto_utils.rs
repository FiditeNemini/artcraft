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

/// Sources of events
#[derive(Debug, Clone)]
pub enum InboundEventSource {
  Twitch(IngestionTwitchMetadata),
}

/// Events
#[derive(Debug, Clone)]
pub enum InboundEvent {
  TwitchMessage(IngestionTwitchMessage),
}

impl InboundEventSource {
  pub fn parse_from_payload(event_payload: &PubsubEventPayloadV1)
    -> AnyhowResult<Self>
  {
    match Self::parse_type_proto(event_payload) {
      Some(IngestionSourceType::IstTwitch) => {
        IngestionTwitchMetadata::decode(event_payload.ingestion_source_data())
          .map(|m| Self::Twitch(m))
          .map_err(|_| anyhow!("error decoding source proto"))
      },
      None => Err(anyhow!("invalid source type")),
      Some(_) => Err(anyhow!("source type is not yet handled")),
    }
  }

  fn parse_type_proto(event_payload: &PubsubEventPayloadV1)
    -> Option<IngestionSourceType>
  {
    event_payload.ingestion_source_type
      .and_then(|num| IngestionSourceType::from_i32(num))
  }
}

impl InboundEvent {
  pub fn parse_from_payload(event_payload: &PubsubEventPayloadV1)
    -> AnyhowResult<Self>
  {
    match Self::parse_type_proto(event_payload) {
      Some(IngestionPayloadType::TwitchMessage) => {
        IngestionTwitchMessage::decode(event_payload.ingestion_payload_data())
          .map(|m| Self::TwitchMessage(m))
          .map_err(|_| anyhow!("error decoding payload proto"))
      },
      None => Err(anyhow!("invalid payload type")),
      Some(_) => Err(anyhow!("payload type is not yet handled")),
    }
  }

  fn parse_type_proto(event_payload: &PubsubEventPayloadV1)
    -> Option<IngestionPayloadType>
  {
    event_payload.ingestion_payload_type
      .and_then(|num| IngestionPayloadType::from_i32(num))
  }
}

