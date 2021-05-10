use crate::AnyhowResult;
use log::{info, debug, warn};
use futures::TryStreamExt;
use egg_mode::stream::StreamMessage;
use std::time::Duration;
use std::thread;

pub struct TwitterClient {
  access_token: egg_mode::Token,
}

impl TwitterClient {

  pub fn new(access_token: egg_mode::Token) -> Self {
    Self {
      access_token,
    }
  }

  pub async fn main_loop(&self) {
    loop {
      if let Err(e) = self.run_stream().await {
        warn!("Disconnected from stream; error = {:?}", e);
      }
      info!("Reconnecting after timeout...");
      thread::sleep(Duration::from_secs(30));
    }
  }

  pub async fn run_stream(&self) -> AnyhowResult<()> {
    let stream = egg_mode::stream::filter()
      .follow(&[1297106371238932481]) // vocodes
      .track(&["vocodes"])
      .start(&self.access_token)
      .try_for_each(|m| {
        if let StreamMessage::Tweet(tweet) = m {
          info!("Tweet: {:?}", &tweet);
        } else {
          info!("Other (non-Tweet) message: {:?}", &m);
        }
        futures::future::ok(())
      });

    Ok(stream.await?)
  }
}
