use serde_derive::Deserialize;

/// Simple stats that can be attached to any entity
#[derive(Deserialize)]
pub struct SimpleEntityStats {
  /// Number of positive ratings (or "likes") for this item
  pub positive_rating_count: u32,
  /// Number of bookmarks for this item
  pub bookmark_count: u32,
}
