use crate::stripe::webhook_event_handlers::customer_subscription::subscription_event_extractor::subscription_summary_extractor;
use crate::stripe::webhook_event_handlers::stripe_webhook_error::StripeWebhookError;
use crate::stripe::webhook_event_handlers::stripe_webhook_summary::StripeWebhookSummary;
use log::{error, warn};
use sqlx::MySqlPool;
use stripe::Subscription;
use database_queries::queries::billing::subscriptions::get_subscription_by_stripe_id::get_subscription_by_stripe_id;
use database_queries::queries::billing::subscriptions::upsert_subscription_by_stripe_id::UpsertSubscriptionByStripeId;

/// Handle event type: 'customer.subscription.created'
/// Sent when the subscription is created. The subscription status may be incomplete if customer
/// authentication is required to complete the payment or if you set payment_behavior to
/// default_incomplete. For more details, read about subscription payment behavior.
pub async fn customer_subscription_created_handler(
  subscription: &Subscription,
  mysql_pool: &MySqlPool,
) -> Result<StripeWebhookSummary, StripeWebhookError> {

  let summary = subscription_summary_extractor(subscription)
      .map_err(|err| {
        error!("Error extracting subscription from 'customer.subscription.created' payload: {:?}", err);
        StripeWebhookError::ServerError // NB: This was probably *our* fault.
      })?;

  let mut result = StripeWebhookSummary {
    maybe_user_token: summary.user_token.clone(),
    maybe_event_entity_id: Some(summary.stripe_subscription_id.clone()),
    maybe_stripe_customer_id: Some(summary.stripe_customer_id.clone()),
    event_was_handled: false,
  };

  // NB: It's possible to receive events out of order.
  // We won't want to play a `create` event on top.
  let maybe_existing_subscription = get_subscription_by_stripe_id(&summary.stripe_subscription_id, &mysql_pool)
      .await
      .map_err(|err| {
        error!("Mysql error: {:?}", err);
        StripeWebhookError::ServerError
      })?;

  if maybe_existing_subscription.is_some() {
    return Ok(result);
  }

  let upsert = UpsertSubscriptionByStripeId {
    stripe_subscription_id: &summary.stripe_subscription_id,
    maybe_user_token: summary.user_token.as_deref(),
    subscription_category: "todo",
    subscription_product_key: "todo",
    maybe_stripe_product_id: Some(&summary.stripe_product_id),
    maybe_stripe_customer_id: Some(&summary.stripe_customer_id),
    maybe_stripe_subscription_status: Some(summary.stripe_subscription_status.as_str()),
    maybe_stripe_is_production: Some(summary.stripe_is_production),
    subscription_created_at: summary.subscription_period_start,
    subscription_expires_at: summary.subscription_period_end,
  };

  let _r = upsert.upsert(mysql_pool)
      .await
      .map_err(|err| {
        error!("Mysql error: {:?}", err);
        StripeWebhookError::ServerError
      })?;

  result.event_was_handled = true;
  Ok(result)
}
