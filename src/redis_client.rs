use crate::AnyhowResult;
use crate::secrets::RedisSecrets;

use anyhow::anyhow;
use std::thread;
use std::time::Duration;
use redis::AsyncCommands;
use redis::aio::Connection;
use redis;

pub struct RedisClient {
  secrets: RedisSecrets,

  /// This manages our connection.
  /// It's meant to be absent when not connected.
  /// TODO: Probably need to reset this when we disconnect.
  connection: Option<Connection>,

  connection_failure_count: u32,
}

impl RedisClient {
  pub fn new(secrets: &RedisSecrets) -> Self {
    Self {
      secrets: secrets.clone(),
      connection: None,
      connection_failure_count: 0,
    }
  }

  pub async fn connect(&mut self) -> AnyhowResult<()> {
    let client = redis::Client::open(self.secrets.connection_url())?;
    let mut connection = client.get_async_connection().await?;

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

  pub async fn publish(&mut self, channel: &str, message: &str) -> AnyhowResult<u32> {
    let connection = match &mut self.connection {
      None => {
        return Err(anyhow!("Not connected"));
      },
      Some(connection) => connection,
    };

    // TODO: Smart reconnect
    /*let result = connection.publish(channel, message).await?;
    let result = match result {
      Ok(r) => r,
      Err(err) => {
        match err.kind() {
          IoError |  TryAgain | ClusterDown | MasterDown => {},
          _ => return Err(anyhow!("Redis error: {:?}", err)),
        }
      }
    };*/

    let result = connection.publish(channel, message).await?;
    Ok(result)
  }

  pub async fn publish_bytes(&mut self, channel: &str, message: &[u8]) -> AnyhowResult<u32> {
    let connection = match &mut self.connection {
      None => {
        return Err(anyhow!("Not connected"));
      },
      Some(connection) => connection,
    };

    // TODO: Smart reconnect
    /*let result = connection.publish(channel, message).await?;
    let result = match result {
      Ok(r) => r,
      Err(err) => {
        match err.kind() {
          IoError |  TryAgain | ClusterDown | MasterDown => {},
          _ => return Err(anyhow!("Redis error: {:?}", err)),
        }
      }
    };*/

    let result = connection.publish(channel, message).await?;
    Ok(result)
  }
}
