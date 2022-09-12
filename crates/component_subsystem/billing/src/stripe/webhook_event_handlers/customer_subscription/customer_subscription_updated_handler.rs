use chrono::{DateTime, Utc};
use crate::stripe::helpers::common_metadata_keys::METADATA_USER_TOKEN;
use crate::stripe::helpers::expand_customer_id::expand_customer_id;
use crate::stripe::webhook_event_handlers::stripe_webhook_error::StripeWebhookError;
use log::{error, warn};
use stripe::{Subscription, SubscriptionInterval};
use container_common::anyhow_result::AnyhowResult;

/// Handle event type: 'customer.subscription.updated'
pub fn customer_subscription_updated_handler(subscription: &Subscription) -> Result<(), StripeWebhookError> {

  let json = serde_json::ser::to_string(&subscription).unwrap();

  error!("\n\n   subscription.updated ----> {}\n\n", json);

  let stripe_subscription_id = subscription.id.to_string();
  let stripe_subscription_status = subscription.status.to_string();

  // NB: We'll need this to send them to the "customer portal", which is how they can modify or
  // cancel their subscriptions.
  let maybe_stripe_customer_id = expand_customer_id(&subscription.customer);

  // NB: Our internal user token.
  let maybe_user_token = subscription.metadata.get(METADATA_USER_TOKEN)
      .map(|t| t.to_string());

  error!(">>> customer.subscription.updated: {:?}, {:?}, {:?}, {:?}",
    stripe_subscription_id, maybe_stripe_customer_id, maybe_user_token, stripe_subscription_status);

  Ok(())
}

