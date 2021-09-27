use anyhow::anyhow;
use anyhow::bail;
use crate::util::anyhow_result::AnyhowResult;
use futures_util::{SinkExt, StreamExt, TryStreamExt};
use log::debug;
use reqwest::Url;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex, PoisonError, MutexGuard};
use std::time::Duration;
use tokio::net::TcpStream;
use tokio;
use tokio_tungstenite::tungstenite::Message;
use tokio_tungstenite::{connect_async, WebSocketStream, MaybeTlsStream};
use twitch_api2::pubsub::{Response, TopicData, Topic, Topics};
use twitch_api2::pubsub;
use crate::util::random_nonce::random_nonce;

// Reference javascript Twitch Websocket client:
// https://github.com/twitchdev/pubsub-javascript-sample/blob/main/main.js

const WEBSOCKET_GATEWAY : &'static str = "wss://pubsub-edge.twitch.tv";

const PING_COMMAND : &'static str = "{ \"type\": \"PING\" }";
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

  async fn connect_keepalive(&self) -> AnyhowResult<()> {

    //tokio::spawn(self.polling_thread);

    Ok(())
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
            c.send_ping();
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

pub struct TwitchWebsocketClient {
  socket: Option<WebSocketStream<MaybeTlsStream<TcpStream>>>,
}

impl TwitchWebsocketClient {
  pub fn new() -> AnyhowResult<Self> {
    Ok(Self {
      socket: None,
    })
  }

  pub async fn connect(&mut self) -> AnyhowResult<()> {
    let url = Url::parse(WEBSOCKET_GATEWAY)?;
    let (mut socket, _response) =
        connect_async(url).await?;
    self.socket = Some(socket);
    Ok(())
  }

  pub async fn close(&mut self) -> AnyhowResult<()> {
    let mut socket = match self.socket {
      None => return Ok(()), // Already closed.
      Some(ref mut socket) => socket,
    };

    socket.close(None).await?;
    self.socket = None;

    Ok(())
  }

  pub async fn listen<'t>(&mut self, auth_token: &str, topics: &'t [Topics]) -> AnyhowResult<()> {
    let mut socket = match self.socket {
      None => return Err(anyhow!("not connected")),
      Some(ref mut socket) => socket,
    };

    let nonce = random_nonce(128);

    let command = pubsub::listen_command(
      topics,
      auth_token,
      nonce.as_ref(),
    )?;

    debug!("Sending LISTEN");
    let message = Message::Text(command);
    socket.send(message).await?;

    Ok(())
  }

  pub fn is_connected(&self) -> bool {
    // TODO: This probably isn't accurate
    self.socket.is_some()
  }

  pub async fn send_ping(&mut self) -> AnyhowResult<()> {
    let mut socket = match self.socket {
      None => return Err(anyhow!("not connected")),
      Some(ref mut socket) => socket,
    };

    debug!("Sending PING");
    let message = Message::Text(PING_COMMAND.to_string());
    socket.send(message).await?;

    // TODO: Need to read from all call sites due to ordering.
    //match self.read_response().await {
    //  Err(e) => Err(e),
    //  Ok(Response::Pong) => Ok(()),
    //  _ => Err(bail!("wrong response type")),
    //}
    Ok(())
  }

  pub async fn next(&mut self) -> AnyhowResult<Response> {
    let socket = match self.socket {
      None => return Err(anyhow!("not connected")),
      Some(ref mut s) => s,
    };

    match socket.next().await {
      None => Err(anyhow!("nothing to read")),
      Some(Err(e)) => Err(anyhow!("websocket error: {:?}", e)),
      Some(Ok(response)) => {
        let text = response.to_text()?;
        let typed_response = Response::parse(text)?;
        Ok(typed_response)
      },
    }
  }

  pub async fn try_next(&mut self) -> AnyhowResult<Option<Response>> {
    let socket = match self.socket {
      None => return Err(anyhow!("not connected")),
      Some(ref mut s) => s,
    };

    match socket.try_next().await {
      Err(e) => Err(anyhow!("websocket error: {:?}", e)),
      Ok(None) => Ok(None),
      Ok(Some(response)) => {
        let text = response.to_text()?;
        let typed_response = Response::parse(text)?;
        Ok(Some(typed_response))
      },
    }
  }
}
