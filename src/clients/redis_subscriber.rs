use anyhow::anyhow;
use crate::AnyhowResult;
use crate::dispatcher::Dispatcher;
use crate::protos::protos;
use crate::secrets::RedisSecrets;
use log::{info, warn};
use prost::Message;
use redis::aio::PubSub;
use std::thread;
use std::time::Duration;
use tokio::stream::{Stream, StreamExt};

pub struct RedisSubscribeClient {
  secrets: RedisSecrets,

  /// This manages our connection.
  /// It's meant to be absent when not connected.
  /// TODO: Probably need to reset this when we disconnect.
  connection: Option<PubSub>,

  connection_failure_count: u32,

  /// Event dispatcher that handles routing and passing to handlers.
  dispatcher: Dispatcher,
}

impl RedisSubscribeClient {
  pub fn new(secrets: &RedisSecrets, dispatcher: Dispatcher) -> Self {
    Self {
      secrets: secrets.clone(),
      connection: None,
      connection_failure_count: 0,
      dispatcher,
    }
  }

  pub async fn connect(&mut self) -> AnyhowResult<()> {
    let client = redis::Client::open(self.secrets.connection_url())?;
    let mut connection = client.get_async_connection().await?.into_pubsub();

    self.connection = Some(connection);
    self.connection_failure_count = 0;

    Ok(())
  }

  pub async fn failure_notify_maybe_reconnect(&mut self) -> AnyhowResult<()> {
    self.connection_failure_count += 1;

    if self.connection_failure_count > 5 {
      println!("Attempting Redis Reconnect in 3 sec...");
      thread::sleep(Duration::from_secs(3));
      self.connect().await?;
      self.connection_failure_count = 0;
    } else {
      println!("Not ready to reconnect. Fail Count = {}", self.connection_failure_count);
    }
    Ok(())
  }

  pub async fn subscribe(&mut self, topic: &str) -> AnyhowResult<()> {
    let mut connection = match &mut self.connection {
      None => {
        return Err(anyhow!("Not connected"));
      },
      Some(connection) => connection,
    };

    connection.subscribe(topic).await?;
    Ok(())
  }

  pub async fn start_stream(&mut self) -> AnyhowResult<()> {
    let connection = match &mut self.connection {
      None => {
        return Err(anyhow!("Not connected"));
      },
      Some(connection) => connection,
    };

    loop {
      for message in connection.on_message().next().await {
        let bytes = message.get_payload_bytes();

        let mut message_proto = match protos::PubsubEventPayloadV1::decode(bytes) {
          Ok(m) => m,
          Err(e) => {
            warn!("Error decoding proto: {:?}", e);
            continue;
          },
        };

        self.dispatcher.handle_pubsub_event(message_proto);
      }

      thread::sleep(Duration::from_millis(250));
    }

    Ok(())
  }
}
