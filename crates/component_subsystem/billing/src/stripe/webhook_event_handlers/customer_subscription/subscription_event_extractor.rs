use anyhow::anyhow;
use chrono::{DateTime, Utc};
use stripe::{Price, Subscription, SubscriptionInterval, SubscriptionStatus};
use container_common::anyhow_result::AnyhowResult;
use crate::stripe::helpers::common_metadata_keys::METADATA_USER_TOKEN;
use crate::stripe::helpers::expand_customer_id::expand_customer_id;
use crate::stripe::helpers::expand_product_id::expand_product_id;

pub struct SubscriptionSummary {
  pub user_token: Option<String>,

  pub stripe_is_production: bool,

  pub stripe_subscription_id: String,
  pub stripe_subscription_status: SubscriptionStatus,

  pub stripe_customer_id: String,
  pub stripe_product_id: String,
  pub stripe_price_id: String,

  pub subscription_is_active: bool,
  pub billed_at: DateTime<Utc>,

  /// Tell the update handler how many days in the future to set the plan.
  pub subscription_interval: SubscriptionInterval,
  /// Calculated from interval
  pub subscription_expires_at: DateTime<Utc>,
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

  Ok(SubscriptionSummary {
    user_token: maybe_user_token,
    stripe_subscription_id: subscription_id,
    stripe_is_production: subscription.livemode,
    stripe_customer_id: expand_customer_id(&subscription.customer),
    stripe_subscription_status: subscription.status,
    stripe_product_id: expand_product_id(product),
    stripe_price_id: price.id.to_string(),
    subscription_is_active: subscription.status == SubscriptionStatus::Active,
    billed_at: Utc::now(),
    subscription_interval: Default::default(),
    subscription_expires_at: Utc::now(),
  })
}

#[cfg(test)]
mod tests {
  use stripe::{Subscription, SubscriptionStatus};
  use crate::stripe::webhook_event_handlers::customer_subscription::subscription_event_extractor::subscription_summary_extractor;

  #[test]
  fn test_subscription_summary_extractor() {
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
    assert_eq!(summary.stripe_subscription_status, SubscriptionStatus::Active);
    assert_eq!(summary.subscription_is_active, true);
    assert_eq!(summary.stripe_customer_id, "cus_MPrgIen5Wh6QKG".to_string());
    assert_eq!(summary.stripe_product_id, "prod_MMxi2J5y69VPbO".to_string());
    assert_eq!(summary.stripe_price_id, "price_1LeDnKEU5se17MekVr1iYYNf".to_string());
    assert_eq!(summary.stripe_is_production, false);
  }
}