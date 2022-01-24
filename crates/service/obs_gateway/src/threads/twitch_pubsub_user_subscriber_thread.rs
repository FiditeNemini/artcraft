use anyhow::{anyhow, Error};
use container_common::anyhow_result::AnyhowResult;
use container_common::thread::thread_id::ThreadId;
use crate::redis::lease_payload::LeasePayload;
use crate::redis::constants::{LEASE_TIMEOUT_SECONDS, LEASE_RENEW_PERIOD, LEASE_CHECK_PERIOD, OBS_ACTIVE_CHECK_PERIOD};
use crate::twitch::constants::TWITCH_PING_CADENCE;
use crate::twitch::pubsub::build_pubsub_topics_for_user::build_pubsub_topics_for_user;
use crate::twitch::twitch_user_id::TwitchUserId;
use crate::twitch::websocket_client::TwitchWebsocketClient;
use database_queries::twitch_oauth::find::{TwitchOauthTokenRecord, TwitchOauthTokenFinder};
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
use twitch_api2::pubsub::Response;
use crate::twitch::oauth::oauth_token_refresher::OauthTokenRefresher;
use database_queries::twitch_oauth::insert::TwitchOauthTokenInsertBuilder;

// TODO: ERROR HANDLING
// TODO: ERROR HANDLING
// TODO: ERROR HANDLING
// TODO: ERROR HANDLING

// TODO: Publish events back to OBS thread
// TODO: Refresh oauth token and restart client.
// TODO: Error handling, handle disconnects.
// TODO: (cleanup) make the logic clearer to follow.

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

    let record = match lookup_result {
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
      // TODO: Error handling
      info!("Connecting to Twitch PubSub for user {}...", &record.twitch_username);
      let mut twitch_websocket_client =
          self.create_subscribed_twitch_client(&record.access_token).await.unwrap();

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
        redis_lease_last_renewed_at: None,
        redis_lease_last_checked_at: None,
        obs_session_active_last_checked_at: None,
        twitch_last_pinged_at: None
      };

      // NB: The following call will run its main loop until/unless the Twitch client
      // fails to auth or disconnects. If this happens, we'll try again.
      match thread.continue_thread().await {
        Ok(LoopEndedReason::TwitchNeedsReset) => {
          sleep(Duration::from_secs(15));
          continue;
        }
        Ok(LoopEndedReason::ExitThread { reason}) => {
          warn!("Thread has ended with reason: {}", reason);
          return;
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
  expected_lease_payload: LeasePayload,

  // The user's oauth access and refresh tokens.
  twitch_oauth_token_record: TwitchOauthTokenRecord,

  // The thread must renew the lease, or another worker will pick it up.
  // If the lease gets taken by another, we abandon our own workload.
  redis_lease_last_renewed_at: Option<Instant>,

  // If the lease gets taken by another thread, we abandon our own workload.
  // This controls when we periodically check.
  redis_lease_last_checked_at: Option<Instant>,

  // Check if the OBS session is still active.
  // If the underlying Redis key dies, we abandon our thread.
  obs_session_active_last_checked_at: Option<Instant>,

  /// Twitch PubSub requires PINGs at regular intervals,
  ///   "To keep the server from closing the connection, clients must send a PING
  ///    command at least once every 5 minutes. If a client does not receive a PONG
  ///    message within 10 seconds of issuing a PING command, it should reconnect
  ///    to the server. See details in Handling Connection Failures."
  twitch_last_pinged_at: Option<Instant>,
}

impl TwitchPubsubUserSubscriberThreadStageTwo {

  /// This function will loop until it either errors or hits a `LoopEndedReason` condition.
  /// The caller will need to handle these cases.
  pub async fn continue_thread(mut self) -> AnyhowResult<LoopEndedReason> {
    // We lease from outside before starting the thread.
    self.redis_lease_last_renewed_at = Some(Instant::now());

    // We know at the start that the session should be active.
    // TODO: Ensure we write this before the thread even starts.
    self.obs_session_active_last_checked_at = Some(Instant::now());

    loop {
      let is_valid = self.maybe_check_redis_lease_is_valid()?;
      if !is_valid {
        return Ok(LoopEndedReason::ExitThread { reason: "Thread lease taken".to_string() });
      }

      self.maybe_renew_redis_lease().unwrap();
      self.maybe_send_twitch_ping().await.unwrap();

      let is_active = self.maybe_check_obs_session_active().unwrap();
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

  // =============== TWITCH PUBSUB EVENTS AND KEEPALIVE ===============

  async fn handle_event(
    &mut self,
    maybe_event: AnyhowResult<Option<twitch_api2::pubsub::Response>>
  ) -> AnyhowResult<Option<LoopEndedReason>> {

    let event = match maybe_event {
      Err(e) => {
        error!("socket recv error: {:?}", e);
        return Ok(None);
      },
      Ok(Some(event)) => event,
      Ok(None) => return Ok(None),
    };

    info!("event: {:?}", event);

    match event {
      Response::Response(response) => {
        match response.error.as_deref() {
          Some("ERR_BADAUTH") => {
            warn!("Invalid token. Bad auth. Need to refresh");
            self.refresh_twitch_oauth_token().await.unwrap();
            return Ok(Some(LoopEndedReason::TwitchNeedsReset));
          }
          _ => {},
        }
      }
      Response::Message { .. } => {}
      Response::Pong => {}
      Response::Reconnect => {}
    }

    Ok(None)
  }

  async fn maybe_send_twitch_ping(&mut self) -> AnyhowResult<()> {
    let mut should_send_ping = self.twitch_last_pinged_at
        .map(|last_ping| last_ping.elapsed().gt(&TWITCH_PING_CADENCE))
        .unwrap_or(true);

    if should_send_ping {
      info!("Sending Twitch ping for user {}", self.twitch_user_id.get_numeric());
      self.twitch_websocket_client.send_ping().await?;
      self.twitch_last_pinged_at = Some(Instant::now());
    }

    Ok(())
  }

  // =============== REDIS THREAD LEASE ===============

  fn maybe_check_redis_lease_is_valid(&mut self) -> AnyhowResult<bool> {
    let mut should_check_lease = self.redis_lease_last_checked_at
        .map(|last_read| last_read.elapsed().gt(&LEASE_CHECK_PERIOD))
        .unwrap_or(true);

    if should_check_lease {
      info!("Checking Redis Lease for user {}", self.twitch_user_id.get_numeric());
      let is_valid = self.check_redis_lease_is_valid()?;

      if !is_valid {
        warn!("Lease got taken by another thread");
        return Ok(false);
      }

      self.redis_lease_last_checked_at = Some(Instant::now());
    }

    Ok(true)
  }

  fn check_redis_lease_is_valid(&mut self) -> AnyhowResult<bool> {
    // TODO: Error handling

    let mut redis = self.redis_pool.get().unwrap();
    let lease_key = RedisKeys::twitch_pubsub_lease(self.twitch_user_id.get_str());

    let payload : Option<String> = redis.get(&lease_key).unwrap();
    match payload {
      None => {
        warn!("Redis lease payload absent. Another thread could be started.");
        Ok(true)
      }
      Some(payload) => {
        let actual_payload = LeasePayload::deserialize(&payload).unwrap();
        let equals_expected = self.expected_lease_payload.eq(&actual_payload);
        Ok(equals_expected)
      }
    }
  }

  fn maybe_renew_redis_lease(&mut self) -> AnyhowResult<()> {
    let mut should_renew_lease = self.redis_lease_last_renewed_at
        .map(|last_write| last_write.elapsed().gt(&LEASE_RENEW_PERIOD))
        .unwrap_or(true);

    if should_renew_lease {
      info!("Renewing Redis Lease for user {}", self.twitch_user_id.get_numeric());
      self.renew_redis_lease()?;
      self.redis_lease_last_renewed_at = Some(Instant::now());
    }

    Ok(())
  }

  fn renew_redis_lease(&mut self) -> AnyhowResult<()> {
    // TODO: Error handling
    let mut redis = self.redis_pool.get().unwrap();

    let lease_key = RedisKeys::twitch_pubsub_lease(self.twitch_user_id.get_str());
    let lease_value = self.expected_lease_payload.serialize();

    let _v : Option<String> = redis.set_ex(
      &lease_key,
      &lease_value,
      LEASE_TIMEOUT_SECONDS
    ).unwrap();
    Ok(())
  }

  // =============== OBS SESSION ACTIVITY ===============

  fn maybe_check_obs_session_active(&mut self) -> AnyhowResult<bool> {
    let mut should_check_active = self.obs_session_active_last_checked_at
        .map(|last_check| last_check.elapsed().gt(&OBS_ACTIVE_CHECK_PERIOD))
        .unwrap_or(true);

    if should_check_active {
      info!("Checking OBS active for user {}", self.twitch_user_id.get_numeric());
      let is_active = self.check_obs_session_active()?;

      if !is_active {
        warn!("OBS session is no longer active");
        return Ok(false);
      }

      self.obs_session_active_last_checked_at = Some(Instant::now());
    }

    Ok(true)
  }

  fn check_obs_session_active(&mut self) -> AnyhowResult<bool> {
    // TODO: Error handling
    let mut redis = self.redis_pool.get().unwrap();
    let key = RedisKeys::obs_active_session_keepalive(self.twitch_user_id.get_str());

    // The value doesn't matter, just the presence of the key.
    let payload : Option<String> = redis.get(&key).unwrap();
    match payload {
      None => Ok(false),
      Some(_payload) => Ok(true),
    }
  }

  // =============== OAUTH TOKEN LOOKUP AND RENEWAL ===============

  async fn refresh_twitch_oauth_token(&mut self) -> AnyhowResult<()> {
    let refresh_token = match self.twitch_oauth_token_record.maybe_refresh_token.as_deref() {
      Some(token) => token,
      None => {
        error!("No refresh token present. Cannot refresh");
        return Err(anyhow!("No refresh token present. Cannot refresh!"));
      },
    };

    // TODO: Move this somewhere common
    let refresh_result = self.oauth_token_refresher.refresh_token(refresh_token)
        .await?;

    let access_token = refresh_result.access_token.secret().to_string();
    let refresh_token : Option<String> = refresh_result.maybe_refresh_token
        .map(|t| t.secret().to_string());
    let expires_seconds = refresh_result.duration.as_secs() as u32;

    // TODO: Move this somewhere common
    let mut query_builder = TwitchOauthTokenInsertBuilder::new(
      &self.twitch_oauth_token_record.twitch_user_id,
      &self.twitch_oauth_token_record.twitch_username,
      &access_token)
        .set_refresh_token(refresh_token.as_deref())
        .set_user_token(self.twitch_oauth_token_record.maybe_user_token.as_deref())
        .set_expires_in_seconds(Some(expires_seconds))
        // NB: We don't get these back from the refresh, but it seems like they would stay the same.
        .set_token_type(self.twitch_oauth_token_record.token_type.as_deref())
        .set_has_bits_read(self.twitch_oauth_token_record.has_bits_read)
        .has_channel_read_subscriptions(self.twitch_oauth_token_record.has_channel_read_subscriptions)
        .has_channel_read_redemptions(self.twitch_oauth_token_record.has_channel_read_redemptions)
        .has_user_read_follows(self.twitch_oauth_token_record.has_user_read_follows);

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

    // TODO: Compare a "refresh_count"
    self.twitch_oauth_token_record = new_record;

    Ok(())
  }
}

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
  /// Reset the Twitch client
  TwitchNeedsReset,
  /// Terminate the thread
  ExitThread { reason: String },
}

