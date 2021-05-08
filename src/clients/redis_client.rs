use anyhow::anyhow;
use crate::AnyhowResult;
use crate::protos::protos;
use crate::secrets::RedisSecrets;
use log::{info, warn, debug};
use prost::Message;
use redis::aio::{Connection, PubSub, ConnectionManager};
use redis::{AsyncCommands, Msg, PubSubCommands};
use redis;
use std::thread;
use std::time::Duration;
use tokio::stream::{Stream, StreamExt};

pub struct RedisClient {
  secrets: RedisSecrets,

  /// This manages our connection.
  /// It's meant to be absent when not connected.
  connection_manager: Option<ConnectionManager>,

  /// Attempts to retry a Redis command.
  max_retry_count: u32,
}

impl RedisClient {
  pub fn new(secrets: &RedisSecrets, retry_count: u32) -> Self {
    Self {
      secrets: secrets.clone(),
      connection_manager: None,
      max_retry_count: retry_count,
    }
  }

  pub async fn connect(&mut self) -> AnyhowResult<()> {
    let client = redis::Client::open(self.secrets.connection_url())?;

    let connection_manager = client.get_tokio_connection_manager().await?;
    self.connection_manager = Some(connection_manager);

    Ok(())
  }

  pub async fn publish_bytes(&mut self, channel: &str, message: &[u8]) -> AnyhowResult<u32> {
    for i in 0 .. self.max_retry_count {
      match self.try_publish_bytes(channel, message).await {
        Ok(r) => return Ok(r),
        Err(_) => {
          debug!("Redis publish_bytes failed; retrying (attempt {})", i);
          continue;
        },
      }
    }
    Err(anyhow!("Retry count elapsed."))
  }

  async fn try_publish_bytes(&mut self, channel: &str, message: &[u8]) -> AnyhowResult<u32> {
    let connection_manager = match &mut self.connection_manager {
      None => {
        self.connect().await?;
        return Err(anyhow!("Not connected"));
      },
      Some(cm) => cm,
    };

    let result = connection_manager.publish(channel, message).await?;
    Ok(result)
  }
}
