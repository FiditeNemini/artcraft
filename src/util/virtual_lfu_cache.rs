use anyhow::anyhow;
use crate::util::anyhow_result::AnyhowResult;
use lfu::LFUCache;
use std::sync::{Arc, RwLock};
use std::collections::HashSet;

/// This stands in front of the python HTTP sidecar and controls which
/// models get to remain in memory. The Python sidecar keeps multiple
/// models around, and Rust dictates which ones to keep and which to
/// purge.
pub struct VirtualLfuCache {
  cache: LFUCache<String, ()>,
}

impl VirtualLfuCache {

  pub fn new(capacity: usize) -> AnyhowResult<Self> {
    let cache = LFUCache::with_capacity(capacity)
        .map_err(|e| anyhow!("Error creating cache (probably capacity): {:?}", e))?;
    Ok(Self {
      cache,
    })
  }

  pub fn in_cache<S: AsRef<String>>(&self, model: S) -> bool {
    self.cache.contains(model.as_ref())
  }

  /// Returns the evicted entry.
  pub fn insert(&mut self, path: &str) -> Option<String> {
    let initial_keys = self.get_keyset();

    self.cache.set(path.to_string(), ());

    let after_keys = self.get_keyset();

    let difference = initial_keys.difference(&after_keys);

    difference.last()
        .map(|item| item.to_string())
  }

  pub fn size(&self) -> usize {
    self.cache.len()
  }

  fn get_keyset(&self) -> HashSet<String> {
    // NB: This only makes sense for our use while we're using small caches.
    let mut key_set = HashSet::with_capacity(self.size());
    for (k, _) in self.cache.iter() {
      key_set.insert(k.to_string());
    }
    key_set
  }
}

#[cfg(test)]
pub mod tests {
  use crate::util::virtual_lfu_cache::VirtualLfuCache;

  #[test]
  fn insert_beyond_capacity() {
    let mut cache = VirtualLfuCache::new(3).unwrap();
    assert_eq!(cache.size(), 0);
    cache.insert("foo");
    assert_eq!(cache.size(), 1);
    cache.insert("bar");
    assert_eq!(cache.size(), 2);
    cache.insert("baz");
    assert_eq!(cache.size(), 3);
    cache.insert("bin");
    assert_eq!(cache.size(), 3);
    cache.insert("bin");
    assert_eq!(cache.size(), 3);
    cache.insert("111111111111111111");
    assert_eq!(cache.size(), 3);
  }

  fn repeated_insert_single_key() {
    let mut cache = VirtualLfuCache::new(3).unwrap();
    assert_eq!(cache.size(), 0);
    for _ in 0..10 {
      cache.insert("foo");
    }
    assert_eq!(cache.size(), 1);
  }

  #[test]
  fn returns_first_for_eviction_when_all_used_once() {
    let mut cache = VirtualLfuCache::new(3).unwrap();
    cache.insert("foo");
    cache.insert("bar");
    cache.insert("baz");
    let discarded = cache.insert("bin");
    assert_eq!(discarded, Some("foo".to_string()));
  }

  #[test]
  fn retains_frequent_value() {
    let mut cache = VirtualLfuCache::new(3).unwrap();
    for _ in 0..10 {
      cache.insert("foo");
    }
    cache.insert("bar");
    cache.insert("baz");
    let discarded = cache.insert("bin");
    assert_eq!(discarded, Some("bar".to_string()));
  }

  #[test]
  fn retains_second_frequent_value() {
    let mut cache = VirtualLfuCache::new(3).unwrap();
    for _ in 0..10 {
      cache.insert("foo");
    }
    for _ in 0..2 {
      cache.insert("bar");
    }
    cache.insert("baz");
    let discarded = cache.insert("bin");
    assert_eq!(discarded, Some("baz".to_string()));
  }
}
