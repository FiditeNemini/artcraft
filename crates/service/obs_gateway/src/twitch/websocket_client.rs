use anyhow::anyhow;
use anyhow::bail;
use container_common::anyhow_result::AnyhowResult;
use crate::util::random_nonce::random_nonce;
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

// Reference javascript Twitch Websocket client:
// https://github.com/twitchdev/pubsub-javascript-sample/blob/main/main.js

const WEBSOCKET_GATEWAY : &'static str = "wss://pubsub-edge.twitch.tv";

const PING_COMMAND : &'static str = "{ \"type\": \"PING\" }";

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
    debug!("send ping ok");
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
