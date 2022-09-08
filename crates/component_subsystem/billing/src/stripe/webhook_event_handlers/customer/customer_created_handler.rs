use container_common::anyhow_result::AnyhowResult;
use crate::stripe::helpers::common_metadata_keys::METADATA_USER_TOKEN;
use crate::stripe::helpers::expand_customer_id::expand_customer_id;
use crate::stripe::webhook_event_handlers::stripe_webhook_error::StripeWebhookError;
use log::warn;
use stripe::Customer;

// Handle event type: 'customer.created'
pub fn customer_created_handler(customer: &Customer) -> Result<(), StripeWebhookError> {

  // NB: We'll need this to send them to the "customer portal", which is how they can modify
  // or cancel their subscriptions.
  let customer_id = customer.id.to_string();

  // NB: Our internal user token.
  let maybe_user_token = customer.metadata.get(METADATA_USER_TOKEN)
      .map(|t| t.to_string());

  warn!(">>> customer.created: {:?}, {:?}", customer_id, maybe_user_token);

  Ok(())
}
