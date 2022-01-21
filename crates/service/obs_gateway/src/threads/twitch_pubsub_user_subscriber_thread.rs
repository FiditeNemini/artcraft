use crate::redis::lease_payload::LeasePayload;
use crate::redis::lease_timeout::{LEASE_TIMEOUT_SECONDS, LEASE_RENEW_PERIOD};
use crate::twitch::pubsub::build_pubsub_topics_for_user::build_pubsub_topics_for_user;
use crate::twitch::twitch_user_id::TwitchUserId;
use crate::twitch::websocket_client::TwitchWebsocketClient;
use database_queries::twitch_oauth::find::{TwitchOauthTokenRecord, TwitchOauthTokenFinder};
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
use twitch_api2::pubsub::Response;
use time::Instant;
use container_common::anyhow_result::AnyhowResult;
use crate::twitch::constants::TWITCH_PING_CADENCE;

// TODO: ERROR HANDLING
// TODO: ERROR HANDLING
// TODO: ERROR HANDLING
// TODO: ERROR HANDLING

// TODO: Publish events back to OBS thread (keepalive redis key from websocket).
// TODO: Disconnect when OBS is done.
// TODO: Refresh oauth token.
// TODO: Handle disconnects.
// TODO: Server+thread IDs


pub struct TwitchPubsubUserSubscriberThread {
  twitch_user_id: TwitchUserId,
  mysql_pool: Arc<sqlx::Pool<MySql>>,
  redis_pool: Arc<r2d2::Pool<RedisConnectionManager>>,
  twitch_websocket_client: TwitchWebsocketClient,

  // ========== Thread state ==========

  // The thread must renew the lease, or another worker will pick it up.
  // If the lease gets taken by another, we abandon our own workload.
  redis_lease_last_renewed_at: Option<Instant>,

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
  ) -> Self {
    let twitch_websocket_client = TwitchWebsocketClient::new().unwrap();
    Self {
      twitch_user_id,
      mysql_pool,
      redis_pool,
      twitch_websocket_client,
      redis_lease_last_renewed_at: None,
      twitch_last_pinged_at: None,
    }
  }

  pub async fn start_thread(mut self) {
    // We lease from outside before starting the thread.
    self.redis_lease_last_renewed_at = Some(Instant::now());

    // Lookup the OAuth credentials
    let oauth_lookup_result = self.lookup_oauth_record().await;
    let oauth_token_record = match oauth_lookup_result {
      Err(e) => {
        info!("Error looking up oauth creds: {:?}", e);
        return; // TODO: Better flow.
      }
      Ok(None) => {
        info!("Twitch user oauth token does not exit. Auth please.");
        return; // TODO: Better flow.
      }
      Ok(Some(record)) => record,
    };

    warn!("Connecting to Twitch PubSub for user {}...", &oauth_token_record.twitch_username);
    self.twitch_websocket_client.connect().await.unwrap(); // TODO: Error handling

    loop {
      self.maybe_renew_redis_lease().unwrap();
      self.maybe_send_twitch_ping().await.unwrap();

      warn!("Listen to user...");
      let topics = build_pubsub_topics_for_user(self.twitch_user_id.get_numeric());
      self.twitch_websocket_client.listen(&oauth_token_record.access_token, &topics).await.unwrap();

      loop {
        //let maybe_event = self.twitch_websocket_client.try_next()
        //    .await
        //    .unwrap();

        info!("maybe event...");
        let mut interval = tokio::time::interval(Duration::from_millis(1000));


        // NB: We can't block forever.
        // Adapted from https://github.com/snapview/tokio-tungstenite/blob/master/examples/interval-server.rs
        tokio::select! {
          maybe_event = self.twitch_websocket_client.try_next() => {
            match maybe_event {
              Err(e) => {
                warn!("socket recv error: {:?}", e);
              }
              Ok(None) => {},
              Ok(Some(ref event)) => {
                warn!("event: {:?}", event);

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
            //ws_sender.send(Message::Text("tick".to_owned())).await?;
            sleep(Duration::from_secs(5));
          }
        }

        sleep(Duration::from_secs(1));

        self.maybe_renew_redis_lease().unwrap();
        self.maybe_send_twitch_ping().await.unwrap();
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
    let lease_value = LeasePayload::new("foo", "bar").serialize();
    let _v : Option<String> = redis.set_ex(
      &lease_key,
      &lease_value,
      LEASE_TIMEOUT_SECONDS
    ).unwrap();
    Ok(())
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
