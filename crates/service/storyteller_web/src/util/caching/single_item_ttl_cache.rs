use anyhow::bail;
use crate::util::anyhow_result::AnyhowResult;
use lru_time_cache::LruCache;
use std::sync::{Arc, Mutex, PoisonError, MutexGuard};
use std::time::Duration;

const CACHE_KEY : &'static str = "ITEM";

/// Store a single payload in the cache
#[derive(Clone)]
pub struct SingleItemTtlCache<T: Clone + ?Sized> {
  cache: Arc<Mutex<LruCache<String, T>>>,
}

impl <T: Clone + ?Sized> SingleItemTtlCache<T> {
  pub fn create_with_duration(time_to_live: Duration) -> Self {
    let cache = LruCache::with_expiry_duration(time_to_live);
    let cache = Arc::new(Mutex::new(cache));
    Self {
      cache,
    }
  }

  pub fn copy_without_bump_if_unexpired(&self) -> AnyhowResult<Option<T>> {
    let maybe_copy = match self.cache.lock() {
      Err(e) => bail!("could not unlock mutex to read: {:?}", e),
      Ok(mut cache) => {
        cache.peek(CACHE_KEY).map(|inner| inner.clone())
      },
    };
    Ok(maybe_copy)
  }

  pub fn store_copy(&self, item: &T) -> AnyhowResult<()> {
    match self.cache.lock() {
      Err(e) => bail!("could not unlock mutex to write: {:?}", e),
      Ok(mut cache) => {
        cache.insert(CACHE_KEY.into(), item.clone());
      },
    };
    Ok(())
  }
}
