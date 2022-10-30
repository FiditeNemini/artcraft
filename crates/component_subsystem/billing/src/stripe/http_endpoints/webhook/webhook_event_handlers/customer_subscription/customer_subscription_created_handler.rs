use crate::stripe::http_endpoints::webhook::webhook_event_handlers::customer_subscription::calculate_subscription_end_date::calculate_subscription_end_date;
use crate::stripe::http_endpoints::webhook::webhook_event_handlers::customer_subscription::common::{UNKNOWN_SUBSCRIPTION_CATEGORY, UNKNOWN_SUBSCRIPTION_PRODUCT_KEY};
use crate::stripe::http_endpoints::webhook::webhook_event_handlers::customer_subscription::subscription_event_extractor::subscription_summary_extractor;
use crate::stripe::http_endpoints::webhook::webhook_event_handlers::stripe_webhook_error::StripeWebhookError;
use crate::stripe::http_endpoints::webhook::webhook_event_handlers::stripe_webhook_summary::StripeWebhookSummary;
use crate::stripe::traits::internal_subscription_product_lookup::InternalSubscriptionProductLookup;
use database_queries::queries::billing::subscriptions::get_subscription_by_stripe_id::get_subscription_by_stripe_id;
use database_queries::queries::billing::subscriptions::upsert_subscription_by_stripe_id::UpsertSubscriptionByStripeId;
use log::{error, warn};
use sqlx::MySqlPool;
use stripe::Subscription;
use database_queries::queries::billing::subscriptions::update_user_record_with_new_stripe_customer_id::update_user_record_with_new_stripe_customer_id;

/// Handle event type: 'customer.subscription.created'
/// Sent when the subscription is created. The subscription status may be incomplete if customer
/// authentication is required to complete the payment or if you set payment_behavior to
/// default_incomplete. For more details, read about subscription payment behavior.
pub async fn customer_subscription_created_handler(
  subscription: &Subscription,
  internal_subscription_product_lookup: &dyn InternalSubscriptionProductLookup,
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

  let maybe_internal_subscription_product =
      internal_subscription_product_lookup.lookup_internal_product_from_stripe_product_id(&summary.stripe_product_id)
          .map_err(|err| {
            error!("Error mapping to internal product: {:?}", err);
            StripeWebhookError::ServerError // NB: This was probably *our* fault.
          })?;

  let mut subscription_category = UNKNOWN_SUBSCRIPTION_CATEGORY;
  let mut subscription_product_key = UNKNOWN_SUBSCRIPTION_PRODUCT_KEY;

  if let Some(ref internal_product) = maybe_internal_subscription_product {
    subscription_category = &internal_product.subscription_category;
    subscription_product_key = &internal_product.subscription_product_key;
  }

  // TODO: record cancel_at (future_cancel_at), canceled_at, ended_at (if subscription ended, when it ended), start_date

  let upsert = UpsertSubscriptionByStripeId {
    stripe_subscription_id: &summary.stripe_subscription_id,
    maybe_user_token: summary.user_token.as_deref(),
    subscription_category,
    subscription_product_key,
    maybe_stripe_customer_id: Some(&summary.stripe_customer_id),
    maybe_stripe_product_id: Some(&summary.stripe_product_id),
    maybe_stripe_price_id: Some(&summary.stripe_price_id),
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

    if let Some(user_token) = summary.user_token.as_deref() {
      // TODO: Should we care if a user accidentally gets two stripe customer IDs and this
      //  overwrites one of them?
      update_user_record_with_new_stripe_customer_id(
        mysql_pool,
        user_token,
        Some(&summary.stripe_customer_id))
          .await
          .map_err(|err| {
            error!("Mysql error: {:?}", err);
            StripeWebhookError::ServerError
          })?;
    }

  result.action_was_taken = true;
  result.should_ignore_retry = true;

  Ok(result)
}
