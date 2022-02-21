use container_common::anyhow_result::AnyhowResult;
use crate::threads::twitch_pubsub_user_subscriber::subscriber_preferences_cache::TwitchPubsubCachedState;
use crate::threads::twitch_pubsub_user_subscriber::tts_writer::TtsWriter;
use database_queries::queries::twitch::twitch_pubsub::insert_channel_points::TwitchPubsubChannelPointsInsertBuilder;
use r2d2_redis::r2d2;
use sqlx::MySql;
use std::sync::Arc;
use std::sync::RwLock;
use twitch_api2::pubsub::TopicData;
use twitch_api2::pubsub::channel_points::{ChannelPointsChannelV1, ChannelPointsChannelV1Reply, Redemption};

pub struct ChannelPointsEventHandler {
  twitch_subscriber_state: Arc<RwLock<TwitchPubsubCachedState>>,
  mysql_pool: Arc<sqlx::Pool<MySql>>,
  tts_writer: Arc<TtsWriter>,
}

impl ChannelPointsEventHandler {
  pub fn new(
    twitch_subscriber_state: Arc<RwLock<TwitchPubsubCachedState>>,
    mysql_pool: Arc<sqlx::Pool<MySql>>,
    tts_writer: Arc<TtsWriter>,
  ) -> Self {
    Self {
      twitch_subscriber_state,
      mysql_pool,
      tts_writer
    }
  }

  // NB: &mut is for Redis pool in downstream write_tts.
  pub async fn handle(&mut self, topic: ChannelPointsChannelV1, reply: Box<ChannelPointsChannelV1Reply>) -> AnyhowResult<()> {
    match *reply {
      // Unimplemented
      ChannelPointsChannelV1Reply::CustomRewardUpdated { .. } => {}
      ChannelPointsChannelV1Reply::RedemptionStatusUpdate { .. } => {}
      ChannelPointsChannelV1Reply::UpdateRedemptionStatusesFinished { .. } => {}
      ChannelPointsChannelV1Reply::UpdateRedemptionStatusProgress { .. } => {}
      // Implemented
      ChannelPointsChannelV1Reply::RewardRedeemed { timestamp, redemption } => {
        self.handle_reward_redeemed(redemption).await;
      }
      _ => {},
    }
    Ok(())
  }

  // NB: &mut is for Redis pool in downstream write_tts.
  async fn handle_reward_redeemed(&mut self, redemption: Redemption) -> AnyhowResult<()> {
    if let Some(user_text) = redemption.user_input.as_deref() {
      self.tts_writer.write_tts(user_text).await?;
    }
    // Report event for analytics
    self.report_event_for_analytics(&redemption).await?;
    Ok(())
  }

  async fn report_event_for_analytics(&self, redemption: &Redemption) -> AnyhowResult<()> {
    let mut event_builder = TwitchPubsubChannelPointsInsertBuilder::new();

    let user_id = redemption.user.id.to_string();
    let user_name = redemption.user.login.to_string();

    let mut event_builder = event_builder.set_sender_twitch_user_id(&user_id)
        .set_sender_twitch_username(&user_name)
        .set_destination_channel_id(&redemption.channel_id.to_string())
        // TODO:
        .set_destination_channel_name("todo: not available")
        .set_title(&redemption.reward.title)
        .set_prompt(&redemption.reward.prompt)
        .set_user_text_input(redemption.user_input.as_deref())
        .set_redemption_id(&redemption.id.to_string())
        .set_reward_id(&redemption.reward.id.to_string())
        .set_is_sub_only(redemption.reward.is_sub_only)
        .set_reward_cost(redemption.reward.cost as u64);
    // TODO:
    // .set_max_per_stream(redemption.reward.max_per_stream as u64)
    // .set_max_per_user_per_stream(redemption.reward.max_per_user_per_stream as u64);
    event_builder.insert(&self.mysql_pool).await?;

    Ok(())
  }
}