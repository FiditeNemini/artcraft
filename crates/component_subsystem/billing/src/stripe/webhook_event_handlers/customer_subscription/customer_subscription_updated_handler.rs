use crate::stripe::webhook_event_handlers::customer_subscription::subscription_event_extractor::subscription_summary_extractor;
use crate::stripe::webhook_event_handlers::stripe_webhook_error::StripeWebhookError;
use crate::stripe::webhook_event_handlers::stripe_webhook_summary::StripeWebhookSummary;
use database_queries::queries::billing::subscriptions::upsert_subscription_by_stripe_id::UpsertSubscriptionByStripeId;
use log::{error, warn};
use sqlx::MySqlPool;
use stripe::Subscription;

/// Handle event type: 'customer.subscription.updated'
pub async fn customer_subscription_updated_handler(
  subscription: &Subscription,
  mysql_pool: &MySqlPool,
) -> Result<StripeWebhookSummary, StripeWebhookError> {

  let summary = subscription_summary_extractor(subscription)
      .map_err(|err| {
        error!("Error extracting subscription from 'customer.subscription.updated' payload: {:?}", err);
        StripeWebhookError::ServerError // NB: This was probably *our* fault.
      })?;

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

  Ok(StripeWebhookSummary {
    maybe_user_token: summary.user_token,
    maybe_event_entity_id: Some(summary.stripe_subscription_id),
    maybe_stripe_customer_id: Some(summary.stripe_customer_id),
    event_was_handled: true,
  })
}
