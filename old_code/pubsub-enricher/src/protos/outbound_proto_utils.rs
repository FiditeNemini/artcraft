use anyhow::anyhow;
use crate::AnyhowResult;
use crate::protos::protos::IngestionTwitchMessage;
use crate::protos::protos::IngestionTwitchMetadata;
use crate::protos::protos::PubsubEventPayloadV1;
use crate::protos::protos::pubsub_event_payload_v1::IngestionPayloadType;
use crate::protos::protos::pubsub_event_payload_v1::IngestionSourceType;
use crate::protos::protos;
use prost::Message;

pub enum OutboundPayload {
}

pub enum OutboundSourceInfo {
  Twitch(),
}