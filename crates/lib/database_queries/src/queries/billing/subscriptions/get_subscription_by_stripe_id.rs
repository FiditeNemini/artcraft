use anyhow::anyhow;
use chrono::{DateTime, NaiveDateTime, Utc};
use container_common::anyhow_result::AnyhowResult;
use crate::helpers::boolean_converters::nullable_i8_to_optional_bool;
use log::warn;
use reusable_types::stripe::stripe_subscription_status::StripeSubscriptionStatus;
use sqlx::MySqlPool;

pub struct UserSubscription {
  pub token: String,
  pub maybe_user_token: Option<String>,
  pub subscription_category: String,
  pub subscription_product_key: String,
  pub maybe_stripe_subscription_id: Option<String>,
  pub maybe_stripe_product_id: Option<String>,
  pub maybe_stripe_customer_id: Option<String>,
  pub maybe_stripe_subscription_status: Option<StripeSubscriptionStatus>,
  pub maybe_stripe_is_production: Option<bool>,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
  pub subscription_created_at: DateTime<Utc>,
  pub subscription_expires_at: DateTime<Utc>,
}

pub async fn get_subscription_by_stripe_id(
  stripe_subscription_id: &str,
  mysql_pool: &MySqlPool
) -> AnyhowResult<Option<UserSubscription>> {

  let maybe_user_record = sqlx::query_as!(
      RawUserSubscriptionFromDb,
        r#"
SELECT
  token,
  maybe_user_token,
  subscription_category,
  subscription_product_key,
  maybe_stripe_subscription_id,
  maybe_stripe_customer_id,
  maybe_stripe_product_id,
  maybe_stripe_subscription_status as `maybe_stripe_subscription_status: reusable_types::stripe::stripe_subscription_status::StripeSubscriptionStatus`,
  maybe_stripe_is_production,
  created_at,
  updated_at,
  subscription_created_at,
  subscription_expires_at
FROM user_subscriptions
WHERE
  maybe_stripe_subscription_id = ?
        "#,
        stripe_subscription_id,
    )
      .fetch_one(mysql_pool)
      .await;

  match maybe_user_record {
    Err(sqlx::error::Error::RowNotFound) => Ok(None),
    Err(e) => {
      Err(anyhow!("mysql query error: {:?}", e))
    }
    Ok(r) => {
      Ok(Some(UserSubscription {
        token: r.token,
        maybe_user_token: r.maybe_user_token,
        subscription_category: r.subscription_category,
        subscription_product_key: r.subscription_product_key,
        maybe_stripe_subscription_id: r.maybe_stripe_subscription_id,
        maybe_stripe_product_id: r.maybe_stripe_product_id,
        maybe_stripe_customer_id: r.maybe_stripe_customer_id,
        maybe_stripe_subscription_status: r.maybe_stripe_subscription_status,
        maybe_stripe_is_production: nullable_i8_to_optional_bool(r.maybe_stripe_is_production),
        created_at: r.created_at,
        updated_at: r.updated_at,
        subscription_created_at: r.subscription_created_at,
        subscription_expires_at: r.subscription_expires_at,
      }))
    },
  }
}

struct RawUserSubscriptionFromDb {
  pub token: String,
  pub maybe_user_token: Option<String>,
  pub subscription_category: String,
  pub subscription_product_key: String,
  pub maybe_stripe_subscription_id: Option<String>,
  pub maybe_stripe_product_id: Option<String>,
  pub maybe_stripe_customer_id: Option<String>,
  pub maybe_stripe_subscription_status: Option<StripeSubscriptionStatus>,
  pub maybe_stripe_is_production: Option<i8>,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
  pub subscription_created_at: DateTime<Utc>,
  pub subscription_expires_at: DateTime<Utc>,
}
