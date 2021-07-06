use anyhow::anyhow;
use chrono::{DateTime, Utc, Duration};
use crate::util::anyhow_result::AnyhowResult;
use crate::util::jobs::cache_miss_strategizer::{CacheMissStrategizer, CacheMissStrategy};
use std::sync::{RwLock, Arc};

/// Keep track of multiple caches, each with different time penalties.
/// (This isn't strictly necessary)
pub struct MultiCacheMissStrategizer {
  in_memory_log: CacheMissStrategizer,
  on_disk_log: CacheMissStrategizer,
  // ... future caches ?
}

/// And the Sync/Send threadsafe + interior mutability version.
#[derive(Clone)]
pub struct SyncMultiCacheMissStrategizer {
  multi_cache_log: Arc<RwLock<MultiCacheMissStrategizer>>,
}

impl SyncMultiCacheMissStrategizer {
  pub fn new(in_memory_log: CacheMissStrategizer, on_disk_log: CacheMissStrategizer) -> Self {
    let multi_cache_log = MultiCacheMissStrategizer::new(
      in_memory_log,
      on_disk_log,
    );
    Self {
      multi_cache_log: Arc::new(RwLock::new(multi_cache_log)),
    }
  }

  #[must_use]
  pub fn memory_cache_miss(&self, id: i64) -> AnyhowResult<CacheMissStrategy> {
    let result = self.multi_cache_log
        .write()
        .map(|mut cache_logs| cache_logs.memory_cache_miss(id))
        .map_err(|err| anyhow!("mutex error: {:?}", err))?;
    Ok(result)
  }

  #[must_use]
  pub fn disk_cache_miss(&self, id: i64) -> AnyhowResult<CacheMissStrategy> {
    let result = self.multi_cache_log
        .write()
        .map(|mut cache_logs| cache_logs.disk_cache_miss(id))
        .map_err(|err| anyhow!("mutex error: {:?}", err))?;
    Ok(result)
  }
}

impl MultiCacheMissStrategizer {
  pub fn new(in_memory_log: CacheMissStrategizer, on_disk_log: CacheMissStrategizer) -> Self {
    Self {
      in_memory_log,
      on_disk_log,
    }
  }

  #[must_use]
  pub fn memory_cache_miss(&mut self, id: i64) -> CacheMissStrategy {
    self.in_memory_log.cache_miss(id)
  }

  #[must_use]
  pub fn disk_cache_miss(&mut self, id: i64) -> CacheMissStrategy {
    self.on_disk_log.cache_miss(id)
  }
}
