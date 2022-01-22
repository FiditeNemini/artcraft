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

// TODO: ERROR HANDLING
// TODO: ERROR HANDLING
// TODO: ERROR HANDLING
// TODO: ERROR HANDLING

// TODO: Publish events back to OBS thread
// TODO: Disconnect when OBS is done. (keepalive redis key from websocket).
// TODO: Refresh oauth token.
// TODO: Handle disconnects.
// TODO: Server+thread IDs

pub struct TwitchPubsubUserSubscriberThread {
  thread_id: ThreadId,
  server_hostname: String,
  twitch_user_id: TwitchUserId,
  expected_lease_payload: LeasePayload,

  mysql_pool: Arc<sqlx::Pool<MySql>>,
  redis_pool: Arc<r2d2::Pool<RedisConnectionManager>>,
  twitch_websocket_client: TwitchWebsocketClient,

  // ========== Thread state ==========

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

impl TwitchPubsubUserSubscriberThread {
  pub fn new(
    twitch_user_id: TwitchUserId,
    mysql_pool: Arc<sqlx::Pool<MySql>>,
    redis_pool: Arc<r2d2::Pool<RedisConnectionManager>>,
    server_hostname: &str,
    thread_id: ThreadId,
  ) -> Self {
    let twitch_websocket_client = TwitchWebsocketClient::new().unwrap();
    let expected_lease_payload = LeasePayload::from_thread_id(&server_hostname, &thread_id);
    Self {
      thread_id,
      expected_lease_payload,
      server_hostname: server_hostname.to_string(),
      twitch_user_id,
      mysql_pool,
      redis_pool,
      twitch_websocket_client,
      redis_lease_last_renewed_at: None,
      redis_lease_last_checked_at: None,
      twitch_last_pinged_at: None,
      obs_session_active_last_checked_at: None,
    }
  }

  pub async fn start_thread(mut self) {
    // We lease from outside before starting the thread.
    self.redis_lease_last_renewed_at = Some(Instant::now());
    self.redis_lease_last_checked_at = Some(Instant::now());

    // We know at the start that the session should be active.
    // TODO: Ensure we write this before the thread even starts.
    self.obs_session_active_last_checked_at = Some(Instant::now());

    // Lookup the OAuth credentials
    let oauth_lookup_result = self.lookup_oauth_record().await;
    let oauth_token_record = match oauth_lookup_result {
      Err(e) => {
        error!("Error looking up oauth creds: {:?}", e);
        return; // TODO: Better flow.
      }
      Ok(None) => {
        error!("Twitch user oauth token does not exit. Auth please.");
        return; // TODO: Better flow.
      }
      Ok(Some(record)) => record,
    };

    info!("Connecting to Twitch PubSub for user {}...", &oauth_token_record.twitch_username);
    self.twitch_websocket_client.connect().await.unwrap(); // TODO: Error handling

    loop {
      self.maybe_renew_redis_lease().unwrap();
      self.maybe_send_twitch_ping().await.unwrap();

      info!("Listen to user...");
      let topics = build_pubsub_topics_for_user(self.twitch_user_id.get_numeric());
      self.twitch_websocket_client.listen(&oauth_token_record.access_token, &topics).await.unwrap();

      loop {
        //debug!("[{}] maybe event for user {}...", self.thread_id.get_id(), self.twitch_user_id.get_str());

        let mut interval = tokio::time::interval(Duration::from_millis(1000));

        // NB: We can't block forever.
        // Adapted from the very good tokio-tungstenite example here, which also splits sockets
        // into bidirectional streams:
        // https://github.com/snapview/tokio-tungstenite/blob/master/examples/interval-server.rs
        tokio::select! {
          maybe_event = self.twitch_websocket_client.try_next() => {
            match maybe_event {
              Err(e) => {
                error!("socket recv error: {:?}", e);
              }
              Ok(None) => {},
              Ok(Some(ref event)) => {
                info!("event: {:?}", event);

                match event {
                  Response::Response(_) => {}
                  Response::Message { .. } => {}
                  Response::Pong => {}
                  Response::Reconnect => {}
                }
              }
            }
          }
          _ = interval.tick() => {
            sleep(Duration::from_secs(5));
          }
        }

        sleep(Duration::from_secs(1));

        let is_valid = self.maybe_check_redis_lease_is_valid().unwrap();
        if !is_valid {
          warn!("Thread lease is invalid; exiting thread.");
          return; // Exit thread
        }

        self.maybe_renew_redis_lease().unwrap();
        self.maybe_send_twitch_ping().await.unwrap();

        let is_active = self.maybe_check_obs_session_active().unwrap();
        if !is_active {
          warn!("OBS session ended; exiting thread.");
          return; // Exit thread
        }
      }
    }
  }

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

  async fn lookup_oauth_record(&mut self) -> AnyhowResult<Option<TwitchOauthTokenRecord>> {
    TwitchOauthTokenFinder::new()
        .scope_twitch_user_id(Some(self.twitch_user_id.get_numeric()))
        .perform_query(&self.mysql_pool)
        .await
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
}
