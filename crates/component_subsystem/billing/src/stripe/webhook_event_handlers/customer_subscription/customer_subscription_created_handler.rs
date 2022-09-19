use crate::stripe::webhook_event_handlers::customer_subscription::calculate_subscription_end_date::calculate_subscription_end_date;
use crate::stripe::webhook_event_handlers::customer_subscription::subscription_event_extractor::subscription_summary_extractor;
use crate::stripe::webhook_event_handlers::stripe_webhook_error::StripeWebhookError;
use crate::stripe::webhook_event_handlers::stripe_webhook_summary::StripeWebhookSummary;
use database_queries::queries::billing::subscriptions::get_subscription_by_stripe_id::get_subscription_by_stripe_id;
use database_queries::queries::billing::subscriptions::upsert_subscription_by_stripe_id::UpsertSubscriptionByStripeId;
use log::{error, warn};
use sqlx::MySqlPool;
use stripe::Subscription;

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
    action_was_taken: false,
    should_ignore_retry: false,
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
    result.should_ignore_retry = true;
    return Ok(result);
  }

  // TODO: record cancel_at (future_cancel_at), canceled_at, ended_at (if subscription ended, when it ended), start_date

  let upsert = UpsertSubscriptionByStripeId {
    stripe_subscription_id: &summary.stripe_subscription_id,
    maybe_user_token: summary.user_token.as_deref(),
    subscription_category: "todo",
    subscription_product_key: "todo",
    maybe_stripe_product_id: Some(&summary.stripe_product_id),
    maybe_stripe_customer_id: Some(&summary.stripe_customer_id),
    maybe_stripe_recurring_interval: Some(summary.subscription_interval),
    maybe_stripe_subscription_status: Some(summary.stripe_subscription_status),
    maybe_stripe_is_production: Some(summary.stripe_is_production),
    subscription_start_at: summary.subscription_start_date,
    current_billing_period_start_at: summary.current_billing_period_start,
    current_billing_period_end_at: summary.current_billing_period_end,
    subscription_expires_at: calculate_subscription_end_date(&summary),
    maybe_cancel_at: summary.maybe_cancel_at,
    maybe_canceled_at: summary.maybe_canceled_at,
  };

  let _r = upsert.upsert(mysql_pool)
      .await
      .map_err(|err| {
        error!("Mysql error: {:?}", err);
        StripeWebhookError::ServerError
      })?;

  result.action_was_taken = true;
  result.should_ignore_retry = true;

  Ok(result)
}
