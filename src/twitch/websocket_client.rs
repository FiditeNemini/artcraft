use anyhow::anyhow;
use anyhow::bail;
use crate::util::anyhow_result::AnyhowResult;
use futures_util::{SinkExt, StreamExt};
use reqwest::Url;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex, PoisonError, MutexGuard};
use std::time::Duration;
use tokio::net::TcpStream;
use tokio;
use tokio_tungstenite::tungstenite::Message;
use tokio_tungstenite::{connect_async, WebSocketStream, MaybeTlsStream};
use twitch_api2::pubsub::{Response, TopicData};
use twitch_api2::pubsub;

// Reference javascript Twitch Websocket client:
// https://github.com/twitchdev/pubsub-javascript-sample/blob/main/main.js

const WEBSOCKET_GATEWAY : &'static str = "wss://pubsub-edge.twitch.tv";
const PING_COMMAND : &'static str = "{ \"type\": \"PING\" }";

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
      Err(e) => Err(anyhow!("could not connect: {:?}", e)),
      Ok(mut client) => {
        client.connect().await
      }
    }
  }

  pub async fn polling_thread(&self) {
    let client = self.client.clone();
    tokio::spawn(async move {
      loop {
        println!("Poll");

        match client.lock() {
          Ok(mut c) => {
            println!("Ping...");
            c.send_ping();
            println!("Read response...");
            c.read_response();
          }
          Err(_) => {}
        }

        tokio::time::sleep(Duration::from_millis(5000)).await;
      }
    });
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

  pub fn is_connected(&self) -> bool {
    // TODO: This probably isn't accurate
    self.socket.is_some()
  }

  pub async fn send_ping(&mut self) -> AnyhowResult<()> {
    let mut socket = match self.socket {
      None => return Err(anyhow!("not connected")),
      Some(ref mut socket) => socket,
    };

    // TODO:
    //  To keep the server from closing the connection, clients must send a PING command
    //  at least once every 5 minutes. If a client does not receive a PONG message within
    //  10 seconds of issuing a PING command, it should reconnect to the server.
    let message = Message::Text(PING_COMMAND.to_string());
    socket.send(message).await?;

    match self.read_response().await {
      Err(e) => Err(e),
      Ok(Response::Pong) => Ok(()),
      _ => Err(bail!("wrong response type")),
    }
  }

  async fn read_response(&mut self) -> AnyhowResult<Response> {
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
}