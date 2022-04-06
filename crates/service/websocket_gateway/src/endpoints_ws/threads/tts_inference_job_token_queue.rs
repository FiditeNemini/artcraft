use std::sync::{RwLock, Arc, Mutex};
use anyhow::anyhow;
use std::collections::VecDeque;
use container_common::anyhow_result::AnyhowResult;

// NB: Cloning will copy the internal mutex (interior mutability, threadsafe/sharable)
#[derive(Clone)]
pub struct TtsInferenceJobTokenQueue {
  queue: Arc<Mutex<VecDeque<String>>>
}

impl TtsInferenceJobTokenQueue {
  pub fn new() -> Self {
    Self {
      queue: Arc::new(Mutex::new(VecDeque::with_capacity(10))),
    }
  }

  /// Push a job token onto the queue
  pub fn enqueue_token(&self, job_token: &str) -> AnyhowResult<()> {
    match self.queue.lock() {
      Err(e) => {
        return Err(anyhow!("poisoned mutex: {:?}", e));
      },
      Ok(mut queue) => {
        queue.push_back(job_token.to_string());
      },
    }
    Ok(())
  }

  /// Pop a job token from the queue
  pub fn dequeue_token(&self, job_token: &str) -> AnyhowResult<Option<String>> {
    match self.queue.lock() {
      Err(e) => {
        return Err(anyhow!("poisoned mutex: {:?}", e));
      },
      Ok(mut queue) => {
        Ok(queue.pop_front())
      },
    }
  }
}
