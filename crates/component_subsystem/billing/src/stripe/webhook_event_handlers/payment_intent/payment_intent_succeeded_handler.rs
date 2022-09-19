use container_common::anyhow_result::AnyhowResult;
use crate::stripe::helpers::common_metadata_keys::METADATA_USER_TOKEN;
use crate::stripe::helpers::expand_customer_id::expand_customer_id;
use crate::stripe::webhook_event_handlers::stripe_webhook_error::StripeWebhookError;
use crate::stripe::webhook_event_handlers::stripe_webhook_summary::StripeWebhookSummary;
use log::warn;
use stripe::{Invoice, PaymentIntent};

// Handle event type: 'payment_intent.succeeded'
pub fn payment_intent_succeeded_handler(payment_intent: &PaymentIntent) -> Result<StripeWebhookSummary, StripeWebhookError> {
  let payment_intent_id = payment_intent.id.to_string();

  let payment_intent_status = payment_intent.status;

  // NB: We'll need this to send them to the "customer portal", which is how they can modify
  // or cancel their subscriptions.
  let maybe_stripe_customer_id  = payment_intent.customer
      .as_ref()
      .map(|c| expand_customer_id(c));

  // NB: Our internal user token.
  let maybe_user_token = payment_intent.metadata.get(METADATA_USER_TOKEN)
      .map(|t| t.to_string());

  Ok(StripeWebhookSummary {
    maybe_user_token: maybe_user_token,
    maybe_event_entity_id: Some(payment_intent_id),
    maybe_stripe_customer_id: maybe_stripe_customer_id,
    event_was_handled: false,
  })
}
