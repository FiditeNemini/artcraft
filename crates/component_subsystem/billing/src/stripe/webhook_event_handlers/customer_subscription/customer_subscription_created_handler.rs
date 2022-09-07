use crate::stripe::helpers::common_metadata_keys::METADATA_USER_TOKEN;
use crate::stripe::helpers::expand_customer_id::expand_customer_id;
use crate::stripe::webhook_event_handlers::stripe_webhook_error::StripeWebhookError;
use log::{error, warn};
use stripe::Subscription;

/// Handle event type: 'customer.subscription.created'
pub fn customer_subscription_created_handler(subscription: &Subscription) -> Result<(), StripeWebhookError> {

  let stripe_subscription_id = subscription.id.to_string();

  // NB: We'll need this to send them to the "customer portal", which is how they can modify or
  // cancel their subscriptions.
  let maybe_stripe_customer_id = subscription.customer
      .as_ref()
      .map(|c| expand_customer_id(c));

  // NB: Our internal user token.
  let maybe_user_token = subscription.metadata.get(METADATA_USER_TOKEN)
      .map(|t| t.to_string());

  error!(">>> customer.subscription.created: {:?}, {:?}, {:?}",
    stripe_subscription_id, maybe_stripe_customer_id, maybe_user_token);

  Ok(())
}
