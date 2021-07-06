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
  get_time_function: Box<dyn Fn() -> DateTime<Utc>>,
  //get_time_function: fn() -> DateTime<Utc>,

  //pub not_downloaded_model_ids_versus_miss_counts: HashMap<i64, DateTime<Utc>>,

  // There should be less of a penalty for cold memory.
  //pub not_in_memory_model_ids_versus_miss_counts: HashMap<i64, DateTime<Utc>>,
}

impl ColdCacheLog {

  pub fn new(max_cold_duration: Duration) -> Self {
    Self {
      max_cold_duration,
      cache_miss_log: HashMap::new(),
      //get_time_function: || Utc::now(),
      get_time_function: Box::new(|| Utc::now()),
    }
  }

  pub fn new_for_testing(
    max_cold_duration: Duration,
    get_time_function: Box<dyn Fn() -> DateTime<Utc>>
    //get_time_function: fn() -> DateTime<Utc>,
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
  //fn set_time_function(&mut self, get_time_function: fn() -> DateTime<Utc>) {
  fn set_time_function(&mut self, get_time_function: Box<dyn Fn() -> DateTime<Utc>>) {
    self.get_time_function = get_time_function;
  }
}

#[cfg(test)]
mod tests {
  use crate::util::jobs::cold_cache_strategy::ColdCacheLog;
  use crate::util::jobs::cold_cache_strategy::ColdCacheStrategy;
  use chrono::{Duration, Utc, DateTime, TimeZone};

  fn get_date(datetime: &str) -> DateTime<Utc> {
    let datetime = DateTime::parse_from_rfc3339(datetime).unwrap();
    let utc : DateTime<Utc> = DateTime::from(datetime);
    utc
  }

  #[test]
  fn cold_cache_cache_miss_algorithm() {
    let mut cold_cache_log = ColdCacheLog::new(Duration::seconds(10));

    // First invocation
    cold_cache_log.set_time_function(Box::new(|| get_date("2021-07-01T13:00:00+00:00")));
    assert_eq!(cold_cache_log.cache_miss(10), ColdCacheStrategy::WaitOrSkip);
    cold_cache_log.set_time_function(Box::new(|| get_date("2021-07-01T13:00:01+00:00")));
    assert_eq!(cold_cache_log.cache_miss(10), ColdCacheStrategy::WaitOrSkip);
    cold_cache_log.set_time_function(Box::new(|| get_date("2021-07-01T13:00:05+00:00")));
    assert_eq!(cold_cache_log.cache_miss(10), ColdCacheStrategy::WaitOrSkip);
    cold_cache_log.set_time_function(Box::new(|| get_date("2021-07-01T13:00:10+00:00")));
    assert_eq!(cold_cache_log.cache_miss(10), ColdCacheStrategy::WaitOrSkip);
    // Final invocation after time expires. Proceed.
    cold_cache_log.set_time_function(Box::new(|| get_date("2021-07-01T13:00:11+00:00")));
    assert_eq!(cold_cache_log.cache_miss(10), ColdCacheStrategy::Proceed);

    // New invocation.
    cold_cache_log.set_time_function(Box::new(|| get_date("2021-07-01T13:00:15+00:00")));
    assert_eq!(cold_cache_log.cache_miss(10), ColdCacheStrategy::WaitOrSkip);
    cold_cache_log.set_time_function(Box::new(|| get_date("2021-07-01T13:00:25+00:00")));
    // New ID.
    assert_eq!(cold_cache_log.cache_miss(20), ColdCacheStrategy::WaitOrSkip);
    // Old ID (still wait)
    assert_eq!(cold_cache_log.cache_miss(10), ColdCacheStrategy::WaitOrSkip);
    // Old ID is done, new ID is still waiting.
    cold_cache_log.set_time_function(Box::new(|| get_date("2021-07-01T13:00:30+00:00")));
    assert_eq!(cold_cache_log.cache_miss(10), ColdCacheStrategy::Proceed);
    assert_eq!(cold_cache_log.cache_miss(20), ColdCacheStrategy::WaitOrSkip);
    // Now the new ID is also done.
    cold_cache_log.set_time_function(Box::new(|| get_date("2021-07-01T13:00:41+00:00")));
    assert_eq!(cold_cache_log.cache_miss(20), ColdCacheStrategy::Proceed);
  }
}