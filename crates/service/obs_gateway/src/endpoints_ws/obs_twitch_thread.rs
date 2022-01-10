use crate::twitch::polling_websocket_client::PollingTwitchWebsocketClient;
use crate::twitch::websocket_client::TwitchWebsocketClient;
use log::error;
use log::info;
use std::sync::atomic::AtomicBool;
use std::sync::{Arc, RwLock, PoisonError};
use std::thread::sleep;
use std::time::Duration;
use std::time::Instant;
use tokio::runtime::Handle;
use crate::twitch::oauth::oauth_token_refresher::OauthTokenRefresher;

// TODO: Let's make this an Arc<RwLock<Map<Token, Thread>>>
//  so that multiple browser sessions for the same user can
//  share the same single backing instance.
//  .
//  however, this causes events (TTS) to get flushed to just
//  a single browser instance.
//  .
//  maybe just kill other sessions ? browser+uuid -> LRU.

pub struct ObsTwitchThread {
  twitch_user_id: u32,
  token_refresher: OauthTokenRefresher,
  twitch_client: Arc<RwLock<TwitchWebsocketClient>>,
  last_requested: Arc<RwLock<Instant>>,
}

impl ObsTwitchThread {
  pub fn new(
    twitch_user_id: u32,
    token_refresher: OauthTokenRefresher,
    twitch_client: TwitchWebsocketClient
  ) -> Self {
    let now = Instant::now();
    Self {
      twitch_user_id,
      token_refresher,
      twitch_client: Arc::new(RwLock::new(twitch_client)),
      last_requested: Arc::new(RwLock::new(now)),
    }
  }

  pub async fn run_until_exit(&self) {
    loop {
      info!("TwitchThread::run_until_exit()");
      sleep(Duration::from_millis(1000));
    }
  }

  pub async fn send_ping(&self) {
    //self.twitch_client.connect().await.unwrap();
  }








  pub fn keep_alive_thread(&self) {
    // TODO(bt, 2022-01-03): builds are failing, not sure when I worked on this last
    //let now = Instant::now();
    //let lock = self.last_requested
    //    .clone()
    //    .get_mut();
    ////*lock = Some(now);
    //match lock {
    //  Ok(l) => *l = Some(now),
    //  Err(_) => {}
    //}
  }

  // TODO: Investigate use of a thread pool instead.
  pub fn start_thread(&self) {
    let mut last_requested_lock = self.last_requested.clone();

    let handle = Handle::current();

    handle.spawn(async move {
      Self::thread_main_loop(last_requested_lock);
    });
  }

  fn thread_main_loop(
    mut last_requested: Arc<RwLock<Instant>>,
  ) {
    // TODO(bt, 2022-01-03): builds are failing, not sure when I worked on this last
    //loop {
    //  let c = last_requested.get_mut();

    //  match c {
    //    Err(e) => {
    //      error!("Mutex failure: {:?}, ending job.", e);
    //      break;
    //    }
    //    Ok(t) => {
    //      let now = Instant::now();
    //      let delta : Duration = now.duration_since(t.clone());

    //      if delta.gt(&Duration::from_secs(60)) {
    //        info!("Timeout elapsed, ending job.");
    //        break;
    //      }
    //    }
    //  }

    //  Self::thread_single_loop();

    //  sleep(Duration::from_millis(1000));
    //}
  }

  fn thread_single_loop() {
    info!("thread iteration")
  }
}

