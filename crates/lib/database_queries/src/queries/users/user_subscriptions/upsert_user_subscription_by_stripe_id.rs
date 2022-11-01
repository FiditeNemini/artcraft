use anyhow::anyhow;
use chrono::NaiveDateTime;
use container_common::anyhow_result::AnyhowResult;
use crate::tokens::Tokens;
use reusable_types::stripe::stripe_recurring_interval::StripeRecurringInterval;
use reusable_types::stripe::stripe_subscription_status::StripeSubscriptionStatus;
use sqlx::MySqlPool;

// TODO: Make a trait with default impls to handle common query concerns.

pub struct UpsertUserSubscription<'a> {
  /// Stripe's assigned ID for the subscription
  /// This acts as an externally-provided unique key for records in this table.
  pub stripe_subscription_id: &'a str,

  /// Internal user token
  pub maybe_user_token: Option<&'a str>,

  /// The platform key, eg. "fakeyou", "storyteller_stream", "symphonia", etc.
  pub subscription_category: &'a str,

  /// The name of the product the user is subscribing to within the category.
  pub subscription_product_key: &'a str,

  pub maybe_stripe_customer_id: Option<&'a str>,

  pub maybe_stripe_product_id: Option<&'a str>,
  pub maybe_stripe_price_id: Option<&'a str>,

  pub maybe_stripe_recurring_interval : Option<StripeRecurringInterval>,
  pub maybe_stripe_subscription_status: Option<StripeSubscriptionStatus>,
  pub maybe_stripe_is_production: Option<bool>,

  /// When the subscription was created in Stripe.
  /// This may predate Stripe's subscription object `created` field due to backdating.
  pub subscription_start_at: NaiveDateTime,

  // Billing periods for the subscription...

  pub current_billing_period_start_at: NaiveDateTime,
  pub current_billing_period_end_at: NaiveDateTime,

  /// When the subscription is set to expire.
  /// This controls whether it is active or not.
  pub subscription_expires_at: NaiveDateTime,

  // Subscription cancellation (future and past)
  pub maybe_cancel_at: Option<NaiveDateTime>,
  pub maybe_canceled_at: Option<NaiveDateTime>,
}

impl <'a> UpsertUserSubscription<'a> {

  pub async fn upsert(&'a self, mysql_pool: &MySqlPool) -> AnyhowResult<()> {
    let token = Tokens::new_subscription_token()?;

    // NB: The following behaviors are intentional
    //  - We only set the "token" initially.
    //  - Likewise, the stripe_subscription_id will remain constant.
    //  - The user token is updated to the new value so long as we don't
    //    attempt to set it to null or empty.
    //  - The various subscription dates, expiry, and statuses can change.
    //  - The product and price can change (eg. upgrades, downgrades).
    //  - Other "static" fields do not need to change on update, either.
    let query = sqlx::query!(
        r#"
INSERT INTO user_subscriptions
SET
  token = ?,
  maybe_user_token = ?,
  subscription_category = ?,
  subscription_product_key = ?,

  maybe_stripe_subscription_id = ?,
  maybe_stripe_customer_id = ?,

  maybe_stripe_product_id = ?,
  maybe_stripe_price_id = ?,

  maybe_stripe_recurring_interval = ?,
  maybe_stripe_subscription_status = ?,
  maybe_stripe_is_production = ?,

  subscription_start_at = ?,
  current_billing_period_start_at = ?,
  current_billing_period_end_at = ?,
  subscription_expires_at = ?,
  maybe_cancel_at = ?,
  maybe_canceled_at = ?,

  version = version + 1

ON DUPLICATE KEY UPDATE
  maybe_user_token = COALESCE(NULLIF(?, ''), maybe_user_token),

  subscription_category = ?,
  subscription_product_key = ?,

  maybe_stripe_product_id = ?,
  maybe_stripe_price_id = ?,

  maybe_stripe_recurring_interval = ?,
  maybe_stripe_subscription_status = ?,

  current_billing_period_start_at = ?,
  current_billing_period_end_at = ?,
  subscription_expires_at = ?,
  maybe_cancel_at = ?,
  maybe_canceled_at = ?,

  version = version + 1
        "#,
      // Insert
      token,
      self.maybe_user_token,
      self.subscription_category,
      self.subscription_product_key,

      self.stripe_subscription_id,
      self.maybe_stripe_customer_id,

      self.maybe_stripe_product_id,
      self.maybe_stripe_price_id,

      self.maybe_stripe_recurring_interval.as_deref(),
      self.maybe_stripe_subscription_status.as_deref(),
      self.maybe_stripe_is_production,

      self.subscription_start_at,
      self.current_billing_period_start_at,
      self.current_billing_period_end_at,
      self.subscription_expires_at,
      self.maybe_cancel_at,
      self.maybe_canceled_at,

      // Upsert
      self.maybe_user_token,
      
      self.subscription_category,
      self.subscription_product_key,

      self.maybe_stripe_product_id,
      self.maybe_stripe_price_id,

      self.maybe_stripe_recurring_interval.as_deref(),
      self.maybe_stripe_subscription_status.as_deref(),

      self.current_billing_period_start_at,
      self.current_billing_period_end_at,
      self.subscription_expires_at,
      self.maybe_cancel_at,
      self.maybe_canceled_at,
    );

    let query_result = query.execute(mysql_pool).await;

    let _record_id = match query_result {
      Ok(res) => res.last_insert_id(),
      Err(err) => return Err(anyhow!("Error upserting subscription record: {:?}", err)),
    };

    Ok(())
  }
}
