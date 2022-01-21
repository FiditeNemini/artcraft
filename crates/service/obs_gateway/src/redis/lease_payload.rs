use anyhow::anyhow;
use container_common::anyhow_result::AnyhowResult;
use container_common::thread::thread_id::ThreadId;
use container_common::token::random_crockford_token::random_crockford_token;

// TODO: This should be JSON for future compat.
/// Lease values stored in Redis are in the form "{server_id}:{thread_id}"
#[derive(Debug)]
pub struct LeasePayload {
  pub server_id: String,
  pub thread_id: String,
}

impl LeasePayload {
  pub fn with_random_thread_id(server_id: &str) -> Self {
    let thread_id = random_crockford_token(10);
    Self::from_string_id(server_id, &thread_id)
  }

  pub fn from_thread_id(server_id: &str, thread_id: &ThreadId) -> Self {
    Self::from_string_id(server_id, thread_id.get_id())
  }

  pub fn from_string_id(server_id: &str, thread_id: &str) -> Self {
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
      return Ok(Self::from_string_id(k, v))
    } else {
      return Err(anyhow!("Invalid payload: {}", payload));
    }
  }
}
