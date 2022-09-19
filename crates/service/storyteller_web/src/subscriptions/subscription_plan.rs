
/**

 User has:

   fakeyou, pro
   fakeyou, pro
   stream, basic

*/

#[derive(Clone)]
pub struct SubscriptionPlan {
  /// Slug is the unique identifier for the subscription
  /// It must be human-readability friendly, consist of only lowercase alphanumerics,
  /// underscores, and hyphens, and be 32 characters or fewer.
  pub slug: String,
}

impl SubscriptionPlan {

  pub fn base_tts_priority_level(&self) -> u32 {
    0
  }

  pub fn base_api_tts_priority_level(&self) -> Option<u32> {
    Some(0)
  }

  pub fn has_feature_foo(&self) -> bool {
    false
  }
}
