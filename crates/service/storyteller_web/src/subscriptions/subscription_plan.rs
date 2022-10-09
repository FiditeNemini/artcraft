
/**

 User has:

   fakeyou, pro
   fakeyou, pro
   stream, basic

*/

#[derive(Clone)]
pub struct SubscriptionPlan {
  /// This is the website or platform the subscription exists on.
  /// These should be distinct namespaces.
  /// It must be human-readability friendly, consist of only lowercase alphanumerics,
  /// underscores, and hyphens, and be 32 characters or fewer.
  pub category_key: String,

  /// This is the unique identifier for the subscription (must be unique across namespaces!)
  /// It must be human-readability friendly, consist of only lowercase alphanumerics,
  /// underscores, and hyphens, and be 32 characters or fewer.
  pub product_key: String,

  /// The stripe product ID for this plan
  pub stripe_product_id: String,
  pub stripe_test_product_id: String,

  /// The stripe price ID for this plan
  pub stripe_price_ids: Vec<String>,
  pub stripe_test_price_ids: Vec<String>,
}

impl SubscriptionPlan {

  pub fn has_feature_foo(&self) -> bool {
    false
  }

  pub fn priority_level_tts(&self) -> u32 {
    0
  }

  pub fn priority_level_tts_api(&self) -> Option<u32> {
    Some(0)
  }
}
