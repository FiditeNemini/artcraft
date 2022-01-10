use crate::twitch::polling_websocket_client::PollingTwitchWebsocketClient;
use log::error;
use log::info;
use std::sync::atomic::AtomicBool;
use std::sync::{Arc, RwLock, PoisonError};
use std::thread::sleep;
use std::time::Duration;
use std::time::Instant;
use tokio::runtime::Handle;

pub struct ObsTwitchThread {
  twitch_client: Arc<RwLock<PollingTwitchWebsocketClient>>,
  last_requested: Arc<RwLock<Instant>>,
}

impl ObsTwitchThread {
  pub fn new(twitch_client: PollingTwitchWebsocketClient) -> Self {
    let now = Instant::now();
    Self {
      twitch_client: Arc::new(RwLock::new(twitch_client)),
      last_requested: Arc::new(RwLock::new(now)),
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

