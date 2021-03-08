use crate::AnyhowResult;
use crate::secrets::RedisSecrets;

use anyhow::anyhow;
use redis::AsyncCommands;
use redis::aio::Connection;
use redis;

pub struct RedisClient {
  secrets: RedisSecrets,

  /// This manages our connection.
  /// It's meant to be absent when not connected.
  /// TODO: Probably need to reset this when we disconnect.
  connection: Option<Connection>,
}

impl RedisClient {
  pub fn new(secrets: &RedisSecrets) -> Self {
    Self {
      secrets: secrets.clone(),
      connection: None,
    }
  }

  pub async fn connect(&mut self) -> AnyhowResult<()> {
    let client = redis::Client::open(self.secrets.connection_url())?;
    let mut connection = client.get_async_connection().await?;

    self.connection = Some(connection);

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
}
