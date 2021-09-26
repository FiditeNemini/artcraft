use anyhow::anyhow;
use anyhow::bail;
use crate::util::anyhow_result::AnyhowResult;
use futures_util::{SinkExt, StreamExt};
use reqwest::Url;
use std::sync::atomic::{AtomicBool, Ordering};
use tokio::net::TcpStream;
use tokio_tungstenite::tungstenite::Message;
use tokio_tungstenite::{connect_async, WebSocketStream, MaybeTlsStream};
use twitch_api2::pubsub::{Response, TopicData};
use twitch_api2::pubsub;

// Reference javascript Twitch Websocket client:
// https://github.com/twitchdev/pubsub-javascript-sample/blob/main/main.js

const WEBSOCKET_GATEWAY : &'static str = "wss://pubsub-edge.twitch.tv";
const PING_COMMAND : &'static str = "{ \"type\": \"PING\" }";

pub struct PollingTwitchWebsocketClient {
  client: TwitchWebsocketClient,
  is_polling: AtomicBool,
}

impl PollingTwitchWebsocketClient {
  pub fn new() -> AnyhowResult<Self> {
    Ok(Self {
      client: TwitchWebsocketClient::new()?,
      is_polling: AtomicBool::new(false),
    })
  }
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

    let message = Message::Text(PING_COMMAND.to_string());
    socket.send(message).await?;

    self.socket = Some(socket);

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
    }

    Ok(())
  }

  pub async fn send_ping(&mut self) -> AnyhowResult<()> {
    let mut socket = match self.socket {
      None => return Err(anyhow!("not connected")),
      Some(ref mut socket) => socket,
    };

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
}