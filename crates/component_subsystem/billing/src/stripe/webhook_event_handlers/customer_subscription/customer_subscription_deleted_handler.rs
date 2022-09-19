use crate::stripe::webhook_event_handlers::customer_subscription::subscription_event_extractor::subscription_summary_extractor;
use crate::stripe::webhook_event_handlers::stripe_webhook_error::StripeWebhookError;
use crate::stripe::webhook_event_handlers::stripe_webhook_summary::StripeWebhookSummary;
use log::{error, warn};
use sqlx::MySqlPool;
use stripe::Subscription;

/// Handle event type: 'customer.subscription.deleted'
/// Sent when a customer’s subscription ends.
pub async fn customer_subscription_deleted_handler(
  subscription: &Subscription,
  mysql_pool: &MySqlPool,
) -> Result<StripeWebhookSummary, StripeWebhookError> {
  let summary = subscription_summary_extractor(subscription)
      .map_err(|err| {
        error!("Error extracting subscription from 'customer.subscription.deleted' payload: {:?}", err);
        StripeWebhookError::ServerError // NB: This was probably *our* fault.
      })?;

  Ok(StripeWebhookSummary {
    maybe_user_token: summary.user_token,
    maybe_event_entity_id: Some(summary.stripe_subscription_id),
    maybe_stripe_customer_id: Some(summary.stripe_customer_id),
    action_was_taken: false,
    should_ignore_retry: false,
  })
}
