use std::collections::HashMap;
use chrono::{DateTime, Utc, Duration};

#[derive(Eq, PartialEq, Copy, Clone, Debug)]
pub enum ColdCacheStrategy {
  /// Don't handle the miss right now. Wait or skip.
  WaitOrSkip,
  /// Handle the miss now.
  Proceed,
}

pub struct ColdCacheLog {
  max_cold_duration: Duration,
  cache_miss_log: HashMap<i64, DateTime<Utc>>,
  //get_time_function: Box<dyn Fn() -> DateTime<Utc>>,
  get_time_function: fn() -> DateTime<Utc>,

  //pub not_downloaded_model_ids_versus_miss_counts: HashMap<i64, DateTime<Utc>>,

  // There should be less of a penalty for cold memory.
  //pub not_in_memory_model_ids_versus_miss_counts: HashMap<i64, DateTime<Utc>>,
}

impl ColdCacheLog {

  pub fn new(max_cold_duration: Duration) -> Self {
    Self {
      max_cold_duration,
      cache_miss_log: HashMap::new(),
      get_time_function: || Utc::now(),
    }
  }

  pub fn new_for_testing(
    max_cold_duration: Duration,
    //get_time_function: Box<dyn Fn() -> DateTime<Utc>>
    get_time_function: fn() -> DateTime<Utc>,
  ) -> Self {
    Self {
      max_cold_duration,
      cache_miss_log: HashMap::new(),
      get_time_function,
    }
  }


  // NB: Not threadsafe!
  #[must_use]
  pub fn cache_miss(&mut self, id: i64) -> ColdCacheStrategy {
    let now : DateTime<Utc> = (self.get_time_function)();

    if let Some((_id, wait_start)) = self.cache_miss_log.get_key_value(&id) {
      let duration = now.signed_duration_since(wait_start.clone());

      if duration > self.max_cold_duration {
        self.cache_miss_log.remove(&id);
        return ColdCacheStrategy::Proceed;
      }
    } else {
      self.cache_miss_log.insert(id, now);
    }

    ColdCacheStrategy::WaitOrSkip
  }

  // NB: For testing
  fn set_time_function(&mut self, get_time_function: fn() -> DateTime<Utc>) {
    self.get_time_function = get_time_function;
  }
}

#[cfg(test)]
mod tests {
  use crate::util::jobs::cold_cache_strategy::ColdCacheLog;
  use crate::util::jobs::cold_cache_strategy::ColdCacheStrategy;
  use chrono::{Duration, Utc};

  #[test]
  fn cold_cache_log_cache_miss() {
    let mut cold_cache_log = ColdCacheLog::new(Duration::seconds(10));

    cold_cache_log.set_time_function(|| Utc::now());

    assert_eq!(cold_cache_log.cache_miss(10), ColdCacheStrategy::WaitOrSkip);
  }
}