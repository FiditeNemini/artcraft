use chrono::{DateTime, Utc};
use crate::stripe::helpers::common_metadata_keys::METADATA_USER_TOKEN;
use crate::stripe::helpers::expand_customer_id::expand_customer_id;
use crate::stripe::webhook_event_handlers::stripe_webhook_error::StripeWebhookError;
use log::{error, warn};
use stripe::{Subscription, SubscriptionInterval};
use container_common::anyhow_result::AnyhowResult;
use crate::stripe::webhook_event_handlers::customer_subscription::subscription_event_extractor::subscription_summary_extractor;

/// Handle event type: 'customer.subscription.updated'
pub fn customer_subscription_updated_handler(subscription: &Subscription) -> Result<(), StripeWebhookError> {
  //let json = serde_json::ser::to_string(&subscription).unwrap();
  //error!("\n\n   subscription.updated ----> {}\n\n", json);

  let summary = subscription_summary_extractor(subscription)
      .map_err(|err| {
        error!("Error extracting subscription from 'customer.subscription.updated' payload: {:?}", err);
        StripeWebhookError::ServerError // NB: This was probably *our* fault.
      })?;

  warn!(">>> subscription.updated = {:?}", summary);

  Ok(())
}

