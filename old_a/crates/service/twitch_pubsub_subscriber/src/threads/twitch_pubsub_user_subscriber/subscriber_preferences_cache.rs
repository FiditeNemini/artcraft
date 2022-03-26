use database_queries::queries::twitch::twitch_event_rules::list_twitch_event_rules_for_user::TwitchEventRule;
use database_queries::column_types::twitch_event_category::TwitchEventCategory;
use database_queries::complex_models::event_match_predicate::EventMatchPredicate;
use database_queries::complex_models::event_responses::EventResponse;

#[derive(Clone)]
pub struct TwitchEventRuleLight {
  pub token: String,
  pub event_category: TwitchEventCategory,
  pub event_match_predicate: EventMatchPredicate,
  pub event_response: EventResponse,
  pub user_specified_rule_order: u32,
  pub rule_is_disabled: bool,
}

/// The "Twitch Pubsub Subscriber" thread is complicated.
/// Let's maintain a cache we can pass around.
pub struct TwitchPubsubCachedState {
  // TODO: Query global settings.
  pub global_settings: Option<bool>,

  // TODO: Query event rules.
  // TODO: Not in order.
  pub event_rules: Vec<TwitchEventRuleLight>,
}

impl TwitchPubsubCachedState {
  pub fn new() -> Self {
    Self {
      global_settings: None,
      event_rules: Vec::new(),
    }
  }
}
