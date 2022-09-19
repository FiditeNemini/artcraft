use chrono::{Duration, NaiveDateTime};
use crate::stripe::webhook_event_handlers::customer_subscription::subscription_event_extractor::SubscriptionSummary;
use once_cell::sync::Lazy;
use std::ops::Add;

const SUBSCRIPTION_GRACE_DAYS: Lazy<Duration> = Lazy::new(|| {
  Duration::days(2)
});

#[inline]
pub fn calculate_subscription_end_date(subscription_summary: &SubscriptionSummary) -> NaiveDateTime {
  let mut subscription_end = subscription_summary.current_billing_period_end;

  if !subscription_summary.cancel_at_period_end {
    subscription_end = subscription_end.add(*SUBSCRIPTION_GRACE_DAYS);
  }

  subscription_end
}
