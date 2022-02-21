use twitch_api2::pubsub::{Topics, Topic};
use twitch_api2::pubsub;

pub fn build_pubsub_topics_for_user(user_id: u32) -> Vec<Topics> {
  vec![
    pubsub::channel_bits::ChannelBitsEventsV2 {
      channel_id: user_id,
    }.into_topic(),
    pubsub::channel_points::ChannelPointsChannelV1 {
      channel_id: user_id,
    }.into_topic(),
    pubsub::channel_cheer::ChannelCheerEventsPublicV1 {
      channel_id: user_id,
    }.into_topic(),
    pubsub::channel_subscriptions::ChannelSubscribeEventsV1 {
      channel_id: user_id,
    }.into_topic(),
  ]
}
