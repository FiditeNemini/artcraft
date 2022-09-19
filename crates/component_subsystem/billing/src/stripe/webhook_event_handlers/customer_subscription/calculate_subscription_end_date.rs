use chrono::{Duration, NaiveDateTime};
use crate::stripe::webhook_event_handlers::customer_subscription::subscription_event_extractor::SubscriptionSummary;
use std::ops::Add;

#[inline]
pub fn calculate_subscription_end_date(subscription_summary: &SubscriptionSummary) -> NaiveDateTime {
  let SUBSCRIPTION_GRACE_DAYS = Duration::days(2);
  subscription_summary.current_billing_period_end.add(SUBSCRIPTION_GRACE_DAYS)
}
