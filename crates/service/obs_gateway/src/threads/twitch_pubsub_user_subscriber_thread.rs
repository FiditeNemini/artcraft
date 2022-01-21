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

// TODO: ERROR HANDLING
// TODO: ERROR HANDLING
// TODO: ERROR HANDLING
// TODO: ERROR HANDLING

// TODO: Timer to ping().
// TODO: Timer to renew lease.
// TODO: Publish events back to OBS thread.
// TODO: Disconnect when OBS is done.
// TODO: Refresh oauth token.
// TODO: Handle disconnects.
// TODO: Server+thread IDs


pub struct TwitchPubsubUserSubscriberThread {
  twitch_user_id: TwitchUserId,
  mysql_pool: Arc<sqlx::Pool<MySql>>,
  redis_pool: Arc<r2d2::Pool<RedisConnectionManager>>,

  // Thread state
  lease_last_renewed_at: Option<Instant>,
}

impl TwitchPubsubUserSubscriberThread {

  pub fn new(
    twitch_user_id: TwitchUserId,
    mysql_pool: Arc<sqlx::Pool<MySql>>,
    redis_pool: Arc<r2d2::Pool<RedisConnectionManager>>,
  ) -> Self {
    Self {
      twitch_user_id,
      mysql_pool,
      redis_pool,
      lease_last_renewed_at: None,
    }
  }

  pub async fn start_thread(mut self) {
    let mut last_renewed_lease = Instant::now();

    self.foo = Some("asdf".to_string());

    loop {
      info!("Twitch subscriber thread");

      let now = Instant::now();
      let mut should_renew = false;

      match now.checked_sub(LEASE_RENEW_PERIOD) {
        None => { should_renew = true }
        Some(before) => {

        }
      }

      let mut redis = self.redis_pool.get().unwrap();

      let lease_key = RedisKeys::twitch_pubsub_lease(self.twitch_user_id.get_str());
      let lease = LeasePayload::new("foo", "bar");

      let serialized = lease.serialize();
      let _v : Option<String> = redis.set_ex(
        &lease_key,
        &serialized,
        LEASE_TIMEOUT_SECONDS
      ).unwrap();

      let result = TwitchOauthTokenFinder::new()
          .scope_twitch_user_id(Some(self.twitch_user_id.get_numeric()))
          .perform_query(&self.mysql_pool)
          .await
          .unwrap();

      let record = match result {
        None => {
          info!("Twitch user oauth token does not exit. Auth please");
          sleep(Duration::from_secs(5));
          continue;
        }
        Some(record) => record
      };

      let mut client = TwitchWebsocketClient::new().unwrap();
      //let token_refresher = OauthTokenRefresher::new(
      //  user_id,
      //  &token_record.access_token,
      //  token_record.maybe_refresh_token.as_deref());

      warn!("Connecting to Twitch PubSub for user {}...", &record.twitch_username);
      client.connect().await.unwrap();

      // TODO: BACKGROUND PINGS UGH!
      warn!("Sending ping...");
      client.send_ping().await.unwrap();

      warn!("Listen to user...");
      let topics = build_pubsub_topics_for_user(self.twitch_user_id.get_numeric());

      client.listen(&record.access_token, &topics).await.unwrap();

      loop {
        warn!("client.next()");
        let maybe_event = client.try_next().await.unwrap();

        if let Some(event) = maybe_event.as_ref() {
          warn!("event: {:?}", event);

          match event {
            Response::Response(_) => {}
            Response::Message { .. } => {}
            Response::Pong => {}
            Response::Reconnect => {}
          }
        }

        sleep(Duration::from_secs(5));
      }
    }
  }

}


pub async fn twitch_pubsub_user_subscriber_thread(
  twitch_user_id: TwitchUserId,
  mysql_pool: Arc<sqlx::Pool<MySql>>,
  redis_pool: Arc<r2d2::Pool<RedisConnectionManager>>,
) {

  let mut last_renewed_lease = Instant::now();

  loop {
    info!("Twitch subscriber thread");

    let now = Instant::now();
    let mut should_renew = false;

    match now.checked_sub(LEASE_RENEW_PERIOD) {
      None => { should_renew = true }
      Some(before) => {

      }
    }

    let mut redis = redis_pool.get().unwrap();

    let lease_key = RedisKeys::twitch_pubsub_lease(twitch_user_id.get_str());
    let lease = LeasePayload::new("foo", "bar");

    let serialized = lease.serialize();
    let _v : Option<String> = redis.set_ex(
      &lease_key,
      &serialized,
      LEASE_TIMEOUT_SECONDS
    ).unwrap();

    let result = TwitchOauthTokenFinder::new()
        .scope_twitch_user_id(Some(twitch_user_id.get_numeric()))
        .perform_query(&mysql_pool)
        .await
        .unwrap();

    let record = match result {
      None => {
        info!("Twitch user oauth token does not exit. Auth please");
        sleep(Duration::from_secs(5));
        continue;
      }
      Some(record) => record
    };

    let mut client = TwitchWebsocketClient::new().unwrap();
    //let token_refresher = OauthTokenRefresher::new(
    //  user_id,
    //  &token_record.access_token,
    //  token_record.maybe_refresh_token.as_deref());

    warn!("Connecting to Twitch PubSub for user {}...", &record.twitch_username);
    client.connect().await.unwrap();

    // TODO: BACKGROUND PINGS UGH!
    warn!("Sending ping...");
    client.send_ping().await.unwrap();

    warn!("Listen to user...");
    let topics = build_pubsub_topics_for_user(twitch_user_id.get_numeric());

    client.listen(&record.access_token, &topics).await.unwrap();

    loop {
      warn!("client.next()");
      let maybe_event = client.try_next().await.unwrap();

      if let Some(event) = maybe_event.as_ref() {
        warn!("event: {:?}", event);

        match event {
          Response::Response(_) => {}
          Response::Message { .. } => {}
          Response::Pong => {}
          Response::Reconnect => {}
        }
      }

      sleep(Duration::from_secs(5));
    }
  }
}
