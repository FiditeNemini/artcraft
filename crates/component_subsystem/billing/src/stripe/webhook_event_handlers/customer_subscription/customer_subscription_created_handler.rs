use crate::stripe::webhook_event_handlers::customer_subscription::subscription_event_extractor::subscription_summary_extractor;
use crate::stripe::webhook_event_handlers::stripe_webhook_error::StripeWebhookError;
use crate::stripe::webhook_event_handlers::stripe_webhook_summary::StripeWebhookSummary;
use log::{error, warn};
use stripe::Subscription;

/// Handle event type: 'customer.subscription.created'
/// Sent when the subscription is created. The subscription status may be incomplete if customer
/// authentication is required to complete the payment or if you set payment_behavior to
/// default_incomplete. For more details, read about subscription payment behavior.
pub fn customer_subscription_created_handler(subscription: &Subscription) -> Result<StripeWebhookSummary, StripeWebhookError> {
  let summary = subscription_summary_extractor(subscription)
      .map_err(|err| {
        error!("Error extracting subscription from 'customer.subscription.created' payload: {:?}", err);
        StripeWebhookError::ServerError // NB: This was probably *our* fault.
      })?;

  Ok(StripeWebhookSummary {
    maybe_user_token: summary.user_token,
    maybe_event_entity_id: Some(summary.stripe_subscription_id),
    maybe_stripe_customer_id: Some(summary.stripe_customer_id),
    event_was_handled: false,
  })
}
