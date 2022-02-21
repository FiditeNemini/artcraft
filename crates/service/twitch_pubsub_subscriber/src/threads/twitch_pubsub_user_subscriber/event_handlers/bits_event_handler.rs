use container_common::anyhow_result::AnyhowResult;
use crate::threads::twitch_pubsub_user_subscriber::subscriber_preferences_cache::TwitchPubsubCachedState;
use crate::threads::twitch_pubsub_user_subscriber::tts_writer::TtsWriter;
use database_queries::queries::twitch::twitch_pubsub::insert_bits::TwitchPubsubBitsInsertBuilder;
use database_queries::queries::twitch::twitch_pubsub::insert_channel_points::TwitchPubsubChannelPointsInsertBuilder;
use r2d2_redis::r2d2;
use sqlx::MySql;
use std::sync::Arc;
use std::sync::RwLock;
use twitch_api2::pubsub::TopicData;
use twitch_api2::pubsub::channel_bits::{ChannelBitsEventsV2, ChannelBitsEventsV2Reply, BitsEventData};

pub struct BitsEventHandler {
  twitch_subscriber_state: Arc<RwLock<TwitchPubsubCachedState>>,
  mysql_pool: Arc<sqlx::Pool<MySql>>,
  tts_writer: Arc<TtsWriter>,
}

impl BitsEventHandler {
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

  pub async fn handle(&mut self, topic: ChannelBitsEventsV2, reply: Box<ChannelBitsEventsV2Reply>) -> AnyhowResult<()> {
    match *reply {
      ChannelBitsEventsV2Reply::BitsEvent { data, message_id, version, is_anonymous } => {
        self.handle_bits_event(&data).await?;
      }
      _ => {}
    }
    Ok(())
  }

  // NB: &mut is for Redis pool in downstream write_tts.
  async fn handle_bits_event(&mut self, data: &BitsEventData) -> AnyhowResult<()> {
    self.tts_writer.write_tts(&data.chat_message).await?;
    // Report event for analytics
    self.report_event_for_analytics(&data).await?;
    Ok(())
  }

  async fn report_event_for_analytics(&mut self, data: &BitsEventData) -> AnyhowResult<()> {
    let user_id = data.user_id.to_string();
    let user_name = data.user_name.to_string();
    let mut event_builder = TwitchPubsubBitsInsertBuilder::new();
    let mut event_builder = event_builder.set_sender_twitch_user_id(&user_id)
        .set_sender_twitch_username(&user_name)
        .set_destination_channel_id(&data.channel_id.to_string())
        .set_destination_channel_name(&data.channel_name.to_string())
        .set_bits_used(data.bits_used as u64)
        .set_total_bits_used(data.total_bits_used as u64)
        .set_is_anonymous(data.is_anonymous)
        .set_chat_message(&data.chat_message);
    event_builder.insert(&self.mysql_pool).await?;
    Ok(())
  }
}