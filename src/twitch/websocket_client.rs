use crate::util::anyhow_result::AnyhowResult;
use reqwest::Url;
use std::sync::atomic::{AtomicBool, Ordering};
use tokio::net::TcpStream;
use tokio_tungstenite::{connect_async, WebSocketStream, MaybeTlsStream};
use twitch_api2::pubsub;
use futures_util::{SinkExt, StreamExt};
use tokio_tungstenite::tungstenite::Message;
use twitch_api2::pubsub::{Response, TopicData};

// Reference javascript Twitch Websocket client:
// https://github.com/twitchdev/pubsub-javascript-sample/blob/main/main.js

const WEBSOCKET_GATEWAY : &'static str = "wss://pubsub-edge.twitch.tv";
const PING_COMMAND : &'static str = "{ \"type\": \"PING\" }";


pub struct TwitchWebsocketClient {
  socket: Option<WebSocketStream<MaybeTlsStream<TcpStream>>>,
  is_polling: AtomicBool,
}

impl TwitchWebsocketClient {

  pub fn new() -> AnyhowResult<Self> {
    Ok(Self {
      socket: None,
      is_polling: AtomicBool::new(false),
    })
  }

  pub async fn connect(&mut self) -> AnyhowResult<()> {
    let url = Url::parse(WEBSOCKET_GATEWAY)?;

    let (mut socket, _response) =
        connect_async(url).await?;

    let message = Message::Text(PING_COMMAND.to_string());
    socket.send(message).await?;

    if let Some(response) = socket.next().await {

      if let Ok(r) = response {
        let text = r.to_text()?;
        println!("Text response: {:?}", text);

        let typed_response = Response::parse(text)?;

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


    self.socket = Some(socket);

    Ok(())
  }

  async fn start_polling(&self) {
    if self.is_polling.load(Ordering::Relaxed) {
      return;
    }

    /*tokio::spawn(async move {
      self.is_polling.store(true, Ordering::Relaxed);

      let command = pubsub::channel_sub_gifts(
        &topics,
        "authtoken",
        "random nonce string",
      )?;

    });
     */


  }
}