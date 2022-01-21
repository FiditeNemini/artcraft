use crate::twitch::twitch_user_id::TwitchUserId;
use crate::twitch::websocket_client::TwitchWebsocketClient;
use futures::lock::Mutex;
use log::error;
use log::info;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, RwLock, PoisonError, RwLockWriteGuard};
use std::thread::sleep;
use std::time::Instant;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tokio::runtime::Handle;

// TODO: Let's make this an Arc<RwLock<Map<Token, Thread>>>
//  so that multiple browser sessions for the same user can
//  share the same single backing instance.
//  .
//  however, this causes events (TTS) to get flushed to just
//  a single browser instance.
//  .
//  maybe just kill other sessions ? browser+uuid -> LRU.

pub struct ObsTwitchThread {
  // NB: This is a `futures` Mutex, which is much more compatible with async code
  // than the blocking std::sync mutexes.
  inner_data: Arc<Mutex<InnerData>>,
}

struct InnerData {
  twitch_user_id: TwitchUserId,
  is_connected: bool,
  twitch_client: TwitchWebsocketClient,
  last_ping: SystemTime,
}

impl ObsTwitchThread {
  pub fn new(
    twitch_user_id: TwitchUserId,
    twitch_client: TwitchWebsocketClient
  ) -> Self {
    let now = Instant::now();
    Self {
      inner_data: Arc::new(Mutex::new(InnerData {
        twitch_user_id,
        is_connected: false,
        twitch_client,
        last_ping: UNIX_EPOCH,
      }))
    }
  }

  pub async fn run_until_exit(&self) {
    loop {
      //info!("TwitchThread::run_until_exit()");
      //let is_connected = self.is_connected.load(Ordering::Relaxed);

      //if !is_connected {
      //  info!("Connect to Twitch");
      //  self.connect().await;
      //}

      info!("run_until_exit()...");
      self.maybe_send_ping().await;

      sleep(Duration::from_millis(1000));
    }
  }

  pub async fn connect(&self) {
    //let mut write = self.twitch_client.write().unwrap();
    //let _r = write.connect().await.unwrap();
    //self.is_connected.store(true, Ordering::Relaxed);
  }

  pub async fn maybe_send_ping(&self) {
    let inner_clone = self.inner_data.clone();
    {
      info!("maybe_send_ping() lock.");
      let mut inner_data = inner_clone.lock().await;
      let now = SystemTime::now();
      let duration = now.duration_since(inner_data.last_ping).unwrap();

      let delta = Duration::from_secs(60);
      if duration.lt(&delta) {
        return;
      }

      info!("Sending ping...");
      inner_data.twitch_client.send_ping().await.unwrap();
      info!("Sent ping.");

      inner_data.last_ping = now;
    }
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
//    let mut last_requested_lock = self.last_requested.clone();
//
//    let handle = Handle::current();
//
//    handle.spawn(async move {
//      Self::thread_main_loop(last_requested_lock);
//    });
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

