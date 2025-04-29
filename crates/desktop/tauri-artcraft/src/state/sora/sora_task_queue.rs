use chrono::{Date, DateTime, Utc};
use std::collections::HashMap;
use std::sync::{Arc, RwLock};

#[derive(Clone)]
pub struct TaskDetails {
  pub enqueue_time: DateTime<Utc>
}

#[derive(Clone)]
pub struct SoraTaskQueue {

  queue: Arc<RwLock<HashMap<String, TaskDetails>>>
}
