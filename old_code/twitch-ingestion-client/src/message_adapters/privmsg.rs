use anyhow::anyhow;
use crate::AnyhowResult;
use crate::protos::{protos, binary_encode_proto};
use log::{info, warn, debug};
use twitchchat::messages::Privmsg;

pub fn privmsg_to_proto<'a>(message: &Privmsg<'a>) -> AnyhowResult<protos::PubsubEventPayloadV1>
{
  let mut payload_proto = protos::PubsubEventPayloadV1::default();

  payload_proto.ingestion_source_type =
    Some(protos::pubsub_event_payload_v1::IngestionSourceType::IstTwitch as i32);

  let binary_twitch_metadata = {
    let mut twitch_metadata = protos::IngestionTwitchMetadata::default();
    twitch_metadata.username = Some(message.name().trim().to_string());
    twitch_metadata.user_id = message.user_id().map(|unsigned| unsigned as i64);
    twitch_metadata.user_is_mod = Some(message.is_moderator());
    twitch_metadata.user_is_subscribed = Some(message.is_subscriber());
    twitch_metadata.channel = Some(message.channel().trim().to_string());

    debug!("Twitch Metadata Proto: {:?}", twitch_metadata);

    binary_encode_proto(twitch_metadata)
  }?;

  payload_proto.ingestion_source_data = Some(binary_twitch_metadata);

  payload_proto.ingestion_payload_type =
    Some(protos::pubsub_event_payload_v1::IngestionPayloadType::TwitchMessage as i32);

  let binary_twitch_message = {
    let mut twitch_message = protos::IngestionTwitchMessage::default();
    twitch_message.message_contents = Some(message.data().trim().to_string());

    // TODO: DEPRECATED
    twitch_message.username = Some(message.name().trim().to_string());
    twitch_message.user_id = message.user_id().map(|unsigned| unsigned as i64);
    twitch_message.is_mod = Some(message.is_moderator());
    twitch_message.is_subscribed = Some(message.is_subscriber());
    twitch_message.channel = Some(message.channel().trim().to_string());

    debug!("Twitch Message Proto: {:?}", twitch_message);

    binary_encode_proto(twitch_message)
  }?;

  payload_proto.ingestion_payload_data = Some(binary_twitch_message);

  Ok(payload_proto)
}
