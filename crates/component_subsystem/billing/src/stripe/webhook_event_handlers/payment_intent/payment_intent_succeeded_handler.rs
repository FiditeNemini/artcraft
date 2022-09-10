use container_common::anyhow_result::AnyhowResult;
use crate::stripe::helpers::common_metadata_keys::METADATA_USER_TOKEN;
use crate::stripe::helpers::expand_customer_id::expand_customer_id;
use crate::stripe::webhook_event_handlers::stripe_webhook_error::StripeWebhookError;
use log::warn;
use stripe::{Invoice, PaymentIntent};

// Handle event type: 'payment_intent.succeeded'
pub fn payment_intent_succeeded_handler(payment_intent: &PaymentIntent) -> Result<(), StripeWebhookError> {

  let payment_intent_status = payment_intent.status;

  // NB: We'll need this to send them to the "customer portal", which is how they can modify
  // or cancel their subscriptions.
  let maybe_stripe_customer_id  = payment_intent.customer
      .as_ref()
      .map(|c| expand_customer_id(c));

  // NB: Our internal user token.
  let maybe_user_token = payment_intent.metadata.get(METADATA_USER_TOKEN)
      .map(|t| t.to_string());

  warn!(">>> payment_intent.succeeded: {:?}, {:?}, {:?}",
    payment_intent_status, maybe_stripe_customer_id, maybe_user_token);

  Ok(())
}
