use anyhow::anyhow;
use chrono::{DateTime, Utc, Duration};
use crate::util::anyhow_result::AnyhowResult;
use std::collections::HashMap;
use std::sync::{RwLock, Arc};

#[derive(Eq, PartialEq, Copy, Clone, Debug)]
pub enum ColdCacheStrategy {
  /// Don't handle the cache miss right now.
  /// Wait or skip until told otherwise.
  WaitOrSkip,
  /// Handle the cache miss now.
  /// Do the download, calculation, whatever immediately.
  Proceed,
}

/// Keep track of multiple caches.
/// This tells the caller when to ignore work or when to pick it up.
pub struct MultiColdCacheLog {
  in_memory_log: ColdCacheLog,
  on_disk_log: ColdCacheLog,
  // ... future caches ?
}

/// Keep track of a cache and tell the caller when to proceed with work.
/// If it isn't time yet, skip or wait and let another consumer handle it.
pub struct ColdCacheLog {
  max_cold_duration: Duration,
  //history_expire_duration: Duration,
  cache_miss_log: HashMap<i64, DateTime<Utc>>,
  get_time_function: Box<dyn Fn() -> DateTime<Utc>>,
}

/// And the Sync/Send threadsafe + interior mutability version.
#[derive(Clone)]
pub struct SyncMultiColdCacheLog {
  multi_cache_log: Arc<RwLock<MultiColdCacheLog>>,
}

impl SyncMultiColdCacheLog {
  pub fn new(memory_max_cold_duration: Duration, disk_max_cold_duration: Duration) -> Self {
    let multi_cache_log = MultiColdCacheLog::new(
      memory_max_cold_duration,
      disk_max_cold_duration,
    );
    Self {
      multi_cache_log: Arc::new(RwLock::new(multi_cache_log)),
    }
  }

  #[must_use]
  pub fn memory_cache_miss(&self, id: i64) -> AnyhowResult<ColdCacheStrategy> {
    let result = self.multi_cache_log
        .write()
        .map(|mut cache_logs| cache_logs.memory_cache_miss(id))
        .map_err(|err| anyhow!("mutex error: {:?}", err))?;
    Ok(result)
  }

  #[must_use]
  pub fn disk_cache_miss(&self, id: i64) -> AnyhowResult<ColdCacheStrategy> {
    let result = self.multi_cache_log
        .write()
        .map(|mut cache_logs| cache_logs.disk_cache_miss(id))
        .map_err(|err| anyhow!("mutex error: {:?}", err))?;
    Ok(result)
  }
}

impl MultiColdCacheLog {
  pub fn new(memory_max_cold_duration: Duration, disk_max_cold_duration: Duration) -> Self {
    Self {
      in_memory_log: ColdCacheLog::new(memory_max_cold_duration),
      on_disk_log: ColdCacheLog::new(disk_max_cold_duration),
    }
  }

  #[must_use]
  pub fn memory_cache_miss(&mut self, id: i64) -> ColdCacheStrategy {
    self.in_memory_log.cache_miss(id)
  }

  #[must_use]
  pub fn disk_cache_miss(&mut self, id: i64) -> ColdCacheStrategy {
    self.on_disk_log.cache_miss(id)
  }
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

  // NB: Not threadsafe due to multiple operations against hashes!
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