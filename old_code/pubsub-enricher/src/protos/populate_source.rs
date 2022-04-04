use anyhow::anyhow;
use crate::AnyhowResult;
use crate::protos::binary_encode_proto::binary_encode_proto;
use crate::protos::protos::UnrealEventPayloadV1;
use crate::protos::protos;
use log::{info, warn, debug};
use crate::protos::inbound_proto_utils::InboundEventSource;

pub fn populate_source(unreal_proto: &mut UnrealEventPayloadV1, event_source: &InboundEventSource) -> AnyhowResult<()>
{
  match event_source {
    InboundEventSource::Twitch(ref twitch_source) => {
      let mut twitch_metadata = protos::TwitchMetadata::default();
      twitch_metadata.username = twitch_source.username.clone().unwrap_or("".to_string());
      twitch_metadata.user_id = twitch_source.user_id.clone().unwrap_or(0);
      twitch_metadata.user_is_mod = twitch_source.user_is_mod.unwrap_or(false);
      twitch_metadata.user_is_subscribed = twitch_source.user_is_subscribed.unwrap_or(false);
      twitch_metadata.channel = twitch_source.channel.clone().unwrap_or("".to_string());

      debug!("Source Proto: {:?}", twitch_metadata);

      unreal_proto.source_type = protos::unreal_event_payload_v1::SourceType::StTwitch as i32;
      unreal_proto.source_data = binary_encode_proto(twitch_metadata)?;
    },
    _ => {
      return Err(anyhow!("Unknown event source proto."));
    },
  }

  Ok(())
}
