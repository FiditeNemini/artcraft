use std::collections::HashMap;
use enums::no_table::premium_product::premium_product_name::PremiumProductName;
use crate::payloads::premium::inner_state::product_by_week_subkey::ProductByWeekSubkey;

#[derive(Clone)]
pub struct ProductByWeekStore {
  /// Key: "{product_id}:{iso_week_zero_index}"
  /// Value: count of uses
  pub free_uses_per_product_map: HashMap<ProductByWeekSubkey, u64>,
}

impl ProductByWeekStore {
  pub fn new() -> Self {
    Self {
      free_uses_per_product_map: HashMap::new(),
    }
  }

  pub fn set_use_count(&mut self, key: ProductByWeekSubkey, count: u64) {
    self.free_uses_per_product_map.insert(key, count);
  }

  pub fn increment_use(&mut self, name: PremiumProductName, week: u32) {
    let key = ProductByWeekSubkey::new(name, week);
    let count = self.free_uses_per_product_map.entry(key).or_insert(0);
    *count += 1;
  }

  pub fn get_use_count(&self, name: PremiumProductName, week: u32) -> u64 {
    let key = ProductByWeekSubkey::new(name, week);
    *self.free_uses_per_product_map.get(&key).unwrap_or(&0)
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_increment_use() {
    let mut store = ProductByWeekStore::new();

    store.increment_use(PremiumProductName::FaceAnimator, 10);
    store.increment_use(PremiumProductName::FaceAnimator, 10);
    store.increment_use(PremiumProductName::FaceAnimator, 10);
    store.increment_use(PremiumProductName::FaceMirror, 10);
    store.increment_use(PremiumProductName::Lipsync, 11);

    // Week 10
    assert_eq!(store.get_use_count(PremiumProductName::FaceAnimator, 10), 3);
    assert_eq!(store.get_use_count(PremiumProductName::FaceMirror, 10), 1);
    assert_eq!(store.get_use_count(PremiumProductName::Lipsync, 10), 0);
    assert_eq!(store.get_use_count(PremiumProductName::VideoStyleTransfer, 10), 0);

    // Week 11
    assert_eq!(store.get_use_count(PremiumProductName::FaceAnimator, 11), 0);
    assert_eq!(store.get_use_count(PremiumProductName::FaceMirror, 11), 0);
    assert_eq!(store.get_use_count(PremiumProductName::Lipsync, 11), 1);
    assert_eq!(store.get_use_count(PremiumProductName::VideoStyleTransfer, 11), 0);
  }
}