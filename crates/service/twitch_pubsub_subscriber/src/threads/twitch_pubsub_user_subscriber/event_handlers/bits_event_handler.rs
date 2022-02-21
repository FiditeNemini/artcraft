use anyhow::anyhow;
use container_common::anyhow_result::AnyhowResult;
use container_common::collections::random_from_vec::random_from_vec;
use container_common::numerics::signed_to_unsigned::i64_to_unsigned_zeroing_negatives;
use crate::threads::twitch_pubsub_user_subscriber::subscriber_preferences_cache::{TwitchPubsubCachedState, TwitchEventRuleLight};
use crate::threads::twitch_pubsub_user_subscriber::tts_writer::TtsWriter;
use database_queries::column_types::twitch_event_category::TwitchEventCategory;
use database_queries::complex_models::event_match_predicate::EventMatchPredicate;
use database_queries::complex_models::event_responses::EventResponse;
use database_queries::queries::twitch::twitch_pubsub::insert_bits::TwitchPubsubBitsInsertBuilder;
use database_queries::queries::twitch::twitch_pubsub::insert_channel_points::TwitchPubsubChannelPointsInsertBuilder;
use log::info;
use r2d2_redis::r2d2;
use rand::seq::SliceRandom;
use sqlx::MySql;
use std::sync::RwLock;
use std::sync::{Arc, PoisonError, RwLockReadGuard};
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

  pub async fn handle(&self, topic: ChannelBitsEventsV2, reply: Box<ChannelBitsEventsV2Reply>) -> AnyhowResult<()> {
    match *reply {
      ChannelBitsEventsV2Reply::BitsEvent { data, message_id, version, is_anonymous } => {
        self.handle_bits_event(&data).await?;
      }
      _ => {} // NB: There are no other enum variants as of 2022-02-21
    }
    Ok(())
  }

  async fn handle_bits_event(&self, data: &BitsEventData) -> AnyhowResult<()> {
    let maybe_rule = self.find_matching_rule(data)?;
    if let Some(rule) = maybe_rule {
      self.handle_matched_rule(&rule, data).await?;
      self.report_event_for_analytics(&data).await?; // Report event for analytics
    }
    Ok(())
  }

  async fn report_event_for_analytics(&self, data: &BitsEventData) -> AnyhowResult<()> {
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

  fn find_matching_rule(&self, data: &BitsEventData) -> AnyhowResult<Option<TwitchEventRuleLight>> {
    return match self.twitch_subscriber_state.read() {
      Err(e) => { Err(anyhow!("Lock error: {:?}", e)) },
      Ok(state) => {
        let maybe_rule = state.event_rules.iter()
            .filter(|rule| rule.event_category.eq(&TwitchEventCategory::Bits))
            .find(|rule| {
              match rule.event_match_predicate {
                EventMatchPredicate::NotSet => false, // Not set
                EventMatchPredicate::ChannelPointsRewardNameExactMatch { .. } => false, // Wrong type
                EventMatchPredicate::BitsCheermoteNameExactMatch { ref cheermote_name } => {
                  false // TODO
                },
                EventMatchPredicate::BitsCheermoteNameSpendThreshold { ref cheermote_name_prefix, minimum_bits_spent } => {
                  false // TODO
                },
                EventMatchPredicate::BitsSpendThreshold { minimum_bits_spent } => {
                  let spent = i64_to_unsigned_zeroing_negatives(data.bits_used);
                  spent >= minimum_bits_spent
                },
              }
            })
            .map(|rule| rule.clone());
        Ok(maybe_rule)
      }
    };
  }

  async fn handle_matched_rule(&self, rule: &TwitchEventRuleLight, data: &BitsEventData) -> AnyhowResult<()> {
    match rule.event_response {
      EventResponse::NotSet => {
        info!("Empty event response.");
        return Ok(())
      },
      EventResponse::TtsSingleVoice { ref tts_model_token } => {
        self.tts_writer.write_tts_with_model(&data.chat_message, tts_model_token).await?;
      }
      EventResponse::TtsRandomVoice { ref tts_model_tokens } => {
        let maybe_token = random_from_vec(tts_model_tokens);
        if let Some(token) = maybe_token {
          self.tts_writer.write_tts_with_model(&data.chat_message, token.as_str())
              .await?;
        }
      }
    }

    Ok(())
  }
}