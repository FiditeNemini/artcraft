use crate::stripe::helpers::common_metadata_keys::METADATA_USER_TOKEN;
use crate::stripe::helpers::expand_customer_id::expand_customer_id;
use crate::stripe::webhook_event_handlers::stripe_webhook_error::StripeWebhookError;
use log::{error, warn};
use stripe::Subscription;
use crate::stripe::webhook_event_handlers::customer_subscription::subscription_event_extractor::subscription_summary_extractor;

/// Handle event type: 'customer.subscription.created'
/// Sent when the subscription is created. The subscription status may be incomplete if customer
/// authentication is required to complete the payment or if you set payment_behavior to
/// default_incomplete. For more details, read about subscription payment behavior.
pub fn customer_subscription_created_handler(subscription: &Subscription) -> Result<(), StripeWebhookError> {

  let json = serde_json::ser::to_string(&subscription).unwrap();
  error!("\n\n   subscription.created ----> {}\n\n", json);


  let summary = subscription_summary_extractor(subscription)
      .map_err(|err| {
        error!("Error extracting subscription from 'customer.subscription.created' payload: {:?}", err);
        StripeWebhookError::ServerError // NB: This was probably *our* fault.
      })?;

  warn!(">>> subscription.created = {:?}", summary);

  Ok(())
}
