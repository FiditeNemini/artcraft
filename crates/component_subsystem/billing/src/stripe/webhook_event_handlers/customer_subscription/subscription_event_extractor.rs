use anyhow::anyhow;
use chrono::{DateTime, NaiveDateTime, Utc};
use container_common::anyhow_result::AnyhowResult;
use crate::stripe::helpers::common_metadata_keys::METADATA_USER_TOKEN;
use crate::stripe::helpers::expand_customer_id::expand_customer_id;
use crate::stripe::helpers::expand_product_id::expand_product_id;
use reusable_types::stripe::stripe_subscription_status::StripeSubscriptionStatus;
use stripe::{Price, RecurringInterval, Subscription, SubscriptionInterval, SubscriptionStatus};
use crate::stripe::helpers::enums::subscription_status_to_reusable_type::subscription_status_to_reusable_type;

#[derive(Clone, Debug)]
pub struct SubscriptionSummary {
  /// Our own internal user token.
  pub user_token: Option<String>,

  /// Stripe production flag.
  pub stripe_is_production: bool,

  pub stripe_subscription_id: String,
  pub stripe_customer_id: String,
  pub stripe_product_id: String,
  pub stripe_price_id: String,

  pub stripe_subscription_status: StripeSubscriptionStatus,
  pub subscription_is_active: bool,
  pub subscription_interval: RecurringInterval,

  /// When the subscription was "created" in Stripe (including any backdating)
  pub subscription_start_date: NaiveDateTime,

  pub current_billing_period_start: NaiveDateTime,
  pub current_billing_period_end: NaiveDateTime,
}

/// Extract only the subscription details we care about
/// This should be unit testable against raw webhook JSON.
pub fn subscription_summary_extractor(subscription: &Subscription) -> AnyhowResult<SubscriptionSummary> {
  let subscription_id = subscription.id.to_string();
  // NB: Our internal user token.
  let maybe_user_token = subscription.metadata.get(METADATA_USER_TOKEN)
      .map(|t| t.to_string());

  if subscription.items.data.len() != 1 {
    return Err(anyhow!("Too many items in subscription {} : {}",
      subscription_id, subscription.items.data.len()));
  }

  let item = match subscription.items.data.first() {
    None => return Err(anyhow!("Could not get first item in subscription {}", subscription_id)),
    Some(line_item) => line_item,
  };

  let price = match &item.price {
    None => return Err(anyhow!("Could not get item price in subscription {}", subscription_id)),
    Some(price) => price,
  };

  let product = match &price.product {
    None => return Err(anyhow!("Could not get product in subscription {}", subscription_id)),
    Some(product) => product,
  };

  let recurring = match &price.recurring {
    None => return Err(anyhow!("Could not get interval in subscription {}", subscription_id)),
    Some(recurring) => recurring,
  };

  let start_date = NaiveDateTime::from_timestamp(subscription.start_date, 0);
  let period_start = NaiveDateTime::from_timestamp(subscription.current_period_start, 0);
  let period_end = NaiveDateTime::from_timestamp(subscription.current_period_end, 0);

  Ok(SubscriptionSummary {
    user_token: maybe_user_token,
    stripe_subscription_id: subscription_id,
    stripe_is_production: subscription.livemode,
    stripe_customer_id: expand_customer_id(&subscription.customer),
    stripe_subscription_status: subscription_status_to_reusable_type(subscription.status),
    stripe_product_id: expand_product_id(product),
    stripe_price_id: price.id.to_string(),
    subscription_is_active: subscription.status == SubscriptionStatus::Active,
    subscription_interval: recurring.interval,
    subscription_start_date: start_date,
    current_billing_period_start: period_start,
    current_billing_period_end: period_end,
  })
}

#[cfg(test)]
mod tests {
  use stripe::{RecurringInterval, Subscription, SubscriptionStatus};
  use reusable_types::stripe::stripe_subscription_status::StripeSubscriptionStatus;
  use crate::stripe::webhook_event_handlers::customer_subscription::subscription_event_extractor::subscription_summary_extractor;

  #[test]
  fn test_subscription_summary_extractor_on_create_event() {
    // NB: Actual raw test data from Stripe to our webhook
    let json = r#"
      {"id":"sub_1LhA3MEU5se17MekeWvmTNyk","automatic_tax":{"enabled":false},
      "billing_cycle_anchor":1662979188,"cancel_at_period_end":false,
      "collection_method":"charge_automatically","created":1662979188,"current_period_end":1665571188,
      "current_period_start":1662979188,"customer":"cus_MQ03py0gWUh0Ox","default_tax_rates":[],
      "items":{"data":[{"id":"si_MQ03hadVNfRnaS","created":1662979188,"deleted":false,"metadata":{},
      "price":{"id":"price_1LeDnKEU5se17MekVr1iYYNf","active":true,"billing_scheme":"per_unit",
      "created":1662278586,"currency":"usd","deleted":false,"livemode":false,"metadata":{},
      "product":"prod_MMxi2J5y69VPbO","recurring":{"interval":"month","interval_count":1,
      "usage_type":"licensed"},"tax_behavior":"exclusive","type":"recurring","unit_amount":700,
      "unit_amount_decimal":"700"},"quantity":1,"subscription":"sub_1LhA3MEU5se17MekeWvmTNyk",
      "tax_rates":[]}],"has_more":false,"total_count":1,
      "url":"/v1/subscription_items?subscription=sub_1LhA3MEU5se17MekeWvmTNyk"},
      "latest_invoice":"in_1LhA3MEU5se17MekUqOhZ9cu","livemode":false,
      "metadata":{"email":"email@email.com","username":"username","user_token":"U:TOKEN"},
      "payment_settings":{"save_default_payment_method":"off"},"start_date":1662979188,
      "status":"incomplete"}
    "#;

    let subscription = serde_json::from_str::<Subscription>(json).unwrap();

    let summary= subscription_summary_extractor(&subscription).unwrap();

    assert_eq!(summary.user_token, Some("U:TOKEN".to_string()));
    assert_eq!(summary.stripe_subscription_id, "sub_1LhA3MEU5se17MekeWvmTNyk".to_string());
    assert_eq!(summary.stripe_subscription_status, StripeSubscriptionStatus::Incomplete);
    assert_eq!(summary.subscription_is_active, false);
    assert_eq!(summary.stripe_customer_id, "cus_MQ03py0gWUh0Ox".to_string());
    assert_eq!(summary.stripe_product_id, "prod_MMxi2J5y69VPbO".to_string());
    assert_eq!(summary.stripe_price_id, "price_1LeDnKEU5se17MekVr1iYYNf".to_string());
    assert_eq!(summary.subscription_interval, RecurringInterval::Month);
    assert_eq!(summary.stripe_is_production, false);
    assert_eq!(summary.subscription_start_date.to_string(), "2022-09-12 10:39:48".to_string());
    assert_eq!(summary.current_billing_period_start.to_string(), "2022-09-12 10:39:48".to_string());
    assert_eq!(summary.current_billing_period_end.to_string(), "2022-10-12 10:39:48".to_string());
  }

  #[test]
  fn test_subscription_summary_extractor_on_update_event() {
    // NB: Actual raw test data from Stripe to our webhook
    let json = r#"
      {"id":"sub_1Lh1wvEU5se17Mekx72OzAzs","automatic_tax":{"enabled":false},
      "billing_cycle_anchor":1662948037,
      "cancel_at_period_end":false,"collection_method":"charge_automatically","created":1662948037,
      "current_period_end":1665540037,"current_period_start":1662948037,
      "customer":"cus_MPrgIen5Wh6QKG",
      "default_payment_method":"pm_1Lh1wtEU5se17MekpirKtMJm","default_tax_rates":[],
      "items":{"data":[{"id":"si_MPrgTAV333Nq7c","created":1662948037,"deleted":false,"metadata":{},
      "price":{"id":"price_1LeDnKEU5se17MekVr1iYYNf","active":true,"billing_scheme":"per_unit",
      "created":1662278586,"currency":"usd","deleted":false,"livemode":false,"metadata":{},
      "product":"prod_MMxi2J5y69VPbO","recurring":{"interval":"month","interval_count":1,
      "usage_type":"licensed"},"tax_behavior":"exclusive","type":"recurring","unit_amount":700,
      "unit_amount_decimal":"700"},"quantity":1,"subscription":"sub_1Lh1wvEU5se17Mekx72OzAzs",
      "tax_rates":[]}],"has_more":false,"total_count":1,
      "url":"/v1/subscription_items?subscription=sub_1Lh1wvEU5se17Mekx72OzAzs"},
      "latest_invoice":"in_1Lh1wvEU5se17MekU99NMi1W","livemode":false,
      "metadata":{"username":"echelon","user_token":"U:token","email":"email@address.com"},
      "payment_settings":{"save_default_payment_method":"off"},
      "start_date":1662948037,"status":"active"}
    "#;

    let subscription = serde_json::from_str::<Subscription>(json).unwrap();

    let summary= subscription_summary_extractor(&subscription).unwrap();

    assert_eq!(summary.user_token, Some("U:token".to_string()));
    assert_eq!(summary.stripe_subscription_id, "sub_1Lh1wvEU5se17Mekx72OzAzs".to_string());
    assert_eq!(summary.stripe_subscription_status, StripeSubscriptionStatus::Active);
    assert_eq!(summary.subscription_is_active, true);
    assert_eq!(summary.stripe_customer_id, "cus_MPrgIen5Wh6QKG".to_string());
    assert_eq!(summary.stripe_product_id, "prod_MMxi2J5y69VPbO".to_string());
    assert_eq!(summary.stripe_price_id, "price_1LeDnKEU5se17MekVr1iYYNf".to_string());
    assert_eq!(summary.subscription_interval, RecurringInterval::Month);
    assert_eq!(summary.stripe_is_production, false);
    assert_eq!(summary.subscription_start_date.to_string(), "2022-09-12 02:00:37".to_string());
    assert_eq!(summary.current_billing_period_start.to_string(), "2022-09-12 02:00:37".to_string());
    assert_eq!(summary.current_billing_period_end.to_string(), "2022-10-12 02:00:37".to_string());
  }

  #[test]
  fn test_subscription_summary_extractor_on_control_panel_immediate_delete_event() {
    // NB: Actual raw test data from Stripe to our webhook
    let json = r#"
      {"id":"sub_1LhA3MEU5se17MekeWvmTNyk","automatic_tax":{"enabled":false},
      "billing_cycle_anchor":1662979188,"cancel_at_period_end":false,"canceled_at":1662979740,
      "collection_method":"charge_automatically","created":1662979188,"current_period_end":1665571188,
      "current_period_start":1662979188,"customer":"cus_MQ03py0gWUh0Ox",
      "default_payment_method":"pm_1LhA3LEU5se17MekViNvoYAx","default_tax_rates":[],
      "ended_at":1662979740,"items":{"data":[{"id":"si_MQ03hadVNfRnaS","created":1662979188,
      "deleted":false,"metadata":{},"price":{"id":"price_1LeDnKEU5se17MekVr1iYYNf","active":true,
      "billing_scheme":"per_unit","created":1662278586,"currency":"usd","deleted":false,
      "livemode":false,"metadata":{},"product":"prod_MMxi2J5y69VPbO",
      "recurring":{"interval":"month","interval_count":1,"usage_type":"licensed"},
      "tax_behavior":"exclusive","type":"recurring","unit_amount":700,"unit_amount_decimal":"700"},
      "quantity":1,"subscription":"sub_1LhA3MEU5se17MekeWvmTNyk","tax_rates":[]}],"has_more":false,
      "total_count":1,
      "url":"/v1/subscription_items?subscription=sub_1LhA3MEU5se17MekeWvmTNyk"},
      "latest_invoice":"in_1LhA3MEU5se17MekUqOhZ9cu","livemode":false,
      "metadata":{"email":"email@email.com","username":"username","user_token":"U:TOKEN"},
      "payment_settings":{"save_default_payment_method":"off"},"start_date":1662979188,
      "status":"canceled"}
    "#;

    let subscription = serde_json::from_str::<Subscription>(json).unwrap();

    let summary= subscription_summary_extractor(&subscription).unwrap();

    assert_eq!(summary.user_token, Some("U:TOKEN".to_string()));
    assert_eq!(summary.stripe_subscription_id, "sub_1LhA3MEU5se17MekeWvmTNyk".to_string());
    assert_eq!(summary.stripe_subscription_status, StripeSubscriptionStatus::Canceled);
    assert_eq!(summary.subscription_is_active, false);
    assert_eq!(summary.stripe_customer_id, "cus_MQ03py0gWUh0Ox".to_string());
    assert_eq!(summary.stripe_product_id, "prod_MMxi2J5y69VPbO".to_string());
    assert_eq!(summary.stripe_price_id, "price_1LeDnKEU5se17MekVr1iYYNf".to_string());
    assert_eq!(summary.subscription_interval, RecurringInterval::Month);
    assert_eq!(summary.stripe_is_production, false);
    assert_eq!(summary.subscription_start_date.to_string(), "2022-09-12 10:39:48".to_string());
    assert_eq!(summary.current_billing_period_start.to_string(), "2022-09-12 10:39:48".to_string());
    assert_eq!(summary.current_billing_period_end.to_string(), "2022-10-12 10:39:48".to_string());
  }
}