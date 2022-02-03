use anyhow::{anyhow, Error};
use container_common::anyhow_result::AnyhowResult;
use container_common::thread::thread_id::ThreadId;
use crate::redis::constants::{LEASE_TIMEOUT_SECONDS, LEASE_RENEW_PERIOD, LEASE_CHECK_PERIOD, OBS_ACTIVE_CHECK_PERIOD, STREAMER_TTS_JOB_QUEUE_TTL_SECONDS};
use crate::redis::lease_payload::LeasePayload;
use crate::twitch::constants::TWITCH_PING_CADENCE;
use crate::twitch::oauth::oauth_token_refresher::OauthTokenRefresher;
use crate::twitch::pubsub::build_pubsub_topics_for_user::build_pubsub_topics_for_user;
use crate::twitch::twitch_user_id::TwitchUserId;
use crate::twitch::websocket_client::TwitchWebsocketClient;
use database_queries::tokens::Tokens;
use database_queries::tts::insert_tts_inference_job::TtsInferenceJobInsertBuilder;
use database_queries::twitch_oauth::find::{TwitchOauthTokenRecord, TwitchOauthTokenFinder};
use database_queries::twitch_oauth::insert::TwitchOauthTokenInsertBuilder;
use database_queries::twitch_pubsub::insert_bits::TwitchPubsubBitsInsertBuilder;
use database_queries::twitch_pubsub::insert_channel_points::TwitchPubsubChannelPointsInsertBuilder;
use log::debug;
use log::error;
use log::info;
use log::warn;
use r2d2_redis::RedisConnectionManager;
use r2d2_redis::r2d2;
use r2d2_redis::redis::Commands;
use redis_common::redis_keys::RedisKeys;
use sqlx::MySql;
use std::sync::Arc;
use std::thread::sleep;
use std::time::Duration;
use time::Instant;
use twitch_api2::pubsub::channel_bits::ChannelBitsEventsV2Reply;
use twitch_api2::pubsub::channel_points::ChannelPointsChannelV1Reply;
use twitch_api2::pubsub::{Response, TwitchResponse, TopicData};
use twitch_common::cheers::remove_cheers;

// TODO: Publish events back to OBS thread
// TODO: (cleanup) make the logic clearer to follow.

// =========================================
// =============== STAGE ONE ===============
// =========================================

pub struct TwitchPubsubUserSubscriberThread {
  thread_id: ThreadId,
  server_hostname: String,
  twitch_user_id: TwitchUserId,
  oauth_token_refresher: OauthTokenRefresher,
  mysql_pool: Arc<sqlx::Pool<MySql>>,
  redis_pool: Arc<r2d2::Pool<RedisConnectionManager>>,
}

impl TwitchPubsubUserSubscriberThread {
  pub fn new(
    twitch_user_id: TwitchUserId,
    oauth_token_refresher: OauthTokenRefresher,
    mysql_pool: Arc<sqlx::Pool<MySql>>,
    redis_pool: Arc<r2d2::Pool<RedisConnectionManager>>,
    server_hostname: &str,
    thread_id: ThreadId,
  ) -> Self {
    Self {
      thread_id,
      oauth_token_refresher,
      server_hostname: server_hostname.to_string(),
      twitch_user_id,
      mysql_pool,
      redis_pool,
    }
  }

  pub async fn start_thread(mut self) {
    // By failing to look this up, the thread will fail fast.
    // When the user auths, the thread will be picked back up again.
    let lookup_result
        = lookup_oauth_record(&self.twitch_user_id, &self.mysql_pool).await;

    let mut record = match lookup_result {
      Ok(Some(record)) => record,
      Ok(None) => {
        error!("No twitch oauth token record");
        return;
      }
      Err(e) => {
        error!("Error looking up twitch oauth token record: {:?}", e);
        return;
      }
    };

    let expected_lease_payload
        = LeasePayload::from_thread_id(&self.server_hostname, &self.thread_id);

    loop {
      info!("Connecting to Twitch PubSub for user {}...", &record.twitch_username);
      let maybe_client =
          self.create_subscribed_twitch_client(&record.access_token).await;

      let twitch_websocket_client = match maybe_client {
        Ok(client) => client,
        Err(e) => {
          error!("Error building Twitch client (exiting thread): {:?}", e);
          return;
        }
      };

      // NB: All of the timers (thus far) can wait to run.
      // We set their first run time to now so we don't have to deal with Option<>.
      let now = Instant::now();

      let thread = TwitchPubsubUserSubscriberThreadStageTwo {
        thread_id: self.thread_id.clone(),
        server_hostname: self.server_hostname.clone(),
        twitch_user_id: self.twitch_user_id.clone(),
        oauth_token_refresher: self.oauth_token_refresher.clone(),
        mysql_pool: self.mysql_pool.clone(),
        redis_pool: self.redis_pool.clone(),
        twitch_websocket_client,
        expected_lease_payload: expected_lease_payload.clone(),
        twitch_oauth_token_record: record.clone(),
        redis_lease_last_renewed_at: now,
        redis_lease_last_checked_at: now,
        obs_session_active_last_checked_at: now,
        twitch_last_pinged_at: now,
      };

      // NB: The following call will run its main loop until/unless the Twitch client
      // fails to auth or disconnects. If this happens, we'll try again.
      match thread.continue_thread().await {
        Ok(LoopEndedReason::ExitThread { reason}) => {
          warn!("Thread has ended with reason: {}", reason);
          return;
        }
        Ok(LoopEndedReason::RefreshedOauthToken { token }) => {
          warn!("OAuth token was refreshed.");
          record = token;
          sleep(Duration::from_secs(3));
        }
        Err(e) => {
          error!("There was an error, restarting thread shortly: {:?}", e);
          sleep(Duration::from_secs(15));
          continue;
        }
      }
    }
  }

  async fn create_subscribed_twitch_client(
    &self,
    access_token: &str
  ) -> AnyhowResult<TwitchWebsocketClient> {
    let mut twitch_websocket_client = TwitchWebsocketClient::new()?;

    twitch_websocket_client.connect().await?;
    twitch_websocket_client.send_ping().await?;

    // NB: Failure to auth won't be immediate.
    let topics = build_pubsub_topics_for_user(self.twitch_user_id.get_numeric());
    twitch_websocket_client.listen(access_token, &topics).await?;

    Ok(twitch_websocket_client)
  }
}

// =========================================
// =============== STAGE TWO ===============
// =========================================

/// The thread is somewhat of a state machine.
/// The first stage of thread startup can end prematurely, which is why
/// this is modeled as two different structs.
struct TwitchPubsubUserSubscriberThreadStageTwo {
  thread_id: ThreadId,
  server_hostname: String,
  twitch_user_id: TwitchUserId,
  oauth_token_refresher: OauthTokenRefresher,
  mysql_pool: Arc<sqlx::Pool<MySql>>,
  redis_pool: Arc<r2d2::Pool<RedisConnectionManager>>,

  // ========== Stage Two Thread State ==========

  twitch_websocket_client: TwitchWebsocketClient,

  // We'll use this again and again, so precompute it.
  expected_lease_payload: LeasePayload,

  // The user's oauth access and refresh tokens.
  twitch_oauth_token_record: TwitchOauthTokenRecord,

  // The thread must renew the lease, or another worker will pick it up.
  // If the lease gets taken by another, we abandon our own workload.
  redis_lease_last_renewed_at: Instant,

  // If the lease gets taken by another thread, we abandon our own workload.
  // This controls when we periodically check.
  redis_lease_last_checked_at: Instant,

  // Check if the OBS session is still active.
  // If the underlying Redis key dies, we abandon our thread.
  obs_session_active_last_checked_at: Instant,

  /// Twitch PubSub requires PINGs at regular intervals,
  ///   "To keep the server from closing the connection, clients must send a PING
  ///    command at least once every 5 minutes. If a client does not receive a PONG
  ///    message within 10 seconds of issuing a PING command, it should reconnect
  ///    to the server. See details in Handling Connection Failures."
  twitch_last_pinged_at: Instant,
}

impl TwitchPubsubUserSubscriberThreadStageTwo {

  /// This function will loop until it either errors or hits a `LoopEndedReason` condition.
  /// The caller will need to handle these cases.
  pub async fn continue_thread(mut self) -> AnyhowResult<LoopEndedReason> {
    loop {
      let is_valid = self.maybe_check_redis_lease_is_valid()?;
      if !is_valid {
        return Ok(LoopEndedReason::ExitThread { reason: "Thread lease taken".to_string() });
      }

      self.maybe_renew_redis_lease()?;
      self.maybe_send_twitch_ping().await?;

      let is_active = self.maybe_check_obs_session_active()?;
      if !is_active {
        return Ok(LoopEndedReason::ExitThread { reason: "OBS session ended".to_string() });
      }

      // NB: We can't have calls to read the Twitch websocket client block forever, and they
      // would do exactly that if not for this code. This is adapted from the very good example
      // in the `tokio-tungstenite` repo, which also contains good recipes for splitting sockets
      // into two unidirectional streams:
      // https://github.com/snapview/tokio-tungstenite/blob/master/examples/interval-server.rs
      let mut interval = tokio::time::interval(Duration::from_secs(1));
      tokio::select! {
        maybe_event = self.twitch_websocket_client.try_next() => {
          if let Some(loop_end_reason) = self.handle_event(maybe_event).await? {
            return Ok(loop_end_reason);
          }
        }
        _ = interval.tick() => {
          sleep(Duration::from_secs(1));
        }
      }

      sleep(Duration::from_secs(1));
    }
  }

  // =============== TWITCH PUBSUB EVENTS ===============

  async fn handle_event(
    &mut self,
    maybe_event: AnyhowResult<Option<twitch_api2::pubsub::Response>>
  ) -> AnyhowResult<Option<LoopEndedReason>> {

    let maybe_event = maybe_event.map_err(|error| {
      error!("socket error: {:?}", error);
      error
    })?;

    let event = match maybe_event {
      None => return Ok(None),
      Some(event) => event,
    };

    info!("event: {:?}", event);

    match event {
      Response::Response(response) => {
        // NB: Auth failure might cause the loop to end.
        return self.handle_maybe_auth_error_event(response).await;
      }
      Response::Message { data } => {
        self.handle_pubsub_topic_event(data).await?;
      }
      Response::Pong => {}
      Response::Reconnect => {}
    }

    Ok(None) // Don't end loop
  }

  async fn handle_maybe_auth_error_event(&mut self, response: TwitchResponse)
    -> AnyhowResult<Option<LoopEndedReason>>
  {
    let error = match response.error.as_deref() {
      None => return Ok(None),
      Some(e) => e,
    };
    match error {
      "" => {}, // No-op
      "ERR_BADAUTH" => {
        warn!("Invalid token. Bad auth. Need to refresh");
        let token_record = self.refresh_twitch_oauth_token().await?;
        return Ok(Some(LoopEndedReason::RefreshedOauthToken { token: token_record }));
      }
      _ => warn!("Unknown Twitch PubSub error: {:?}", error),
    }
    Ok(None)
  }

  async fn handle_pubsub_topic_event(&mut self, topic_data: TopicData) -> AnyhowResult<()> {
    match topic_data {
      // Unimplemented
      TopicData::AutoModQueue { .. } => {}
      TopicData::ChannelBitsBadgeUnlocks { .. } => {}
      TopicData::ChatModeratorActions { .. } => {}
      TopicData::ChannelSubscribeEventsV1 { .. } => {}
      TopicData::CommunityPointsChannelV1 { .. } => {}
      TopicData::ChannelCheerEventsPublicV1 { .. } => {}
      TopicData::ChannelSubGiftsV1 { .. } => {}
      TopicData::VideoPlayback { .. } => {}
      TopicData::VideoPlaybackById { .. } => {}
      TopicData::HypeTrainEventsV1 { .. } => {}
      TopicData::HypeTrainEventsV1Rewards { .. } => {}
      TopicData::Following { .. } => {}
      TopicData::Raid { .. } => {}
      TopicData::UserModerationNotifications { .. } => {}
      // Implemented
      TopicData::ChannelBitsEventsV2 { topic, reply } => {
        let mut event_builder = TwitchPubsubBitsInsertBuilder::new();
        match *reply {
          ChannelBitsEventsV2Reply::BitsEvent { data, message_id, version, is_anonymous } => {
            let user_id = data.user_id.to_string();
            let user_name = data.user_name.to_string();
            let mut event_builder = event_builder.set_sender_twitch_user_id(&user_id)
                .set_sender_twitch_username(&user_name)
                .set_destination_channel_id(&data.channel_id.to_string())
                .set_destination_channel_name(&data.channel_name.to_string())
                .set_bits_used(data.bits_used as u64)
                .set_total_bits_used(data.total_bits_used as u64)
                .set_is_anonymous(is_anonymous)
                .set_chat_message(&data.chat_message);
            event_builder.insert(&self.mysql_pool).await?;

            self.write_tts_inference_event(&data.chat_message).await?;
          }
          _ => {}
        }
      }
      TopicData::ChannelPointsChannelV1 { topic, reply } => {
        let mut event_builder = TwitchPubsubChannelPointsInsertBuilder::new();
        match *reply {
          // Unimplemented
          ChannelPointsChannelV1Reply::CustomRewardUpdated { .. } => {}
          ChannelPointsChannelV1Reply::RedemptionStatusUpdate { .. } => {}
          ChannelPointsChannelV1Reply::UpdateRedemptionStatusesFinished { .. } => {}
          ChannelPointsChannelV1Reply::UpdateRedemptionStatusProgress { .. } => {}
          // Implemented
          ChannelPointsChannelV1Reply::RewardRedeemed { timestamp, redemption } => {
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

            if let Some(user_text) = redemption.user_input.as_deref() {
              self.write_tts_inference_event(user_text).await?;
            }
          }
          _ => {},
        }
      }
    }

    Ok(())
  }

  // =============== TWITCH PUBSUB KEEPALIVE ===============

  async fn maybe_send_twitch_ping(&mut self) -> AnyhowResult<()> {
    let mut should_send_ping = self.twitch_last_pinged_at
        .elapsed()
        .gt(&TWITCH_PING_CADENCE);

    if should_send_ping {
      info!("Sending Twitch ping for user {}", self.twitch_user_id.get_numeric());
      self.twitch_websocket_client.send_ping().await?;
      self.twitch_last_pinged_at = Instant::now();
    }

    Ok(())
  }

  // =============== REDIS THREAD LEASE ===============

  fn maybe_check_redis_lease_is_valid(&mut self) -> AnyhowResult<bool> {
    let mut should_check_lease = self.redis_lease_last_checked_at
        .elapsed()
        .gt(&LEASE_CHECK_PERIOD);

    if should_check_lease {
      info!("Checking Redis Lease for user {}", self.twitch_user_id.get_numeric());
      let is_valid = self.check_redis_lease_is_valid()?;

      if !is_valid {
        warn!("Lease got taken by another thread");
        return Ok(false);
      }

      self.redis_lease_last_checked_at = Instant::now();
    }

    Ok(true)
  }

  fn check_redis_lease_is_valid(&mut self) -> AnyhowResult<bool> {
    let mut redis = self.redis_pool.get()?;
    let lease_key = RedisKeys::twitch_pubsub_lease(self.twitch_user_id.get_str());

    let payload : Option<String> = redis.get(&lease_key)?;
    match payload {
      None => {
        warn!("Redis lease payload absent. Another thread could be started.");
        Ok(true)
      }
      Some(payload) => {
        let actual_payload = LeasePayload::deserialize(&payload)?;
        let equals_expected = self.expected_lease_payload.eq(&actual_payload);
        Ok(equals_expected)
      }
    }
  }

  fn maybe_renew_redis_lease(&mut self) -> AnyhowResult<()> {
    let mut should_renew_lease = self.redis_lease_last_renewed_at
        .elapsed()
        .gt(&LEASE_RENEW_PERIOD);

    if should_renew_lease {
      info!("Renewing Redis Lease for user {}", self.twitch_user_id.get_numeric());
      self.renew_redis_lease()?;
      self.redis_lease_last_renewed_at = Instant::now();
    }

    Ok(())
  }

  fn renew_redis_lease(&mut self) -> AnyhowResult<()> {
    let mut redis = self.redis_pool.get()?;

    let lease_key = RedisKeys::twitch_pubsub_lease(self.twitch_user_id.get_str());
    let lease_value = self.expected_lease_payload.serialize();

    let _v : Option<String> = redis.set_ex(
      &lease_key,
      &lease_value,
      LEASE_TIMEOUT_SECONDS
    )?;
    Ok(())
  }

  // =============== OBS SESSION ACTIVITY ===============

  fn maybe_check_obs_session_active(&mut self) -> AnyhowResult<bool> {
    let mut should_check_active = self.obs_session_active_last_checked_at
        .elapsed()
        .gt(&OBS_ACTIVE_CHECK_PERIOD);

    if should_check_active {
      info!("Checking OBS active for user {}", self.twitch_user_id.get_numeric());
      let is_active = self.check_obs_session_active()?;

      if !is_active {
        warn!("OBS session is no longer active");
        return Ok(false);
      }

      self.obs_session_active_last_checked_at = Instant::now();
    }

    Ok(true)
  }

  fn check_obs_session_active(&mut self) -> AnyhowResult<bool> {
    let mut redis = self.redis_pool.get()?;
    let key = RedisKeys::obs_active_session_keepalive(self.twitch_user_id.get_str());

    // The value doesn't matter, just the presence of the key.
    let payload : Option<String> = redis.get(&key)?;
    match payload {
      None => Ok(false),
      Some(_payload) => Ok(true),
    }
  }

  // =============== OAUTH TOKEN LOOKUP AND RENEWAL ===============

  async fn refresh_twitch_oauth_token(&mut self) -> AnyhowResult<TwitchOauthTokenRecord> {
    let refresh_token = match self.twitch_oauth_token_record.maybe_refresh_token.as_deref() {
      Some(token) => token,
      None => {
        error!("No refresh token present. Cannot refresh");
        return Err(anyhow!("No refresh token present. Cannot refresh!"));
      },
    };

    let refresh_result = self.oauth_token_refresher.refresh_token(refresh_token)
        .await?;

    let access_token = refresh_result.access_token.secret().to_string();
    let refresh_token : Option<String> = refresh_result.maybe_refresh_token
        .map(|t| t.secret().to_string());
    let expires_seconds = refresh_result.duration.as_secs() as u32;

    // TODO: Move saving a refreshed record somewhere common
    let mut query_builder = TwitchOauthTokenInsertBuilder::new(
      &self.twitch_oauth_token_record.twitch_user_id,
      &self.twitch_oauth_token_record.twitch_username,
      &access_token,
    &self.twitch_oauth_token_record.oauth_refresh_grouping_token)
        .set_refresh_token(refresh_token.as_deref())
        .set_user_token(self.twitch_oauth_token_record.maybe_user_token.as_deref())
        .set_expires_in_seconds(Some(expires_seconds))
        .set_refresh_count(self.twitch_oauth_token_record.refresh_count.saturating_add(1))
        // NB: We don't get these back from the refresh, but it seems like they would stay the same.
        .set_token_type(self.twitch_oauth_token_record.token_type.as_deref())
        .has_bits_read(self.twitch_oauth_token_record.has_bits_read)
        .has_channel_read_redemptions(self.twitch_oauth_token_record.has_channel_read_redemptions)
        .has_channel_read_subscriptions(self.twitch_oauth_token_record.has_channel_read_subscriptions)
        .has_chat_edit(self.twitch_oauth_token_record.has_chat_edit)
        .has_chat_read(self.twitch_oauth_token_record.has_chat_read);

    query_builder.insert(&self.mysql_pool).await?;

    let maybe_inserted
        = lookup_oauth_record(&self.twitch_user_id, &self.mysql_pool).await?;

    let new_record = match maybe_inserted {
      Some(record) => record,
      None => {
        error!("Did not find oauth token record in database upon refresh");
        return Err(anyhow!("Did not find oauth token record in database upon refresh"));
      }
    };

    // NB: Instead of resetting the local loop state, we'll create a fresh new Twitch client.
    // TODO: Compare a "refresh_count"
    self.twitch_oauth_token_record = new_record.clone();

    Ok(new_record)
  }

  // =============== TTS EVENTS ===============

  async fn write_tts_inference_event(&mut self, tts_text: &str) -> AnyhowResult<()> {
    let sanitized_text = remove_cheers(tts_text);
    let job_token = Tokens::new_tts_inference_job()?;
    let model_token = "TM:7wbtjphx8h8v"; // "Mario *" voice.

    let mut builder = TtsInferenceJobInsertBuilder::new_for_internal_tts()
        .set_job_token(&job_token)
        .set_model_token(model_token)
        .set_raw_inference_text(&sanitized_text);

    let _r = builder.insert(&self.mysql_pool).await?;

    // TODO: Report job token to frontend
    let mut redis = self.redis_pool.get()?;
    let redis_key = RedisKeys::twitch_tts_job_queue(&self.twitch_user_id.get_str());

    let _size : Option<u64> = redis.rpush(&redis_key, job_token)?;
    let _size : Option<u64> = redis.expire(&redis_key, STREAMER_TTS_JOB_QUEUE_TTL_SECONDS)?;

    Ok(())
  }
}

// ====================================
// =============== MISC ===============
// ====================================

async fn lookup_oauth_record(
  twitch_user_id: &TwitchUserId,
  mysql_pool: &sqlx::Pool<MySql>
) -> AnyhowResult<Option<TwitchOauthTokenRecord>> {
  TwitchOauthTokenFinder::new()
      .scope_twitch_user_id(Some(twitch_user_id.get_numeric()))
      .allow_expired_tokens(true)
      .perform_query(mysql_pool)
      .await
}

enum LoopEndedReason {
  /// Terminate the thread
  ExitThread { reason: String },
  /// A new OAuth token was minted.
  RefreshedOauthToken { token: TwitchOauthTokenRecord }
}
