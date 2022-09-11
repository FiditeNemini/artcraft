use container_common::anyhow_result::AnyhowResult;
use crate::stripe::helpers::common_metadata_keys::METADATA_USER_TOKEN;
use crate::stripe::helpers::expand_customer_id::expand_customer_id;
use crate::stripe::webhook_event_handlers::stripe_webhook_error::StripeWebhookError;
use log::error;
use stripe::{Charge, Invoice, PaymentIntent};

// Handle event type: 'charge.succeeded'
pub fn charge_succeeded_handler(charge: &Charge) -> Result<(), StripeWebhookError> {

  let charge_status = charge.status;

  // NB: We'll need this to send them to the "customer portal", which is how they can modify
  // or cancel their subscriptions.
  let maybe_stripe_customer_id  = charge.customer
      .as_ref()
      .map(|c| expand_customer_id(c));

  // NB: Our internal user token.
  let maybe_user_token = charge.metadata.get(METADATA_USER_TOKEN)
      .map(|t| t.to_string());

  error!(">>> charge.succeeded: {:?}, {:?}, {:?}",
    charge_status, maybe_stripe_customer_id, maybe_user_token);

  Ok(())
}
