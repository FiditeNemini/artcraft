use anyhow::anyhow;
use chrono::{DateTime, NaiveDateTime, Utc};
use container_common::anyhow_result::AnyhowResult;
use crate::helpers::boolean_converters::i8_to_bool;
use log::warn;
use reusable_types::stripe::stripe_subscription_status::StripeSubscriptionStatus;
use sqlx::MySqlPool;

pub struct StripeWebhookEventLog {
  pub stripe_event_id: String,

  /// This helps us handle idempotency and ignore repeat events that get replayed.
  /// If set to true, we shouldn't process the same event again.
  pub should_ignore_retry: bool,
}

pub async fn get_stripe_webhook_event_log_by_id(
  stripe_event_id: &str,
  mysql_pool: &MySqlPool
) -> AnyhowResult<Option<StripeWebhookEventLog>> {

  let maybe_record = sqlx::query_as!(
      RawStripeWebhookEventLogFromDb,
        r#"
SELECT
  stripe_event_id,
  should_ignore_retry
FROM stripe_webhook_event_logs
WHERE
  stripe_event_id = ?
        "#,
        stripe_event_id,
    )
      .fetch_one(mysql_pool)
      .await;

  match maybe_record {
    Err(sqlx::error::Error::RowNotFound) => Ok(None),
    Err(e) => {
      Err(anyhow!("mysql query error: {:?}", e))
    }
    Ok(r) => {
      Ok(Some(StripeWebhookEventLog {
        stripe_event_id: r.stripe_event_id,
        should_ignore_retry: i8_to_bool(r.should_ignore_retry),
      }))
    },
  }
}

struct RawStripeWebhookEventLogFromDb {
  pub stripe_event_id: String,
  pub should_ignore_retry: i8,
}
