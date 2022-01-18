use anyhow::anyhow;
use container_common::anyhow_result::AnyhowResult;

/// Lease values stored in Redis are in the form "{server_id}:{thread_id}"
#[derive(Debug)]
pub struct LeasePayload {
  server_id: String,
  thread_id: String,
}

impl LeasePayload {
  pub fn new(server_id: &str, thread_id: &str) -> Self {
    Self {
      server_id: server_id.to_string(),
      thread_id: thread_id.to_string(),
    }
  }

  pub fn serialize(&self) -> String {
    format!("{}:{}", &self.server_id, &self.thread_id)
  }

  pub fn deserialize(payload: &str) -> AnyhowResult<Self> {
    let pieces = payload.split(":").collect::<Vec<_>>();
    if pieces.len() != 2 {
      return Err(anyhow!("Invalid payload: {}", payload));
    }

    let pair = (pieces.get(0), pieces.get(1));

    if let (Some(k), Some(v)) = pair {
      return Ok(Self::new(k, v))
    } else {
      return Err(anyhow!("Invalid payload: {}", payload));
    }
  }
}
