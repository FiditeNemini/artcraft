use anyhow::anyhow;
use container_common::anyhow_result::AnyhowResult;
use crate::twitch::websocket_client::TwitchWebsocketClient;
use std::sync::atomic::AtomicBool;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use twitch_api2::pubsub::{Response, TopicData, Topic, Topics};

const PING_SECONDS : u64 = 1 * 60; // Twitch calls for every 5 minutes, we'll do every 1 minute.

pub struct PollingTwitchWebsocketClient {
  client: Arc<Mutex<TwitchWebsocketClient>>,
  is_polling: AtomicBool,
}

impl PollingTwitchWebsocketClient {
  pub fn new() -> AnyhowResult<Self> {
    Ok(Self {
      client: Arc::new(Mutex::new(TwitchWebsocketClient::new()?)),
      is_polling: AtomicBool::new(false),
    })
  }

  pub async fn connect(&mut self) -> AnyhowResult<()> {
    match self.client.lock() {
      Err(e) => Err(anyhow!("unlock client err: {:?}", e)),
      Ok(mut client) => {
        client.connect().await
      }
    }
  }

  pub async fn listen<'t>(&mut self, auth_token: &str, topics: &'t [Topics]) -> AnyhowResult<()> {
    match self.client.lock() {
      Err(e) => Err(anyhow!("unlock client err: {:?}", e)),
      Ok(mut client) => {
        client.listen(auth_token, topics).await
      }
    }
  }

  pub async fn send_ping(&mut self) -> AnyhowResult<()> {
    match self.client.lock() {
      Err(e) => Err(anyhow!("unlock client err: {:?}", e)),
      Ok(mut client) => {
        client.send_ping().await
      }
    }
  }

  /// Start a pinging background thread.
  /// Per Twitch PubSub docs,
  ///   To keep the server from closing the connection, clients must send a PING command
  ///   at least once every 5 minutes. If a client does not receive a PONG message within
  ///   10 seconds of issuing a PING command, it should reconnect to the server.
  pub async fn start_ping_thread(&self) {
    let client = self.client.clone();
    tokio::spawn(async move {
      loop {
        match client.lock() {
          Ok(mut c) => {
            // TODO: Future isn't Send
            //let _r = c.send_ping().await;
            // TODO: Need to read from all call sites due to ordering.
            //c.read_response();
          }
          Err(_) => {
            // TODO
          }
        }
        tokio::time::sleep(Duration::from_secs(PING_SECONDS)).await;
      }
    });
  }

  pub async fn next(&mut self) -> AnyhowResult<Response> {
    match self.client.lock() {
      Err(e) => Err(anyhow!("unlock client err: {:?}", e)),
      Ok(mut client) => {
        client.next().await
      }
    }
  }

  pub async fn try_next(&mut self) -> AnyhowResult<Option<Response>> {
    match self.client.lock() {
      Err(e) => Err(anyhow!("unlock client err: {:?}", e)),
      Ok(mut client) => {
        client.try_next().await
      }
    }
  }

  /*async fn start_polling(&self) {
    if self.is_polling.load(Ordering::Relaxed) {
      return;
    }

    tokio::spawn(async move {
      self.is_polling.store(true, Ordering::Relaxed);

      let command = pubsub::channel_sub_gifts(
        &topics,
        "authtoken",
        "random nonce string",
      )?;

    });
     /
  }*/


  /*let message = Message::Text(PING_COMMAND.to_string());
  socket.send(message).await?;
  match self.read_response().await {
    Err(e) => println!("Error getting PONG: {:?}", e),
    Ok(typed_response) => {
      match typed_response {
        Response::Pong => { println!("Pong") }
        Response::Reconnect => { println!("Reconnect") }
        Response::Response(_0) => { println!("Sub/Unsub (pubsub?)") }
        Response::Message { data } => {
          match data {
            TopicData::ChannelCheerEventsPublicV1 { topic, reply } => {}
            TopicData::ChannelSubGiftsV1 { topic, reply } => {}
            TopicData::ChannelSubscribeEventsV1 { topic, reply } => {}
            TopicData::CommunityPointsChannelV1 { topic, reply } => {}
            TopicData::Following { topic, reply} => {}
            // Not interested in these events
            TopicData::AutoModQueue { .. } => {}
            TopicData::ChannelBitsBadgeUnlocks { .. } => {}
            TopicData::ChannelBitsEventsV2 { .. } => {}
            TopicData::ChannelPointsChannelV1 { .. } => {}
            TopicData::ChatModeratorActions { .. } => {}
            TopicData::HypeTrainEventsV1 { .. } => {}
            TopicData::HypeTrainEventsV1Rewards { .. } => {}
            TopicData::Raid { .. } => {}
            TopicData::UserModerationNotifications { .. } => {}
            TopicData::VideoPlayback { .. } => {}
            TopicData::VideoPlaybackById { .. } => {}
          }
        }
      }
    }
  }*/
}
