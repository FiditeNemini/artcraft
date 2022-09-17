
/// Reports common information from the webhook handlers
pub struct StripeWebhookSummary {
  /// If we recorded our own internal user ID as Stripe metadata, this passes it upstream.
  pub maybe_user_token: Option<String>,

  /// This is the core entity type associated with the webhook event.
  /// We pass this upstream so we can record it and look it up later for debugging.
  pub maybe_event_entity_id: Option<String>,

  /// This is the stripe customer ID, if it was associated with the event.
  pub maybe_stripe_customer_id: Option<String>,

  /// Whether we took action in response to the webhook.
  /// Not all event types have handlers yet.
  pub event_was_handled: bool,
}
